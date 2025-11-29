import { qs, createElement } from "./utils.js";

const LIST_KEY = "cinefind_watchlist";
const grid = qs("#watchlistGrid");
const empty = qs("#emptyWatchlist");
const sortSelect = qs("#sortSelect");

function load() {
    let list = getList();

    if (!list.length) {
        empty.classList.remove("hidden");
        grid.innerHTML = "";
        return;
    }

    empty.classList.add("hidden");

    if (sortSelect.value === "alpha") {
        list.sort((a, b) => a.Title.localeCompare(b.Title));
    }

    render(list);
}

function render(list) {
    grid.innerHTML = "";

    list.forEach(m => {
        const card = createElement("a", "movie-card", {
            href: `movie.html?id=${m.imdbID}`
        });

        const img = createElement("div", "poster");
        img.style.backgroundImage =
            m.Poster && m.Poster !== "N/A"
                ? `url(${m.Poster})`
                : "url('./assets/placeholder.png')";

        const title = createElement("div", "title");
        title.textContent = m.Title;

        const remove = createElement("button", "btn outline remove-btn");
        remove.textContent = "Remove";
        remove.addEventListener("click", e => {
            e.preventDefault();
            removeItem(m.imdbID);
        });

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(remove);

        grid.appendChild(card);
    });
}

function getList() {
    return JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
}

function removeItem(id) {
    const updated = getList().filter(m => m.imdbID !== id);
    localStorage.setItem(LIST_KEY, JSON.stringify(updated));
    load();
}

sortSelect.addEventListener("change", load);
window.addEventListener("DOMContentLoaded", load);
