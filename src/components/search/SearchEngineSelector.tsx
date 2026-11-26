import {
    SEARCH_ENGINES,
    type SearchEngine,
} from "../../data/searchEngines";

interface SearchEngineSelectorProps {
    value: SearchEngine;
    onChange: (engine: SearchEngine) => void;
}

export default function SearchEngineSelector({
    value,
    onChange,
}: SearchEngineSelectorProps) {
    return (
        <div className="engine-select">
            <select
                className="engine-select-btn"
                value={value}
                aria-label="Choose search engine"
                onChange={(event) =>
                    onChange(event.target.value as SearchEngine)
                }
            >
                {Object.entries(SEARCH_ENGINES).map(
                    ([key, engine]) => (
                        <option key={key} value={key}>
                            {engine.name}
                        </option>
                    )
                )}
            </select>
        </div>
    );
}