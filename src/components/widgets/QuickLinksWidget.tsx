import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import iconSprite from "../../assets/icons/quick-link-icons.svg?url";
import { QUICK_LINK_LIMIT, quickLinkHost, quickLinkIcon, readQuickLinks, resolveQuickLink, saveQuickLinks, seedQuickLinks } from "../../utils/quickLinks";

type LinkError = { field: "name" | "url"; message: string };

export default function QuickLinksWidget() {
    const [links, setLinks] = useState(readQuickLinks);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<LinkError | null>(null);
    const addButton = useRef<HTMLButtonElement>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const urlInput = useRef<HTMLInputElement>(null);
    const dialog = useRef<HTMLFormElement>(null);
    const lastLink = useRef<HTMLAnchorElement>(null);
    const restoreFocus = useRef(false);
    const limitReached = links.length >= QUICK_LINK_LIMIT;

    useEffect(seedQuickLinks, []);

    useEffect(() => {
        if (!isOpen) return;
        nameInput.current?.focus();

        function handleOutsidePointer(event: PointerEvent) {
            if (event.target instanceof Node && !dialog.current?.contains(event.target) &&
                !addButton.current?.contains(event.target)) setIsOpen(false);
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
            event.preventDefault();
            setIsOpen(false);
            addButton.current?.focus();
        }

        document.addEventListener("pointerdown", handleOutsidePointer);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handleOutsidePointer);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!restoreFocus.current) return;
        restoreFocus.current = false;
        (limitReached ? lastLink : addButton).current?.focus();
    }, [links, limitReached]);

    function reportError(field: LinkError["field"], message: string) {
        setError({ field, message });
        (field === "name" ? nameInput : urlInput).current?.focus();
    }

    function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (limitReached) return;

        const name = nameInput.current?.value.trim();
        if (!name) {
            reportError("name", "Name is required.");
            return;
        }

        const resolved = resolveQuickLink(urlInput.current?.value ?? "");
        if (!resolved) {
            reportError("url", "Enter a valid HTTP or HTTPS address or a known site name.");
            return;
        }

        const host = quickLinkHost(resolved.url);
        if (links.some((link) => quickLinkHost(link.url) === host)) {
            reportError("url", "That site is already in your Quick Links.");
            return;
        }

        const next = [...links, { name, ...resolved }];
        restoreFocus.current = true;
        setLinks(next);
        saveQuickLinks(next);
        setIsOpen(false);
    }

    function removeLink(index: number) {
        const next = links.filter((_, position) => position !== index);
        restoreFocus.current = true;
        setLinks(next);
        saveQuickLinks(next);
    }

    return (
        <div id="quickLinks" className="app-quick-links">
            {links.length === 0 ? <p className="quick-links-empty">No quick links yet</p> : (
                <ul className="quick-links-row" role="list" aria-label="Saved links">
                    {links.map(({ name, url, icon }, index) => (
                        <li className="quick-link-item" key={`${url}-${index}`}>
                            <a href={url} ref={index === links.length - 1 ? lastLink : undefined}
                                target="_blank" rel="noopener noreferrer" title={name} aria-label={`Open ${name}`}>
                                <svg aria-hidden="true" focusable="false"><use href={`${iconSprite}#${quickLinkIcon(icon)}`} /></svg>
                            </a>
                            <button type="button" className="quick-link-remove" aria-label={`Remove ${name}`}
                                onClick={() => removeLink(index)}>×</button>
                        </li>
                    ))}
                </ul>
            )}

            <button type="button" className="quick-link-add-btn" ref={addButton} aria-label="Add quick link"
                aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={isOpen ? "quickLinkPopover" : undefined}
                disabled={limitReached} title={limitReached ? `Limit reached (${QUICK_LINK_LIMIT})` : "Add quick link"}
                onClick={() => { setError(null); setIsOpen(!isOpen); }}>+</button>

            {isOpen && (
                <form className="quick-link-popover open" id="quickLinkPopover" ref={dialog}
                    role="dialog" aria-label="Add quick link" onSubmit={handleSave}>
                    <div className="quick-link-popover-row">
                        <label htmlFor="quickLinkName">Name</label>
                        <input type="text" id="quickLinkName" ref={nameInput} maxLength={24} autoComplete="off"
                            className={`quick-link-input${error?.field === "name" ? " invalid" : ""}`}
                            aria-invalid={error?.field === "name"} aria-describedby={error?.field === "name" ? "quickLinkError" : undefined}
                            onChange={() => { if (error?.field === "name") setError(null); }} />
                    </div>
                    <div className="quick-link-popover-row">
                        <label htmlFor="quickLinkUrl">URL or site name</label>
                        <input type="text" id="quickLinkUrl" ref={urlInput} maxLength={60} autoComplete="off"
                            className={`quick-link-input${error?.field === "url" ? " invalid" : ""}`}
                            aria-invalid={error?.field === "url"} aria-describedby={error?.field === "url" ? "quickLinkError" : undefined}
                            onChange={() => { if (error?.field === "url") setError(null); }} />
                    </div>
                    {error && <p className="quick-link-error" id="quickLinkError" role="alert">{error.message}</p>}
                    <div className="quick-link-popover-actions">
                        <button type="button" className="quick-link-cancel-btn" onClick={() => {
                            setIsOpen(false);
                            addButton.current?.focus();
                        }}>Cancel</button>
                        <button type="submit" className="quick-link-save-btn">Add</button>
                    </div>
                </form>
            )}
        </div>
    );
}
