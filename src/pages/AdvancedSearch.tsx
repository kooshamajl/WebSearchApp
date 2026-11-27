import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
    ADVANCED_SEARCH_FIELDS,
    buildAdvancedSearchUrl,
    type AdvancedSearchFields,
} from "../utils/advancedSearch";

export default function AdvancedSearch() {
    const [showError, setShowError] = useState(false);
    const firstInput = useRef<HTMLInputElement>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fields: AdvancedSearchFields = {};

        for (const { name } of ADVANCED_SEARCH_FIELDS) {
            const value = formData.get(name);
            if (typeof value === "string") fields[name] = value;
        }

        const url = buildAdvancedSearchUrl(fields);
        if (!url) {
            setShowError(true);
            firstInput.current?.focus();
            return;
        }

        window.location.assign(url);
    }

    return (
        <div className="advanced-container search-page">
            <h1 id="advanced-search-title">Advanced Search</h1>

            <form
                className="advanced-search-form"
                role="search"
                aria-labelledby="advanced-search-title"
                onSubmit={handleSubmit}
            >
                {showError && (
                    <p className="search-feedback" id="advanced-search-error" role="alert">Enter at least one search term.</p>
                )}

                {ADVANCED_SEARCH_FIELDS.map(({ id, name, label }, index) => (
                    <div className="row" key={name}>
                        <label htmlFor={id}>{label}</label>
                        <input
                            ref={index === 0 ? firstInput : undefined}
                            id={id}
                            name={name}
                            className="search-bar"
                            type="text"
                            maxLength={50}
                            autoComplete="off"
                            aria-describedby={index === 0 && showError ? "advanced-search-error" : undefined}
                            onChange={(event) => {
                                if (event.target.value.trim()) setShowError(false);
                            }}
                        />
                    </div>
                ))}

                <button type="submit" id="search-button" className="search-but">
                    Advanced Search
                </button>
            </form>
        </div>
    );
}
