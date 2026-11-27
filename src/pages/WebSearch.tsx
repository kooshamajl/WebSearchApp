import { useRef, useState } from "react";
import type { FormEvent } from "react";
import Icon from "../components/common/Icon";

import SearchAutocomplete from "../components/search/SearchAutocomplete";
import SearchEngineSelector from "../components/search/SearchEngineSelector";
import SearchHistory from "../components/search/SearchHistory";

import {
    ENGINE_STORAGE_KEY,
    getSelectedEngine,
    type SearchEngine,
} from "../data/searchEngines";

import { buildSearchUrl } from "../utils/search";
import { useSearchHistory } from "../hooks/useSearchHistory";
import { useSearchInputFocus } from "../hooks/useSearchInputFocus";

type SearchPanel = "history" | "autocomplete" | "engine";

export default function WebSearch() {
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [openPanel, setOpenPanel] = useState<SearchPanel | null>(null);
    const { items, saveSearch, deleteSearch, clearHistory } = useSearchHistory();

    const [engine, setEngine] = useState<SearchEngine>(
        getSelectedEngine
    );

    const inputRef = useRef<HTMLInputElement>(null);
    useSearchInputFocus(inputRef);

    function handleEngineChange(selectedEngine: SearchEngine) {
        setEngine(selectedEngine);

        try {
            localStorage.setItem(ENGINE_STORAGE_KEY, selectedEngine);
        } catch {
            // Keep the selection for this page when storage is unavailable.
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        submitSearch(query.trim());
    }

    function submitSearch(value: string) {
        setQuery(value);
        setOpenPanel(null);
        if (!value) {
            setError("Enter a search term or a web address.");
            inputRef.current?.focus();
            return;
        }
        if (/^[a-z][a-z\d+.-]*:\/\//i.test(value) || /^https?:/i.test(value)) {
            const url = URL.canParse(value) ? new URL(value) : null;
            if (!/^https?:\/\/[^/]/i.test(value) || /[\s\\\u0000-\u001f]/.test(value) ||
                !url?.hostname || url.username || url.password) {
                setError("Enter a valid HTTP or HTTPS address.");
                inputRef.current?.focus();
                return;
            }
        }
        setError("");
        saveSearch(value);
        window.location.assign(buildSearchUrl(value, engine));
    }

    function handleQueryChange(value: string) {
        setQuery(value);
        setError("");
        setOpenPanel("autocomplete");
    }

    function changePanel(panel: SearchPanel, open: boolean) {
        setOpenPanel((current) => open ? panel : current === panel ? null : current);
    }

    return (
        <div className="container">
            <h1 className="visually-hidden" id="web-search-title">Web Search</h1>
            <form className="web-search-form" role="search" aria-labelledby="web-search-title" onSubmit={handleSubmit}>
                <div className="search-wrapper">
                    <div className="search-input-wrap">
                        <SearchAutocomplete
                            inputId="searchInput"
                            errorId={error ? "web-search-error" : undefined}
                            query={query}
                            history={items}
                            inputRef={inputRef}
                            isOpen={openPanel === "autocomplete"}
                            onQueryChange={handleQueryChange}
                            onDismiss={() => changePanel("autocomplete", false)}
                            onSelect={submitSearch}
                        />
                        <SearchEngineSelector
                            value={engine}
                            isOpen={openPanel === "engine"}
                            onOpenChange={(open) => changePanel("engine", open)}
                            onChange={handleEngineChange}
                        />
                    </div>
                    <button type="submit" className="search-but" id="search-button">
                        <Icon name="magnifying-glass" /> Search
                    </button>
                    <SearchHistory
                        items={items}
                        isOpen={openPanel === "history"}
                        inputRef={inputRef}
                        onOpenChange={(open) => changePanel("history", open)}
                        onSearch={submitSearch}
                        onDelete={deleteSearch}
                        onClear={clearHistory}
                    />
                </div>
                {error && <p className="search-feedback" id="web-search-error" role="alert">{error}</p>}
            </form>
        </div>
    );
}
