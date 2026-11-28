import ConnectionWidget from "./ConnectionWidget";
import CryptoWidget from "./CryptoWidget";
import DailyTasksWidget from "./DailyTasksWidget";
import QuickLinksWidget from "./QuickLinksWidget";
import WeatherWidget from "./WeatherWidget";

export const WIDGETS = {
    weather: { label: "Weather", title: "Weather", Component: WeatherWidget },
    crypto: { label: "Crypto", title: "Crypto", Component: CryptoWidget },
    DailyTask: { label: "Task", title: "Daily Tasks", Component: DailyTasksWidget },
    "quick-links": { label: "Quick links", title: "Quick links", Component: QuickLinksWidget },
    ping: { label: "Ping", title: "Connection", Component: ConnectionWidget },
} as const;

export type WidgetId = keyof typeof WIDGETS;
export const WIDGET_IDS = Object.keys(WIDGETS) as WidgetId[];

export function isWidgetId(value: string | null): value is WidgetId {
    return value !== null && Object.hasOwn(WIDGETS, value);
}
