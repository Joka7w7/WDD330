import {
    omdbSearch,
    tmdbGetPopular,
    tmdbGetTrending,
    tmdbGetNowPlaying,
    tmdbGetExternalIds
} from './api.js';

import { qs, createElement } from './utils.js';

// INPUTS / SEARCH
const input = qs('#searchInput');
const btn = qs('#searchBtn');

// SEARCH RESULT AREAS
const results = qs('#results');
const resultsSection = qs('#resultsSection');
const emptyState = qs('#emptyState');
const backHomeBtn = qs('#backHomeBtn');

// HOMEPAGE SECTIONS
const homeHero = qs('#homeHero');
const homeAbout = qs('#homeAbout');
const homeHighlights = qs('#homeHighlights');
const homeFeatured = qs('#homeFeatured');
const homeInfoBlocks = qs('#homeInfoBlocks');
const homeJoin = qs('#homeJoin');
const heroBanner = qs('#homeHero');
const homeSubscribe = qs('#homeSubscribe');

// HOMEPAGE MOVIE ROWS
const popularContainer = qs('#popularMovies');
const trendingContainer = qs('#trendingMovies');
const newContainer = qs('#newMovies');

// INITIAL LOAD
window.addEventListener("DOMContentLoaded", loadHomepage);

async function loadHomepage() {
    loadPopular();
    loadTrending();
    loadNewReleases();
}

// ========== SEARCH ==========
btn.addEventListener('click', () => doSearch());
input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
});

// Support hero button
const heroBtn = qs('#heroSearchBtn');
if (heroBtn) {
    heroBtn.addEventListener('click', () => {
        input.focus();
        input.scrollIntoView({ behavior: "smooth" });
    });
}

async function doSearch() {
    const q = input.value.trim();
    if (!q) return;

    hideHomepage();
    resultsSection.classList.remove("hidden");
    backHomeBtn.classList.remove("hidden");
    emptyState.classList.add("hidden");

    showLoading();

    const res = await omdbSearch(q);

    hideLoading();

    if (!res || res.Response === "False") {
        results.innerHTML = "<div class='empty'>No results found.</div>";
        emptyState.classList.remove("hidden");
        return;
    }

    renderMovieList(results, res.Search);

    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ========== HOMEPAGE SECTIONS ==========

async function loadPopular() {
    const data = await tmdbGetPopular();
    renderMovieRow(popularContainer, data.results);
}

async function loadTrending() {
    const data = await tmdbGetTrending();
    renderMovieRow(trendingContainer, data.results);
}

async function loadNewReleases() {
    const data = await tmdbGetNowPlaying();
    renderMovieRow(newContainer, data.results);
}

// ========== RENDER FUNCTIONS ==========

async function renderMovieRow(container, list) {
    container.innerHTML = "";

    for (const movie of list.slice(0, 6)) {
        const ids = await tmdbGetExternalIds(movie.id);
        if (!ids.imdb_id) continue;

        const link = createElement("a", "poster-mini", {
            href: `movie.html?id=${ids.imdb_id}`
        });

        const img = createElement("img", "");
        img.src = movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : "./images/placeholder.png";

        link.appendChild(img);
        container.appendChild(link);
    }
}

function renderMovieList(container, list) {
    container.innerHTML = "";

    list.forEach(m => {
        const card = createElement("a", "movie-card", {
            href: `movie.html?id=${m.imdbID}`
        });

        const img = createElement("div", "poster");
        img.style.backgroundImage =
            m.Poster && m.Poster !== "N/A"
                ? `url(${m.Poster})`
                : "url('./images/placeholder.png')";

        const title = createElement("div", "title");
        title.textContent = m.Title;

        card.appendChild(img);
        card.appendChild(title);

        container.appendChild(card);
    });
}

// ========== LOADING UI ==========

function showLoading() {
    results.innerHTML = `<div class="loading">Loading...</div>`;
}

function hideLoading() {
    const loader = qs('.loading');
    if (loader) loader.remove();
}

// ========== SHOW/HIDE HOMEPAGE ==========

function hideHomepage() {
    [
        homeHero,
        homeAbout,
        homeHighlights,
        homeTrending,
        homeFeatured,
        homeInfoBlocks,
        homeSubscribe,
        popularContainer,
        trendingContainer,
        newContainer
    ].forEach(el => el && el.classList.add("hidden"));
}

function showHomepage() {
    [
        homeHero,
        homeAbout,
        homeHighlights,
        homeTrending,
        homeFeatured,
        homeInfoBlocks,
        homeSubscribe,
        popularContainer,
        trendingContainer,
        newContainer
    ].forEach(el => el && el.classList.remove("hidden"));

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// BACK TO HOME BUTTON
if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
        showHomepage();
        resultsSection.classList.add("hidden");
        backHomeBtn.classList.add("hidden");
        results.innerHTML = "";
    });
}

// HAMBURGER MENU (MOBILE)
const hamburgerBtn = document.querySelector("#hamburgerBtn");
const mainNav = document.querySelector("#mainNav");

hamburgerBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
});

// BANNER IMAGE SETUP WITH PRELOAD + FADE
let lastBackdrop = "";

async function loadHeroBanner() {
    const data = await tmdbGetTrending();
    if (!data || !data.results) return;

    let pool = data.results.filter(m => m.backdrop_path);

    pool = pool.filter(m => m.backdrop_path !== lastBackdrop);

    const random = pool[Math.floor(Math.random() * pool.length)];

    lastBackdrop = random.backdrop_path;

    const url = `https://image.tmdb.org/t/p/original${random.backdrop_path}`;
    const hero = document.querySelector("#homeHero");
    const img = new Image();

    img.src = url;
    img.onload = () => {
        hero.style.opacity = 0;

        setTimeout(() => {
            hero.style.backgroundImage = `url(${url})`;
            hero.style.opacity = 1;
        }, 300);
    };
}

window.addEventListener("DOMContentLoaded", () => {
    loadHeroBanner();
});

setInterval(loadHeroBanner, 7000);

// Subscribe Form
const form = qs("#subscribeForm");
const emailInput = qs("#emailInput");
const successMsg = qs("#successMsg");

const SUBSCRIBE_KEY = "cinefind_subscribers";

form.addEventListener("submit", e => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) return;

    let list = JSON.parse(localStorage.getItem(SUBSCRIBE_KEY) || "[]");

    if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem(SUBSCRIBE_KEY, JSON.stringify(list));
    }

    emailInput.value = "";
    successMsg.classList.remove("hidden");

    setTimeout(() => {
        successMsg.classList.add("hidden");
    }, 3000);
});
