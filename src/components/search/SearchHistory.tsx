import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { SearchHistoryItem } from "../../hooks/useSearchHistory";
import "../../../css/history-search.css";

type SearchHistoryProps = {
    items: SearchHistoryItem[];
    isOpen: boolean;
    inputRef: RefObject<HTMLInputElement | null>;
    onOpenChange: (open: boolean) => void;
    onSearch: (value: string) => void;
    onDelete: (value: string) => void;
    onClear: () => void;
};

// Matches --history-remove-duration in history-search.css.
const REMOVE_ANIMATION_MS = 220;
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export default function SearchHistory({
    items, isOpen, inputRef, onOpenChange, onSearch, onDelete, onClear,
}: SearchHistoryProps) {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const removalTimer = useRef<number | undefined>(undefined);
    const [exitingItems, setExitingItems] = useState<SearchHistoryItem[] | null>(null);

    useEffect(() => {
        function handleShortcut(event: globalThis.KeyboardEvent) {
            if (event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey &&
                !event.repeat && event.key.toLowerCase() === "h") {
                event.preventDefault();
                onOpenChange(!isOpen);
                toggleRef.current?.focus();
            }
        }

        function handleOutsideClick(event: MouseEvent) {
            if (isOpen && event.target instanceof Node &&
                !rootRef.current?.contains(event.target) && event.target !== inputRef.current) {
                onOpenChange(false);
            }
        }

        document.addEventListener("keydown", handleShortcut);
        document.addEventListener("click", handleOutsideClick);
        return () => {
            document.removeEventListener("keydown", handleShortcut);
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [inputRef, isOpen, onOpenChange]);

    useEffect(() => () => window.clearTimeout(removalTimer.current), []);

    function getSearchButtons() {
        return Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>(
            ".history-item:not([inert]) .history-search-btn"
        ) ?? []);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!isOpen) return;

        if (event.key === "Escape") {
            event.preventDefault();
            onOpenChange(false);
            toggleRef.current?.focus();
            return;
        }

        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

        const buttons = getSearchButtons();
        if (buttons.length === 0) return;

        event.preventDefault();
        const row = (event.target as HTMLElement).closest(".history-item");
        const index = buttons.findIndex((button) => button.closest(".history-item") === row);
        const nextIndex = event.key === "ArrowDown"
            ? Math.min(index + 1, buttons.length - 1)
            : index === -1 ? buttons.length - 1 : Math.max(index - 1, 0);
        buttons[nextIndex].focus();
    }

    function animateRemoval() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        setExitingItems(exitingItems ?? items);
        window.clearTimeout(removalTimer.current);
        removalTimer.current = window.setTimeout(() => setExitingItems(null), REMOVE_ANIMATION_MS);
    }

    function handleDelete(value: string, index: number) {
        const buttons = getSearchButtons();
        const nextFocus = buttons[index + 1] ?? buttons[index - 1] ?? toggleRef.current;
        nextFocus?.focus();
        animateRemoval();
        onDelete(value);
    }

    function handleClear() {
        toggleRef.current?.focus();
        animateRemoval();
        onClear();
    }

    return (
        <div className="search-history" ref={rootRef} onKeyDown={handleKeyDown}>
            <button
                ref={toggleRef}
                type="button"
                className="history-toggle"
                title="Shortcut: Ctrl+H"
                aria-keyshortcuts="Control+H"
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={() => onOpenChange(!isOpen)}
            >
                History
            </button>

            <ul id={listId} className={`history-list${isOpen ? " show" : ""}`}
                aria-label="Search history" aria-hidden={!isOpen} inert={!isOpen}>
                {items.length > 0 && (
                    <li className="history-header">
                        <span className="history-header-label">Recent searches</span>
                        <button type="button" className="clear-history-btn"
                            aria-label="Clear all search history" onClick={handleClear}>
                            Clear
                        </button>
                    </li>
                )}

                {(exitingItems ?? items).map(({ value, time }) => {
                    const index = items.findIndex((item) => item.value === value);
                    const isRemoving = index === -1;

                    return (
                        <li key={value} className={`history-item${isRemoving ? " history-item-removing" : ""}`}
                            aria-hidden={isRemoving} inert={isRemoving}>
                            <button type="button" className="history-search-btn"
                                aria-label={`Search again: ${value}`} onClick={() => onSearch(value)}>
                                <span className="history-item-icon" aria-hidden="true">◷</span>
                                <span className="history-item-text">{value}</span>
                                {time !== null && (
                                    <time className="history-item-time" dateTime={new Date(time).toISOString()}>
                                        {timeFormat.format(time)}
                                    </time>
                                )}
                            </button>
                            <button type="button" className="delete-btn"
                                aria-label={`Delete "${value}" from history`}
                                onClick={() => handleDelete(value, index)}>
                                ×
                            </button>
                        </li>
                    );
                })}

                {items.length === 0 && !exitingItems && (
                    <li className="history-empty">History is empty</li>
                )}
            </ul>
        </div>
    );
}
