import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import SearchEngineSelector from
    "../components/search/SearchEngineSelector";
import SearchHistory from "../components/search/SearchHistory";

import {
    ENGINE_STORAGE_KEY,
    getSelectedEngine,
    type SearchEngine,
} from "../data/searchEngines";

import { buildSearchUrl } from "../utils/search";
import { useSearchHistory } from "../hooks/useSearchHistory";

import "../../css/search-engine.css";
import "../styles/web-search.css";

export default function WebSearch() {
    const [query, setQuery] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const { items, saveSearch, deleteSearch, clearHistory } = useSearchHistory();

    const [engine, setEngine] = useState<SearchEngine>(
        getSelectedEngine
    );

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target;

            if (
                event.key === "/" &&
                !event.ctrlKey &&
                !event.altKey &&
                !event.metaKey &&
                !(target instanceof HTMLInputElement) &&
                !(target instanceof HTMLTextAreaElement) &&
                !(target instanceof HTMLSelectElement) &&
                !(target instanceof HTMLElement &&
                    target.isContentEditable)
            ) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function handleEngineChange(selectedEngine: SearchEngine) {
        setEngine(selectedEngine);

        localStorage.setItem(
            ENGINE_STORAGE_KEY,
            selectedEngine
        );
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const input = query.trim();

        if (!input) {
            inputRef.current?.focus();
            return;
        }

        submitSearch(input);
    }

    function submitSearch(value: string) {
        setQuery(value);
        setIsHistoryOpen(false);
        saveSearch(value);
        window.location.assign(buildSearchUrl(value, engine));
    }

    return (
        <div className="container">
            <form className="web-search-form" onSubmit={handleSubmit}>
                <div className="search-wrapper">
                    <div className="search-input-wrap">
                        <input
                            ref={inputRef}
                            id="searchInput"
                            className="search-bar"
                            type="text"
                            placeholder="Search or enter a URL"
                            aria-label="Search or enter a URL"
                            autoComplete="off"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setIsHistoryOpen(false);
                            }}
                        />

                        <SearchEngineSelector
                            value={engine}
                            onChange={handleEngineChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="search-but"
                        id="search-button"
                    >
                        Search
                    </button>

                    <SearchHistory
                        items={items}
                        isOpen={isHistoryOpen}
                        inputRef={inputRef}
                        onOpenChange={setIsHistoryOpen}
                        onSearch={submitSearch}
                        onDelete={deleteSearch}
                        onClear={clearHistory}
                    />
                </div>
            </form>
        </div>
    );
}
