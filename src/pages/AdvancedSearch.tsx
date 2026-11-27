import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Icon from "../components/common/Icon";
import {
    ADVANCED_SEARCH_FIELDS,
    buildAdvancedSearchUrl,
    type AdvancedSearchFields,
} from "../utils/advancedSearch";

export default function AdvancedSearch() {
    const [showError, setShowError] = useState(false);
    const firstInput = useRef<HTMLInputElement>(null);
    const heading = useRef<HTMLHeadingElement>(null);

    useEffect(() => heading.current?.focus({ preventScroll: true }), []);

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
        <div className="advanced-container">
            <h1 ref={heading} tabIndex={-1}>Find pages containing:</h1>

            <form
                className="advanced-search-form"
                role="search"
                aria-label="Advanced Search"
                onSubmit={handleSubmit}
            >
                {showError && (
                    <p id="advanced-search-error" role="alert">Enter at least one search term.</p>
                )}

                {ADVANCED_SEARCH_FIELDS.map(({ id, name, label }, index) => (
                    <div className="row" key={name}>
                        <label htmlFor={id}>{label}:</label>
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
                    <Icon name="filter" /> Advanced Search
                </button>
            </form>
        </div>
    );
}
