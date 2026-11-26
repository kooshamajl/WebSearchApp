import { POPULAR_SITES } from "../data/popularSites";
import { isLikelyUrl } from "./search";

export type QuickLink = { name: string; url: string; icon?: string };

export const QUICK_LINK_LIMIT = 6;
const STORAGE_KEY = "quickLinks";
const DEFAULT_ICON = "fa-solid fa-globe";
const DRIVE_ICON = "fab fa-google-drive";
const DEFAULT_LINKS: QuickLink[] = [
    { name: "YouTube", url: "https://youtube.com", icon: "fab fa-youtube" },
    { name: "Instagram", url: "https://instagram.com", icon: "fab fa-instagram" },
    { name: "ChatGPT", url: "https://chat.openai.com", icon: "fas fa-robot" },
    { name: "GitHub", url: "https://github.com", icon: "fab fa-github" },
    { name: "Gmail", url: "https://mail.google.com", icon: "fas fa-envelope" },
    { name: "Drive", url: "https://drive.google.com", icon: DRIVE_ICON },
];

function parseHttpUrl(value: string): URL | null {
    // Reject characters the URL parser would silently remove or reinterpret.
    if (!/^https?:\/\/[^/?#]/i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;

    try {
        const url = new URL(value);
        return url.hostname && !url.username && !url.password ? url : null;
    } catch {
        return null;
    }
}

export function quickLinkHost(url: string): string {
    return parseHttpUrl(url)?.hostname.replace(/^www\./, "").replace(/\.$/, "") ?? "";
}

export function resolveQuickLink(value: string): Omit<QuickLink, "name"> | null {
    const text = value.trim();
    const namedSite = POPULAR_SITES.find(({ name }) => name.toLowerCase() === text.toLowerCase());
    if (namedSite) return { url: `https://${namedSite.url}`, icon: namedSite.icon ?? DEFAULT_ICON };
    if (!isLikelyUrl(text)) return null;

    const url = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    const host = quickLinkHost(url);
    if (!host) return null;

    const knownSite = POPULAR_SITES.find((site) => site.url === host);
    return { url, icon: host === "drive.google.com" ? DRIVE_ICON : knownSite?.icon ?? DEFAULT_ICON };
}

const iconNames = new Set([
    ...POPULAR_SITES.flatMap(({ icon }) => icon ? [icon.split(" ").at(-1)] : []),
    "fa-google-drive", "fa-globe",
]);

export function quickLinkIcon(icon?: string): string {
    return icon?.split(/\s+/).find((name) => iconNames.has(name)) ?? "fa-globe";
}

export function readQuickLinks(): QuickLink[] {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (!Array.isArray(saved)) return [...DEFAULT_LINKS];

        return (saved as unknown[]).flatMap((entry): QuickLink[] => {
            if (!entry || typeof entry !== "object" || !("name" in entry) || typeof entry.name !== "string" ||
                !entry.name.trim() || !("url" in entry) || typeof entry.url !== "string" || !parseHttpUrl(entry.url)) {
                return [];
            }

            const icon = "icon" in entry && typeof entry.icon === "string" ? entry.icon : undefined;
            return [{ name: entry.name, url: entry.url, icon }];
        });
    } catch {
        return [...DEFAULT_LINKS];
    }
}

export function saveQuickLinks(links: readonly QuickLink[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
        // The list remains usable in memory if storage is unavailable.
    }
}

export function seedQuickLinks() {
    try {
        if (localStorage.getItem(STORAGE_KEY) === null) saveQuickLinks(DEFAULT_LINKS);
    } catch {
        // The default links remain available in memory.
    }
}
