export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

/**
 * Create an element with optional class name(s) and attributes.
 * 
 * @param {string} tag - The HTML tag (e.g., "div", "img", "a")
 * @param {string} classNames - One or multiple classes separated by spaces
 * @param {object} attrs - Attributes object, like { href: "#", src: "img.jpg" }
 */
export function createElement(tag, classNames = "", attrs = {}) {
    const el = document.createElement(tag);

    if (classNames) {
        el.className = classNames;
    }

    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }

    return el;
}

export function formatRuntime(minutes) {
    if (!minutes || isNaN(minutes)) return "";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h}h ${m}m`;
}

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
