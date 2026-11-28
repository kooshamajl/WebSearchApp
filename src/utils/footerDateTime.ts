type DateFormat = "persian" | "gregorian";
type ClockFormat = "24" | "12";

const gregorianDate = new Intl.DateTimeFormat("en-US", {
    calendar: "gregory", weekday: "long", year: "numeric", month: "long", day: "numeric",
});
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const persianDate = new Intl.DateTimeFormat("en-US", {
    calendar: "persian", numberingSystem: "latn", year: "numeric", month: "numeric", day: "numeric",
});
const supportsPersianCalendar = persianDate.resolvedOptions().calendar === "persian";
const persianMonths = [
    "Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar",
    "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand",
];

const clockFormatters: Record<ClockFormat, Intl.DateTimeFormat> = {
    "24": new Intl.DateTimeFormat("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }),
    "12": new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "2-digit", second: "2-digit", hourCycle: "h12",
    }),
};

export function formatFooterDate(date: Date, format: DateFormat): string {
    if (format === "gregorian" || !supportsPersianCalendar) {
        return gregorianDate.format(date);
    }

    const parts = persianDate.formatToParts(date);
    const day = parts.find(({ type }) => type === "day")?.value;
    const monthIndex = Number(parts.find(({ type }) => type === "month")?.value) - 1;
    const year = parts.find(({ type }) => type === "year")?.value;
    const month = persianMonths[monthIndex];
    if (!day || !month || !year) return gregorianDate.format(date);

    return `${weekday.format(date)}, ${day} ${month}, ${year}`;
}

export function formatFooterTime(date: Date, format: ClockFormat): string {
    return clockFormatters[format].format(date);
}
