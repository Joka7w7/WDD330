import {
    omdbGetById,
    tmdbSearchByImdb,
    tmdbGetExternalIds,
    tmdbGetCredits,
    tmdbGetRecommendations,
    tmdbGetVideos
} from "./api.js";

import { qs, createElement } from "./utils.js";


// ---------- DOM ELEMENTS ----------
const posterEl = qs("#moviePoster");
const titleEl = qs("#movieTitle");
const yearEl = qs("#movieYear");
const genreEl = qs("#movieGenre");
const runtimeEl = qs("#movieRuntime");
const ratingEl = qs("#movieRating");
const plotEl = qs("#moviePlot");

const castList = qs("#castList");
const recommendedRow = qs("#recommendedMovies");
const watchlistBtn = qs("#watchlistBtn");


// ---------- LOAD MOVIE ON PAGE OPEN ----------
window.addEventListener("DOMContentLoaded", initMoviePage);

async function initMoviePage() {
    const params = new URLSearchParams(window.location.search);
    const imdbID = params.get("id");

    if (!imdbID) {
        alert("No movie ID found.");
        return;
    }

    loadMovieDetails(imdbID);
    loadCast(imdbID);
    loadRecommended(imdbID);
    loadTrailer(imdbID);
    setupWatchlistButton(imdbID);
}


// ============================================================
// 1) LOAD MOVIE DETAILS (OMDb + TMDb data merged)
// ============================================================

async function loadMovieDetails(imdbID) {
    const data = await omdbGetById(imdbID);

    if (!data || data.Response === "False") {
        titleEl.textContent = "Movie not found";
        return;
    }

    titleEl.textContent = data.Title;
    yearEl.textContent = data.Year;
    genreEl.textContent = data.Genre;
    runtimeEl.textContent = data.Runtime;
    renderStars(data.imdbRating);

    posterEl.src = data.Poster && data.Poster !== "N/A"
        ? data.Poster
        : "./assets/placeholder.png";

    plotEl.textContent = data.Plot;
}



// ============================================================
// 2) LOAD CAST (TMDb credits)
// ============================================================

async function loadCast(imdbID) {
    const tmdbMovie = await tmdbSearchByImdb(imdbID);
    if (!tmdbMovie || !tmdbMovie.id) return;

    const credits = await tmdbGetCredits(tmdbMovie.id);
    if (!credits || !credits.cast) return;

    castList.innerHTML = "";

    credits.cast.slice(0, 12).forEach(actor => {
        const card = createElement("div", "cast-card");

        const img = createElement("img");
        img.src = actor.profile_path
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : "./assets/user_placeholder.jpg";

        const name = createElement("p");
        name.textContent = actor.name;

        card.appendChild(img);
        card.appendChild(name);
        castList.appendChild(card);
    });
}



// ============================================================
// 3) LOAD RECOMMENDED MOVIES
// ============================================================

async function loadRecommended(imdbID) {
    const tmdbMovie = await tmdbSearchByImdb(imdbID);
    if (!tmdbMovie || !tmdbMovie.id) return;

    const rec = await tmdbGetRecommendations(tmdbMovie.id);
    if (!rec || !rec.results) return;

    recommendedRow.innerHTML = "";

    rec.results.slice(0, 10).forEach(async movie => {

        // Get IMDb ID first
        const ids = await tmdbGetExternalIds(movie.id);
        if (!ids || !ids.imdb_id) return;

        const link = createElement("a", "");
        link.href = `movie.html?id=${ids.imdb_id}`;

        const img = createElement("img");
        img.src = movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : "./assets/placeholder.png";

        link.appendChild(img);
        recommendedRow.appendChild(link);
    });
}



// ============================================================
// 4) WATCHLIST LOGIC
// ============================================================

function setupWatchlistButton(imdbID) {
    updateWatchlistButton(imdbID);

    watchlistBtn.addEventListener("click", () => {
        toggleWatchlist(imdbID);
        updateWatchlistButton(imdbID);
    });
}

function toggleWatchlist(imdbID) {
    let list = JSON.parse(localStorage.getItem("watchlist") || "[]");

    if (list.includes(imdbID)) {
        list = list.filter(id => id !== imdbID);
    } else {
        list.push(imdbID);
    }

    localStorage.setItem("watchlist", JSON.stringify(list));
}

function updateWatchlistButton(imdbID) {
    const list = JSON.parse(localStorage.getItem("watchlist") || "[]");

    if (list.includes(imdbID)) {
        watchlistBtn.textContent = "Remove from Watchlist";
        watchlistBtn.classList.add("active");
    } else {
        watchlistBtn.textContent = "Add to Watchlist";
        watchlistBtn.classList.remove("active");
    }
}

// ============================================================
// 5) LOAD TRAILER BUTTON
// ============================================================

async function loadTrailer(imdbID) {
    const tmdbMovie = await tmdbSearchByImdb(imdbID);
    if (!tmdbMovie) return;

    const videos = await tmdbGetVideos(tmdbMovie.id);
    if (!videos || !videos.results) return;

    const trailer = videos.results.find(v =>
        v.type === "Trailer" && v.site === "YouTube"
    );

    const trailerBtn = qs("#trailerBtn");

    if (trailer) {
        trailerBtn.onclick = () => {
            window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
        };
    } else {
        trailerBtn.disabled = true;
        trailerBtn.textContent = "Trailer Not Available";
    }
}

// ============================================================
// 6) RENDER STAR RATING
// ============================================================

function renderStars(rating) {
    const container = qs("#starRating");
    container.innerHTML = "";

    const stars = Math.round(parseFloat(rating)); // 7.8 → 8

    for (let i = 1; i <= 10; i++) {
        const star = createElement("span", "star");
        star.textContent = i <= stars ? "★" : "☆";
        if (i > stars) star.classList.add("inactive");
        container.appendChild(star);
    }
}
