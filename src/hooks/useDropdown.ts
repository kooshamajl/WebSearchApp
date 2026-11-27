import { useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";

export function useDropdown() {
    const [isOpen, setOpen] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);

    function close() {
        setOpen(false);
    }

    function openOnHover(event: PointerEvent<HTMLElement>) {
        if (event.pointerType === "mouse") setOpen(true);
    }

    useEffect(() => {
        if (!isOpen) return;

        function dismiss(event: globalThis.PointerEvent) {
            if (event.target instanceof Node && !container.current?.contains(event.target)) close();
        }

        document.addEventListener("pointerdown", dismiss);
        return () => document.removeEventListener("pointerdown", dismiss);
    }, [isOpen]);

    return {
        isOpen,
        close,
        trigger,
        openOnHover,
        toggle(event: MouseEvent<HTMLButtonElement>) {
            const pointer = event.nativeEvent;
            const mouseClick = pointer instanceof window.PointerEvent && pointer.pointerType === "mouse";
            setOpen((open) => mouseClick || !open);
        },
        disclosureProps: {
            ref: container,
            onPointerEnter: openOnHover,
            onPointerLeave(event: PointerEvent<HTMLDivElement>) {
                if (event.pointerType === "mouse" && !event.currentTarget.contains(document.activeElement)) close();
            },
            onBlur(event: FocusEvent<HTMLDivElement>) {
                if (!event.currentTarget.contains(event.relatedTarget)) close();
            },
            onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
                if (event.key !== "Escape" || !isOpen) return;
                event.preventDefault();
                close();
                trigger.current?.focus();
            },
        },
    };
}
