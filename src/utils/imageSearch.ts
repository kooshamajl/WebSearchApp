import { IMAGE_SEARCH_SUGGESTIONS } from "../data/imageSearchSuggestions";

const HISTORY_KEY = "imageSearchHistory";
const HISTORY_LIMIT = 10;

export function readImageSearchHistory(): string[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
        if (!Array.isArray(stored)) return [];

        const history = new Map<string, string>();
        for (const entry of stored as unknown[]) {
            if (typeof entry !== "string") continue;

            const value = entry.trim();
            const normalized = value.toLowerCase();
            if (value && !history.has(normalized)) history.set(normalized, value);
            if (history.size === HISTORY_LIMIT) break;
        }
        return [...history.values()];
    } catch {
        return [];
    }
}

export function saveImageSearchHistory(query: string): string[] {
    const normalized = query.toLowerCase();
    const previous = readImageSearchHistory().filter((entry) => entry.toLowerCase() !== normalized);
    const history = [query, ...previous].slice(0, HISTORY_LIMIT);

    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
        // The search still works if storage is unavailable.
    }
    return history;
}

function shortestPrefixMatch(entries: readonly string[], query: string): string | undefined {
    const prefix = query.toLowerCase();
    let best: string | undefined;

    for (const entry of entries) {
        if (entry.length <= query.length || !entry.toLowerCase().startsWith(prefix)) continue;
        if (!best || entry.length < best.length ||
            (entry.length === best.length && entry.toLowerCase() < best.toLowerCase())) {
            best = entry;
        }
    }
    return best;
}

export function getImageSearchSuggestion(query: string, history: readonly string[]): string | undefined {
    if (!query) return undefined;

    return shortestPrefixMatch(history, query) ?? shortestPrefixMatch(IMAGE_SEARCH_SUGGESTIONS, query);
}

export function buildImageSearchUrl(query: string): string {
    const params = new URLSearchParams({ q: query, tbm: "isch" });
    return `https://www.google.com/search?${params}`;
}
