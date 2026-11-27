import { useLayoutEffect, useRef } from "react";

export function useWidgetResize(dimension: "width" | "height") {
    const content = useRef<HTMLDivElement>(null);
    const before = useRef<string | null>(null);
    const animation = useRef<Animation | null>(null);

    function captureSize() {
        const panel = content.current?.closest(".glass-widget");
        if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        before.current = getComputedStyle(panel)[dimension];
    }

    useLayoutEffect(() => {
        const start = before.current;
        before.current = null;
        const panel = content.current?.closest(".glass-widget");
        if (!start || !panel) return;

        animation.current?.cancel();
        const end = getComputedStyle(panel)[dimension];
        if (start !== end) {
            animation.current = panel.animate([{ [dimension]: start }, { [dimension]: end }], {
                duration: 200,
                easing: "ease",
            });
        }
    });

    useLayoutEffect(() => () => animation.current?.cancel(), []);

    return { content, captureSize };
}
