import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import { SEARCH_ENGINES, type SearchEngine } from "../../data/searchEngines";
import Icon from "../common/Icon";

const engines = Object.keys(SEARCH_ENGINES) as SearchEngine[];

function EngineIcon({ engine }: { engine: SearchEngine }) {
    if (engine === "google") return <Icon name="google" />;

    return (
        <svg className={`engine-badge ${engine === "bing" ? "engine-badge-bing" : "engine-badge-ddg"}`}
            viewBox="0 0 16 16" aria-hidden="true">
            <circle className="engine-badge-circle" cx="8" cy="8" r="8" />
            <text className="engine-badge-text" x="8" y="11.5">{engine === "bing" ? "b" : "D"}</text>
        </svg>
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
        <div className={`engine-select${isOpen ? " open" : ""}`} ref={root}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) onOpenChange(false);
            }}>
            <button ref={trigger} type="button" className="engine-select-btn"
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
                <span className="engine-icon-slot"><EngineIcon engine={value} /></span>
                <span id={`${id}-value`} className="engine-name">{SEARCH_ENGINES[value].name}</span>
                <Icon name="chevron-down" className="engine-chevron" />
            </button>
            <ul id={id} className="engine-menu" aria-label="Search engines" role="listbox"
                ref={options} inert={!isOpen} onKeyDown={handleKeys}>
                {engines.map((engine) => (
                    <li key={engine} role="option" tabIndex={-1} aria-selected={engine === value}
                        onClick={() => choose(engine)}>
                        <span className="engine-menu-icon"><EngineIcon engine={engine} /></span>
                        <span className="engine-menu-name">{SEARCH_ENGINES[engine].name}</span>
                        <Icon name="check" className="engine-check" />
                    </li>
                ))}
            </ul>
        </div>
    );
}
