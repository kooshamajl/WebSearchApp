import { useEffect } from "react";
import type { RefObject } from "react";

export function useSearchInputFocus(inputRef: RefObject<HTMLInputElement | null>) {
    useEffect(() => {
        inputRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target;

            if (
                event.key === "/" &&
                !event.ctrlKey &&
                !event.altKey &&
                !event.metaKey &&
                !(target instanceof HTMLInputElement) &&
                !(target instanceof HTMLTextAreaElement) &&
                !(target instanceof HTMLSelectElement) &&
                !(target instanceof HTMLElement && target.isContentEditable)
            ) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [inputRef]);
}
