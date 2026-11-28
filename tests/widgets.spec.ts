import { expect, seedStorage, test } from "./browser";

test("switches widgets, restores legacy tasks, and persists edits", async ({ page, baseURL }) => {
    await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"));
    await seedStorage(page, baseURL, {
        activeWidget: "unknown",
        dailyTasks: JSON.stringify({ date: "2026-1-15", tasks: [{ text: "Legacy task", done: true }] }),
    });
    await page.goto("/");
    await expect(page.locator("#widget-container")).toBeEmpty();
    await page.getByRole("button", { name: "Widgets", exact: true }).press("Enter");
    await page.getByRole("button", { name: "Task", exact: true }).press("Enter");
    const tasks = page.getByRole("region", { name: "Daily Tasks" });
    await expect(tasks.getByRole("checkbox", { name: "Legacy task" })).toBeChecked();
    const input = tasks.getByRole("textbox", { name: "New task" });
    await input.fill("Write tests");
    await input.press("Enter");
    await page.reload();
    await expect(tasks.getByRole("checkbox", { name: "Write tests" })).toBeVisible();
    await tasks.getByRole("checkbox", { name: "Legacy task" }).uncheck();
    await page.reload();
    await expect(tasks.getByRole("checkbox", { name: "Legacy task" })).not.toBeChecked();
});

test("preserves a legacy Quick Links icon and adds a validated shortcut", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, {
        activeWidget: "quick-links",
        quickLinks: JSON.stringify([{ name: "GitHub", url: "https://github.com", icon: "fab fa-github" }]),
    });
    await page.goto("/");
    const links = page.getByRole("region", { name: "Quick links" });
    await expect(links.getByRole("link", { name: "Open GitHub" }).locator("use")).toHaveAttribute("href", /#fa-github$/);
    await links.getByRole("button", { name: "Add quick link" }).press("Enter");
    const dialog = page.getByRole("dialog", { name: "Add quick link" });
    const add = dialog.getByRole("button", { name: "Add", exact: true });
    await add.click();
    await expect(dialog.getByRole("alert")).toHaveText("Name is required.");
    await dialog.getByRole("textbox", { name: "Name", exact: true }).fill("Docs");
    await dialog.getByRole("textbox", { name: "URL or site name" }).fill("example.com/docs");
    await add.click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await expect(links.getByRole("link", { name: "Open Docs" })).toHaveAttribute("href", "https://example.com/docs");
});

test("renders weather and air quality, then persists the temperature unit", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { activeWidget: "weather" });
    await page.context().grantPermissions(["geolocation"]);
    await page.context().setGeolocation({ latitude: 41.12, longitude: -72.23 });
    await page.route("https://api.open-meteo.com/**", (route) => route.fulfill({ json: {
        current: { temperature_2m: 22, cloud_cover: 33, relative_humidity_2m: 74 },
    } }));
    await page.route("https://air-quality-api.open-meteo.com/**", (route) => route.fulfill({ json: {
        current: { uv_index: 3, us_aqi: 58 },
    } }));
    await page.goto("/");
    const weather = page.getByRole("region", { name: "Weather" });
    const temperature = weather.getByRole("button", { name: /^Toggle temperature unit/ });
    await expect(temperature).toHaveText("22 °C");
    await temperature.click();
    await page.reload();
    await expect(temperature).toHaveText("72 °F");
    await weather.getByRole("button", { name: /^Cycle right weather metric/ }).click();
    await expect(weather.getByRole("button", { name: /UV Index, 3/ })).toBeVisible();
    await expect(weather.getByRole("link", { name: "CAMS ENSEMBLE" })).toBeVisible();
    await expect(weather.getByRole("link", { name: "View forecast" })).toHaveAttribute("href", /latitude=41\.12/);
});

test("renders the Bitcoin chart and persists its timeframe", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { activeWidget: "crypto" });
    const prices = Array.from({ length: 12 }, (_, index) => [1750000000000 + index * 3600000, 90 + index]);
    await page.route("https://api.coingecko.com/**", (route) => route.fulfill({ json: { prices } }));
    await page.goto("/");
    const crypto = page.getByRole("region", { name: "Crypto", exact: true });
    await expect(crypto).toContainText("$101");
    await expect(crypto.getByRole("link", { name: "Open Bitcoin chart on CoinGecko" })).toBeVisible();
    const week = crypto.getByRole("button", { name: "7D" });
    await week.click();
    await page.reload();
    await expect(week).toHaveAttribute("aria-pressed", "true");
});

test("rechecks the connection on demand with a bodyless request", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { activeWidget: "ping" });
    await page.clock.install({ time: new Date("2026-01-15T12:00:00Z") });
    const requests: { method: string; body: string | null }[] = [];
    let status = 503;
    await page.route("https://cdn.jsdelivr.net/**", (route) => {
        requests.push({ method: route.request().method(), body: route.request().postData() });
        return route.fulfill({ status });
    });
    await page.goto("/");
    const panel = page.getByRole("region", { name: "Connection" });
    await expect(panel.getByRole("status")).toHaveText("CDN check failed");
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const refresh = panel.getByRole("button", { name: "Check connection" });
    await expect(refresh).toHaveAttribute("aria-disabled", "false");
    const initialChecks = requests.length;
    expect(initialChecks).toBeGreaterThan(0);
    status = 200;
    await refresh.press("Enter");
    await expect(refresh).toHaveAccessibleDescription(/HTTP latency to jsDelivr \d+ ms (Excellent|Normal|Bad)/);
    expect(requests).toHaveLength(initialChecks + 1);
    for (const request of requests) expect(request).toEqual({ method: "HEAD", body: null });
});

test("pauses connection polling while hidden and resumes when visible", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { activeWidget: "ping" });
    await page.clock.install({ time: new Date("2026-01-15T12:00:00Z") });
    let checks = 0;
    await page.route("https://cdn.jsdelivr.net/**", (route) => {
        checks++;
        return route.fulfill({ status: 200 });
    });
    await page.goto("/");
    const refresh = page.getByRole("button", { name: "Check connection" });
    await expect(refresh).toHaveAccessibleDescription(/HTTP latency to jsDelivr \d+ ms/);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const initialChecks = checks;

    await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, value: true });
        document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.clock.runFor(12000);
    expect(checks).toBe(initialChecks);

    await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, value: false });
        document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(() => checks).toBe(initialChecks + 1);
    await expect(refresh).toHaveAttribute("aria-disabled", "false");
    await page.getByRole("button", { name: "Widgets", exact: true }).press("Enter");
    await page.getByRole("button", { name: "Task", exact: true }).press("Enter");
    await expect(page.getByRole("region", { name: "Daily Tasks" })).toBeVisible();
    await expect(refresh).toHaveCount(0);
    await page.clock.runFor(12000);
    expect(checks).toBe(initialChecks + 1);
});

test("keeps the widget menu usable when a widget module fails to load", async ({ page, baseURL }) => {
    await seedStorage(page, baseURL, { activeWidget: "weather" });
    await page.route("**/WeatherWidget.tsx*", (route) => route.abort());
    await page.goto("/");
    const weather = page.getByRole("region", { name: "Weather" });
    await expect(weather.getByRole("alert")).toHaveText("Could not load this widget.");
    await expect(weather.getByRole("button", { name: "Reload page" })).toBeVisible();

    await page.getByRole("button", { name: "Widgets", exact: true }).press("Enter");
    await page.getByRole("button", { name: "Task", exact: true }).press("Enter");
    await expect(page.getByRole("textbox", { name: "New task" })).toBeVisible();
});
