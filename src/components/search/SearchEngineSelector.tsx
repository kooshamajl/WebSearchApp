import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import icons from "../../assets/icons/quick-link-icons.svg?url";
import { SEARCH_ENGINES, type SearchEngine } from "../../data/searchEngines";

const engines = Object.keys(SEARCH_ENGINES) as SearchEngine[];

function EngineIcon({ engine }: { engine: SearchEngine }) {
    return (
        <span className={`engine-symbol engine-symbol--${engine}`} aria-hidden="true">
            {engine === "google" ? <svg focusable="false"><use href={`${icons}#fa-google`} /></svg>
                : engine === "bing" ? "B" : "D"}
        </span>
    );
}

type Props = {
    value: SearchEngine;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (engine: SearchEngine) => void;
};

export default function SearchEngineSelector({ value, isOpen, onOpenChange, onChange }: Props) {
    const id = useId();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const options = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (isOpen) options.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    }, [isOpen]);

    function choose(engine: SearchEngine) {
        onChange(engine);
        onOpenChange(false);
        trigger.current?.focus();
    }

    function handleKeys(event: KeyboardEvent<HTMLUListElement>) {
        const items = options.current?.querySelectorAll<HTMLElement>("[role=option]");
        if (!items?.length) return;
        const index = Array.from(items).findIndex((item) => item === event.target);
        switch (event.key) {
            case "ArrowDown": items[(index + 1) % items.length].focus(); break;
            case "ArrowUp": items[(index + items.length - 1) % items.length].focus(); break;
            case "Home": items[0].focus(); break;
            case "End": items[items.length - 1].focus(); break;
            case " ":
            case "Enter": if (index >= 0) choose(engines[index]); break;
            case "Escape": onOpenChange(false); trigger.current?.focus(); break;
            default: return;
        }
        event.preventDefault();
    }

    useEffect(() => {
        if (!isOpen) return;
        function dismiss(event: PointerEvent) {
            if (event.target instanceof Node && !root.current?.contains(event.target)) onOpenChange(false);
        }
        document.addEventListener("pointerdown", dismiss);
        return () => document.removeEventListener("pointerdown", dismiss);
    }, [isOpen, onOpenChange]);

    return (
        <div className="search-engine" ref={root}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) onOpenChange(false);
            }}>
            <button ref={trigger} type="button" className="search-engine-trigger"
                aria-label="Choose search engine" aria-describedby={`${id}-value`}
                aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={id}
                onClick={() => onOpenChange(!isOpen)}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        onOpenChange(true);
                    } else if (event.key === "Escape" && isOpen) {
                        event.preventDefault();
                        onOpenChange(false);
                    }
                }}>
                <EngineIcon engine={value} />
                <span id={`${id}-value`} className="search-engine-name">{SEARCH_ENGINES[value].name}</span>
                <span className="search-engine-chevron" aria-hidden="true" />
            </button>
            <ul id={id} className="search-engine-options" aria-label="Search engines" role="listbox"
                ref={options} hidden={!isOpen} onKeyDown={handleKeys}>
                {engines.map((engine) => (
                    <li key={engine} role="option" tabIndex={-1} aria-selected={engine === value}
                        onClick={() => choose(engine)}>
                        <EngineIcon engine={engine} />
                        {SEARCH_ENGINES[engine].name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
