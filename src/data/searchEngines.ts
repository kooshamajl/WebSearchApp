export const SEARCH_ENGINES = {
    google: {
        name: "Google",
        searchUrl: "https://www.google.com/search?q=",
    },
    bing: {
        name: "Bing",
        searchUrl: "https://www.bing.com/search?q=",
    },
    duckduckgo: {
        name: "DuckDuckGo",
        searchUrl: "https://duckduckgo.com/?q=",
    },
};

export type SearchEngine = keyof typeof SEARCH_ENGINES;

export const DEFAULT_ENGINE: SearchEngine = "google";
export const ENGINE_STORAGE_KEY = "selectedSearchEngine";

export function getSelectedEngine(): SearchEngine {
    try {
        const stored = localStorage.getItem(ENGINE_STORAGE_KEY);

        if (stored && Object.hasOwn(SEARCH_ENGINES, stored)) return stored as SearchEngine;
    } catch {
        // Use the default engine when storage is unavailable.
    }

    return DEFAULT_ENGINE;
}
