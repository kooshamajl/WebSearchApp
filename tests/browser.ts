import { test as base, type Page } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend({
    page: async ({ page, baseURL }, use) => {
        await page.context().route("**/*", async (route) => {
            if (new URL(route.request().url()).origin === baseURL) await route.continue();
            else await route.abort();
        });
        await use(page);
    },
});

export async function seedStorage(page: Page, origin: string | undefined, values: Record<string, string>) {
    await page.addInitScript(({ origin, values }) => {
        if (location.origin !== origin || sessionStorage.getItem("test-storage-seeded")) return;
        sessionStorage.setItem("test-storage-seeded", "true");
        for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
    }, { origin, values });
}
