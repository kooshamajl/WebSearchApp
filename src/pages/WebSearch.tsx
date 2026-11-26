import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import SearchEngineSelector from
    "../components/search/SearchEngineSelector";

import {
    ENGINE_STORAGE_KEY,
    getSelectedEngine,
    type SearchEngine,
} from "../data/searchEngines";

import { buildSearchUrl } from "../utils/search";

import "../../css/history-search.css";
import "../../css/search-engine.css";
import "../styles/web-search.css";

export default function WebSearch() {
    const [query, setQuery] = useState("");

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

        window.location.assign(
            buildSearchUrl(input, engine)
        );
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
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
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
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
                </div>
            </form>
        </div>
    );
}