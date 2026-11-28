import { expect, seedStorage, test } from "./browser";

test("opens saved links to the former search pages", async ({ page }) => {
    for (const [legacy, path, title] of [
        ["web", "/", "Web Search"],
        ["image", "/image", "Image Search"],
        ["advanced", "/advanced", "Advanced Search"],
    ]) {
        await page.goto(`/html/${legacy}.html?source=bookmark#saved`);
        await expect(page).toHaveURL(`${path}?source=bookmark#saved`);
        await expect(page).toHaveTitle(`${title} | Web Search App`);
    }
});

test("keeps the theme across keyboard navigation and reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Dark mode", exact: true });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.press("Space");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    const searchOptions = page.getByRole("button", { name: "Search Options" });
    await searchOptions.press("Enter");
    await page.getByRole("link", { name: "Advanced Search", exact: true }).press("Enter");
    await expect(page).toHaveTitle("Advanced Search | Web Search App");
    await expect(page.getByRole("heading", { name: "Find pages containing:" })).toBeFocused();
    await page.reload();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await searchOptions.press("Enter");
    await page.getByRole("link", { name: "Image Search", exact: true }).press("Enter");
    await expect(page).toHaveTitle("Image Search | Web Search App");
    await expect(page.getByRole("textbox", { name: "Search Google Images" })).toBeFocused();
});

test("falls back when saved history or preferences are malformed", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { theme: "unknown", history: "{bad json" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect(page.getByRole("list", { name: "Search history" })).toHaveText("History is empty");
});

test("keeps controls usable when localStorage is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
            get() { throw new DOMException("Storage unavailable", "SecurityError"); },
        });
    });
    await page.goto("/");
    const engine = page.getByRole("button", { name: "Choose search engine" });
    await expect(engine).toHaveAccessibleDescription("Google");
    await engine.press("Enter");
    await page.getByRole("option", { name: "DuckDuckGo" }).press("Enter");
    await expect(engine).toHaveAccessibleDescription("DuckDuckGo");
    const theme = page.getByRole("button", { name: "Dark mode", exact: true });
    await theme.press("Enter");
    await expect(theme).toHaveAttribute("aria-pressed", "true");
});
