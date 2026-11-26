import {
    SEARCH_ENGINES,
    type SearchEngine,
} from "../data/searchEngines";

export function isLikelyUrl(value: string): boolean {
    if (/\s/.test(value)) {
        return false;
    }

    if (/^https?:\/\//i.test(value)) {
        return true;
    }

    return /^([\w-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(value);
}

export function buildSearchUrl(
    query: string,
    engine: SearchEngine
): string {
    const input = query.trim();

    if (isLikelyUrl(input)) {
        return /^https?:\/\//i.test(input)
            ? input
            : `https://${input}`;
    }

    return (
        SEARCH_ENGINES[engine].searchUrl +
        encodeURIComponent(input)
    );
}