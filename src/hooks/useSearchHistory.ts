import { useState } from "react";

export type SearchHistoryItem = {
    value: string;
    time: number | null;
};

const STORAGE_KEY = "history";
const HISTORY_LIMIT = 5;

function readHistory(): SearchHistoryItem[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        if (!Array.isArray(stored)) {
            return [];
        }

        const items: SearchHistoryItem[] = [];
        for (const entry of stored as unknown[]) {
            const item = typeof entry === "string" ? { value: entry } : entry;
            if (!item || typeof item !== "object" || !("value" in item) ||
                typeof item.value !== "string") {
                continue;
            }

            const value = item.value.trim();
            if (!value || items.some((saved) => saved.value === value)) {
                continue;
            }

            const time = "time" in item ? item.time : null;
            items.push({
                value,
                time: typeof time === "number" && Number.isFinite(new Date(time).getTime())
                    ? time : null,
            });

            if (items.length === HISTORY_LIMIT) {
                break;
            }
        }

        return items;
    } catch {
        return [];
    }
}

export function useSearchHistory() {
    const [items, setItems] = useState(readHistory);

    function updateHistory(nextItems: SearchHistoryItem[]) {
        setItems(nextItems);
        try {
            // Write before submitting a search navigates away from the app.
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
        } catch {
            // History still works in memory when the browser rejects persistence.
        }
    }

    function saveSearch(value: string) {
        updateHistory([
            { value, time: Date.now() },
            ...items.filter((item) => item.value !== value),
        ].slice(0, HISTORY_LIMIT));
    }

    function deleteSearch(value: string) {
        updateHistory(items.filter((item) => item.value !== value));
    }

    function clearHistory() {
        updateHistory([]);
    }

    return { items, saveSearch, deleteSearch, clearHistory };
}
