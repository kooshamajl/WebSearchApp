import { lazy } from "react";

export const WIDGETS = {
    weather: { label: "Weather", title: "Weather", Component: lazy(() => import("./WeatherWidget")) },
    crypto: { label: "Crypto", title: "Crypto", Component: lazy(() => import("./CryptoWidget")) },
    DailyTask: { label: "Task", title: "Daily Tasks", Component: lazy(() => import("./DailyTasksWidget")) },
    "quick-links": { label: "Quick links", title: "Quick links", Component: lazy(() => import("./QuickLinksWidget")) },
    ping: { label: "Ping", title: "Connection", Component: lazy(() => import("./ConnectionWidget")) },
} as const;

export type WidgetId = keyof typeof WIDGETS;
export const WIDGET_IDS = Object.keys(WIDGETS) as WidgetId[];

export function isWidgetId(value: string | null): value is WidgetId {
    return value !== null && Object.hasOwn(WIDGETS, value);
}
