
export const OMDB_KEY = '1d9d0623';
export const TMDB_KEY = '858462425f420268618bb7c403c636c5';

const OMDB_BASE = `https://www.omdbapi.com/?apikey=${OMDB_KEY}`;
const TMDB_BASE = `https://api.themoviedb.org/3`;

async function safeFetch(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("API Fetch Error:", err, "\nURL:", url);
        return null;
    }
}


// =============================
// OMDb FUNCTIONS
// =============================

// Search by title
export async function omdbSearch(query) {
    return safeFetch(`${OMDB_BASE}&s=${encodeURIComponent(query)}`);
}

// Get full movie details by IMDb ID
export async function omdbGetById(imdbID) {
    return safeFetch(`${OMDB_BASE}&i=${imdbID}&plot=full`);
}


// =============================
// TMDb FUNCTIONS
// =============================

// Popular Movies
export async function tmdbGetPopular() {
    return safeFetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US`);
}

// Trending Movies
export async function tmdbGetTrending() {
    return safeFetch(`${TMDB_BASE}/trending/movie/day?api_key=${TMDB_KEY}`);
}

// Now Playing
export async function tmdbGetNowPlaying() {
    return safeFetch(`${TMDB_BASE}/movie/now_playing?api_key=${TMDB_KEY}&language=en-US`);
}

// External IDs (IMDb, etc.)
export async function tmdbGetExternalIds(tmdbId) {
    return safeFetch(`${TMDB_BASE}/movie/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
}

// Find TMDb movie from IMDb ID
export async function tmdbSearchByImdb(imdbID) {
    return safeFetch(
        `${TMDB_BASE}/find/${imdbID}?api_key=${TMDB_KEY}&external_source=imdb_id`
    ).then(data => {
        return data?.movie_results?.length ? data.movie_results[0] : null;
    });
}

// Credits (cast)
export async function tmdbGetCredits(tmdbId) {
    return safeFetch(`${TMDB_BASE}/movie/${tmdbId}/credits?api_key=${TMDB_KEY}`);
}

// Videos (trailers)
export async function tmdbGetVideos(tmdbId) {
    return safeFetch(`${TMDB_BASE}/movie/${tmdbId}/videos?api_key=${TMDB_KEY}`);
}

// Recommendations (related movies)
export async function tmdbGetRecommendations(movieId) {
    return safeFetch(
        `${TMDB_BASE}/movie/${movieId}/recommendations?api_key=${TMDB_KEY}&language=en-US`
    );
}
