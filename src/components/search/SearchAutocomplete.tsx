import { useEffect, useId, useRef, useState } from "react";
import Icon from "../common/Icon";
import type { KeyboardEvent, RefObject } from "react";
import type { SearchHistoryItem } from "../../hooks/useSearchHistory";
import { getSearchSuggestions } from "../../utils/searchSuggestions";
type SearchAutocompleteProps = {
    inputId?: string;
    errorId?: string;
    query: string;
    history: readonly SearchHistoryItem[];
    inputRef: RefObject<HTMLInputElement | null>;
    isOpen: boolean;
    onQueryChange: (query: string) => void;
    onDismiss: () => void;
    onSelect: (value: string) => void;
};

function highlightMatch(text: string, query: string) {
    const start = text.toLowerCase().indexOf(query.toLowerCase());
    if (start === -1) return text;

    const end = start + query.length;
    return <>{text.slice(0, start)}<mark>{text.slice(start, end)}</mark>{text.slice(end)}</>;
}

export default function SearchAutocomplete({
    inputId, errorId, query, history, inputRef, isOpen, onQueryChange, onDismiss, onSelect,
}: SearchAutocompleteProps) {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const trimmedQuery = query.trim();
    const suggestions = isOpen ? getSearchSuggestions(trimmedQuery, history) : [];
    const expanded = suggestions.length > 0;

    useEffect(() => {
        if (!expanded) return;

        function handleOutsidePointer(event: PointerEvent) {
            if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
                onDismiss();
            }
        }

        document.addEventListener("pointerdown", handleOutsidePointer);
        return () => document.removeEventListener("pointerdown", handleOutsidePointer);
    }, [expanded, onDismiss]);

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (!expanded || event.nativeEvent.isComposing) return;

        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp": {
                event.preventDefault();
                const nextIndex = event.key === "ArrowDown"
                    ? Math.min(activeIndex + 1, suggestions.length - 1)
                    : Math.max(activeIndex - 1, -1);
                setActiveIndex(nextIndex);
                listRef.current?.children[nextIndex]?.scrollIntoView({ block: "nearest" });
                break;
            }
            case "Enter": {
                const selected = suggestions[activeIndex];
                if (selected) {
                    event.preventDefault();
                    onSelect(selected.value);
                }
                break;
            }
            case "Escape":
                event.preventDefault();
                onDismiss();
                break;
        }
    }

    return (
        <div className="search-autocomplete" ref={rootRef}>
            <input
                ref={inputRef}
                id={inputId}
                className="search-bar"
                type="text"
                placeholder="Search or enter a URL"
                aria-label="Search or enter a URL"
                aria-invalid={!!errorId}
                aria-describedby={errorId}
                role="combobox"
                aria-autocomplete="list"
                aria-controls={listId}
                aria-expanded={expanded}
                aria-activedescendant={suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
                autoComplete="off"
                value={query}
                onChange={(event) => {
                    setActiveIndex(-1);
                    onQueryChange(event.target.value);
                }}
                onBlur={() => {
                    if (isOpen) onDismiss();
                }}
                onKeyDown={handleKeyDown}
            />

            <ul
                ref={listRef}
                id={listId}
                className={`autocomplete-list${expanded ? " show" : ""}`}
                role="listbox"
                aria-label="Search suggestions"
                aria-hidden={!expanded}
            >
                {suggestions.map(({ type, label, value, icon }, index) => (
                    <li
                        key={`${type}:${value}`}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        className={index === activeIndex ? "active" : undefined}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelect(value)}
                    >
                        <Icon name={icon} className="ac-icon" />
                        <span className="ac-label">{highlightMatch(label, trimmedQuery)}</span>
                        {type === "site" && (
                            <span className="ac-url">{highlightMatch(value, trimmedQuery)}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
