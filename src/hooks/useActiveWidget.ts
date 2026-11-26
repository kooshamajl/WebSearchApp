import { useState } from "react";
import { isWidgetId, type WidgetId } from "../data/widgets";

const STORAGE_KEY = "activeWidget";

function readActiveWidget(): WidgetId | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return isWidgetId(saved) ? saved : null;
    } catch {
        return null;
    }
}

export function useActiveWidget() {
    const [activeWidget, setActiveWidget] = useState(readActiveWidget);

    function selectWidget(widget: WidgetId) {
        setActiveWidget(widget);
        try {
            localStorage.setItem(STORAGE_KEY, widget);
        } catch {
            // Widget switching still works while this page is open.
        }
    }

    return { activeWidget, selectWidget };
}
