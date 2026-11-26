import { POPULAR_SITES } from "../data/popularSites";
import type { SearchHistoryItem } from "../hooks/useSearchHistory";

type SearchSuggestion = {
    type: "history" | "site";
    label: string;
    value: string;
};

const MAX_SUGGESTIONS = 6;
const MAX_HISTORY_SUGGESTIONS = 4;

export function getSearchSuggestions(
    query: string,
    history: readonly SearchHistoryItem[],
): SearchSuggestion[] {
    const match = query.trim().toLowerCase();
    if (!match) return [];

    const historyMatches = history
        .filter(({ value }) => value.toLowerCase().includes(match))
        .slice(0, MAX_HISTORY_SUGGESTIONS);
    const historyValues = new Set(historyMatches.map(({ value }) => value.toLowerCase()));

    const siteMatches = POPULAR_SITES.filter(({ name, url }) => {
        const domain = url.toLowerCase();
        return !historyValues.has(domain) && (name.toLowerCase().includes(match) || domain.includes(match));
    }).slice(0, MAX_SUGGESTIONS - historyMatches.length);

    return [
        ...historyMatches.map<SearchSuggestion>(({ value }) => ({ type: "history", label: value, value })),
        ...siteMatches.map<SearchSuggestion>(({ name, url }) => ({ type: "site", label: name, value: url })),
    ];
}
