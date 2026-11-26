export const WIDGETS = {
    weather: "Weather",
    crypto: "Crypto",
    DailyTask: "Task",
    "quick-links": "Quick links",
    ping: "Ping",
} as const;

export type WidgetId = keyof typeof WIDGETS;

export function isWidgetId(value: string | null): value is WidgetId {
    return value !== null && Object.hasOwn(WIDGETS, value);
}
