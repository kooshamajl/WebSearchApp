import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4176";

export default defineConfig({
    testDir: "./tests",
    use: {
        baseURL,
        reducedMotion: "reduce",
        timezoneId: "UTC",
        trace: "retain-on-failure",
    },
    projects: [
        { name: "chromium", use: { browserName: "chromium" } },
        { name: "edge", use: { browserName: "chromium", channel: "msedge" } },
    ],
    webServer: {
        command: "npm run dev -- --port 4176 --strictPort",
        url: baseURL,
    },
});
