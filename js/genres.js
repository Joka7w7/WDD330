import { tmdbGetExternalIds } from "./api.js";
import { qs, createElement } from "./utils.js";
import { TMDB_KEY } from "./api.js";

const buttons = document.querySelectorAll(".genre-btn");
const results = qs("#genreResults");
const title = qs("#genreTitle");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const name = btn.textContent;
        loadGenre(id, name);
    });
});

async function loadGenre(genreId, name) {
    title.textContent = `${name} Movies`;
    title.classList.remove("hidden");
    results.innerHTML = `<p>Loading...</p>`;

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        results.innerHTML = "";

        data.results.slice(0, 30).forEach(async movie => {
            const ids = await tmdbGetExternalIds(movie.id);
            if (!ids.imdb_id) return;

            const link = createElement("a", "");
            link.href = `movie.html?id=${ids.imdb_id}`;

            const img = createElement("img", "");
            img.src = movie.poster_path
                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                : "./images/placeholder.png";

            link.appendChild(img);
            results.appendChild(link);
        });

    } catch (err) {
        console.error("Genre load error", err);
        results.innerHTML = "<p>Error loading movies.</p>";
    }
}

// Auto-load default genre on first view
window.addEventListener("DOMContentLoaded", () => {
    const firstBtn = document.querySelector(".genre-btn");
    if (firstBtn) {
        firstBtn.click();
    }
});

// HAMBURGER MENU (MOBILE)
const hamburgerBtn = document.querySelector("#hamburgerBtn");
const mainNav = document.querySelector("#mainNav");

hamburgerBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
});