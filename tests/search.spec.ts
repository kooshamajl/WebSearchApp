import { expect, seedStorage, test } from "./browser";

test("selects and persists an engine and submits to that provider", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { selectedSearchEngine: "unknown" });
    await page.route("https://www.bing.com/search?*", (route) => route.fulfill({ body: "Search result fixture" }));
    await page.goto("/");

    const engine = page.getByRole("button", { name: "Choose search engine" });
    await expect(engine).toHaveAccessibleDescription("Google");
    await engine.press("Enter");
    const selected = page.getByRole("option", { name: "Google" });
    await expect(selected).toBeFocused();
    await selected.press("ArrowDown");
    await page.getByRole("option", { name: "Bing" }).press("Enter");
    await expect(engine).toBeFocused();
    await page.reload();
    await expect(engine).toHaveAccessibleDescription("Bing");

    const query = page.getByRole("combobox", { name: "Search or enter a URL" });
    await query.fill("  café & tea  ");
    await query.press("Enter");
    await expect(page).toHaveURL("https://www.bing.com/search?q=caf%C3%A9%20%26%20tea");
    await page.goBack();
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect(page.getByRole("button", { name: "Search again: café & tea" })).toBeVisible();
});

test("replays matching legacy history and can remove it after reload", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { history: '["git notes", {"value":"Tea notes"}, "git notes", 4]' });
    await page.route("https://www.google.com/search?*", (route) => route.fulfill({ body: "Search result fixture" }));
    await page.goto("/");
    const query = page.getByRole("combobox", { name: "Search or enter a URL" });
    const list = page.getByRole("listbox", { name: "Search suggestions" });
    await query.fill("git");
    await expect(list.getByRole("option").first()).toHaveText("git notes");
    await expect(list.getByRole("option", { name: /GitHub/ })).toBeVisible();
    await query.press("ArrowDown");
    await expect(list.getByRole("option", { selected: true })).toHaveText("git notes");
    await query.press("Enter");
    await expect(page).toHaveURL("https://www.google.com/search?q=git%20notes");

    await page.goto("/");
    const history = page.getByRole("list", { name: "Search history" });
    const toggle = page.getByRole("button", { name: "History", exact: true });
    await toggle.click();
    await expect(history.getByRole("button", { name: "Search again: git notes" })).toHaveCount(1);
    await history.getByRole("button", { name: /Delete .*git notes/ }).click();
    await page.reload();
    await toggle.click();
    await expect(history.getByRole("button", { name: "Search again: git notes" })).toHaveCount(0);
    await expect(history.getByRole("button", { name: "Search again: Tea notes" })).toBeVisible();
});

test("validates Advanced Search and sends the submitted filters", async ({ page }) => {
    await page.route("https://www.google.com/search?*", (route) => route.fulfill({ body: "Search result fixture" }));
    await page.goto("/advanced");
    const submit = page.getByRole("button", { name: "Advanced Search", exact: true });
    const words = page.getByRole("textbox", { name: "All these words:" });
    await submit.click();
    await expect(page.getByRole("alert")).toHaveText("Enter at least one search term.");
    await expect(words).toBeFocused();
    await words.fill("birds & oceans");
    await page.getByRole("textbox", { name: "Exact word or phrase:" }).fill('café "été"');
    await page.getByRole("textbox", { name: "None of these words:" }).fill("fish+pet");
    await submit.click();
    await expect(page).toHaveURL("https://www.google.com/search?as_q=birds+%26+oceans&as_epq=caf%C3%A9+%22%C3%A9t%C3%A9%22&as_eq=fish%2Bpet");
});

test("accepts an image completion with Right Arrow and submits to Google Images", async ({ page }) => {
    await page.route("https://www.google.com/search?*", (route) => route.fulfill({ body: "Image result fixture" }));
    await page.goto("/image");
    const query = page.getByRole("textbox", { name: "Search Google Images" });
    await query.fill("space");
    await expect(page.getByRole("status")).toContainText("space station");
    await query.press("Tab");
    await expect(query).toHaveValue("space");
    await expect(page.getByRole("button", { name: "Image Search", exact: true })).toBeFocused();
    await query.focus();
    await query.press("End");
    await query.press("ArrowRight");
    await expect(query).toHaveValue("space station");
    await query.press("Enter");
    await expect(page).toHaveURL("https://www.google.com/search?q=space+station&tbm=isch");
});
