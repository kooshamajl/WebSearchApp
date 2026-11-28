import { useRef, useState } from "react";
import SearchButton from "../components/search/SearchButton";
import SearchInput from "../components/search/SearchInput";
import type { FormEvent, KeyboardEvent } from "react";
import { useSearchInputFocus } from "../hooks/useSearchInputFocus";
import {
    buildImageSearchUrl,
    getImageSearchSuggestion,
    readImageSearchHistory,
    saveImageSearchHistory,
} from "../utils/imageSearch";

export default function ImageSearch() {
    const [query, setQuery] = useState("");
    const [history, setHistory] = useState(readImageSearchHistory);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    useSearchInputFocus(inputRef);

    const suggestion = showSuggestion ? getImageSearchSuggestion(query, history) : undefined;

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (!suggestion || event.nativeEvent.isComposing || event.altKey || event.ctrlKey ||
            event.metaKey || event.shiftKey) return;

        const input = event.currentTarget;
        const caretAtEnd = input.selectionStart === query.length && input.selectionEnd === query.length;

        if (event.key === "Escape") {
            event.preventDefault();
            setShowSuggestion(false);
        } else if (event.key === "ArrowRight" && caretAtEnd) {
            event.preventDefault();
            setQuery(suggestion);
            setShowSuggestion(false);
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const submittedQuery = query.trim();
        if (!submittedQuery) {
            setIsInvalid(true);
            inputRef.current?.focus();
            return;
        }

        setHistory(saveImageSearchHistory(submittedQuery));
        setShowSuggestion(false);
        window.location.assign(buildImageSearchUrl(submittedQuery));
    }

    return (
        <div className="container">
            <h1 className="visually-hidden" id="image-search-title">Image Search</h1>
            <form className="image-search-form" role="search" aria-labelledby="image-search-title" onSubmit={handleSubmit}>
                <div className="image-search-wrap">
                    <SearchInput
                        ref={inputRef}
                        id="imageSearchInput"
                        name="q"
                        placeholder="Search Google Images..."
                        aria-label="Search Google Images"
                        aria-autocomplete="inline"
                        aria-invalid={isInvalid}
                        aria-describedby={isInvalid ? "image-search-error" : undefined}
                        maxLength={50}
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setShowSuggestion(true);
                            setIsInvalid(false);
                        }}
                        onFocus={() => setShowSuggestion(true)}
                        onBlur={() => setShowSuggestion(false)}
                        onKeyDown={handleKeyDown}
                    />

                    <div className="ghost-suggestion" aria-hidden="true">
                        <div className="ghost-text">
                            <span id="ghostTyped">{query}</span>
                            <span id="ghostRemainder" className={suggestion ? "visible" : undefined}>
                                {suggestion?.slice(query.length)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="image-search-suggestion-announcement" role="status">
                    {suggestion && `Suggestion: ${suggestion}. Press Right Arrow at the end to accept.`}
                </div>
                {isInvalid && <p className="search-feedback" id="image-search-error" role="alert">Enter a search term.</p>}

                <div>
                    <SearchButton icon="image">Image Search</SearchButton>
                </div>
            </form>
        </div>
    );
}
