import { expect, test } from "@playwright/test";
import type { SearchEngine } from "../src/data/searchEngines";
import { buildAdvancedSearchUrl } from "../src/utils/advancedSearch";
import { buildImageSearchUrl, getImageSearchSuggestion } from "../src/utils/imageSearch";
import { buildSearchUrl } from "../src/utils/search";
import { getSearchSuggestions } from "../src/utils/searchSuggestions";

test("encodes search terms for each engine", () => {
    const destinations: Record<SearchEngine, string> = {
        google: "https://www.google.com/search?q=",
        bing: "https://www.bing.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
    };

    for (const engine of ["google", "bing", "duckduckgo"] as const) {
        expect(buildSearchUrl("  café & tea  ", engine)).toBe(`${destinations[engine]}caf%C3%A9%20%26%20tea`);
    }
});

test("opens direct web addresses and keeps site operators as search terms", () => {
    expect(buildSearchUrl(" example.com/docs ", "bing")).toBe("https://example.com/docs");
    expect(buildSearchUrl("http://example.com:8080/?x=1", "google")).toBe("http://example.com:8080/?x=1");
    expect(buildSearchUrl("site:example.com trees", "duckduckgo")).toBe("https://duckduckgo.com/?q=site%3Aexample.com%20trees");
});

test("encodes advanced filters independently and ignores empty fields", () => {
    const result = buildAdvancedSearchUrl({ as_q: " birds & oceans ", as_epq: ' café "été" ', as_oq: " ", as_eq: "fish+pet" });
    expect(result).toBe("https://www.google.com/search?as_q=birds+%26+oceans&as_epq=caf%C3%A9+%22%C3%A9t%C3%A9%22&as_eq=fish%2Bpet");
    expect(buildAdvancedSearchUrl({ as_q: "  " })).toBeNull();
});

test("prioritizes matching history and suppresses its duplicate site suggestion", () => {
    const history = ["GitHub.com", "git commands", "learn git", "git aliases", "git tools"]
        .map((value) => ({ value, time: null }));
    const results = getSearchSuggestions(" gIt ", history);

    expect(results.filter((result) => result.type === "history").map((result) => result.value))
        .toEqual(["GitHub.com", "git commands", "learn git", "git aliases"]);
    expect(results.some((result) => result.type === "site" && result.value === "github.com")).toBe(false);
    expect(getSearchSuggestions(" ", history)).toEqual([]);
});

test("builds Google Images destinations and prefers stored completions", () => {
    const url = new URL(buildImageSearchUrl("night sky & clouds"));
    expect(url.origin).toBe("https://www.google.com");
    expect(url.searchParams.get("tbm")).toBe("isch");
    expect(url.searchParams.get("q")).toBe("night sky & clouds");
    expect(getImageSearchSuggestion("spa", ["Space Shuttle", "Spa Day"])).toBe("Spa Day");
});
