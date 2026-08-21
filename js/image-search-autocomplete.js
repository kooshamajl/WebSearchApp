/* ===============================
   Image Search - Inline Autocomplete ("Ghost Text")
   Shows a low-opacity completion inline inside the search bar as the
   user types (e.g. typing "d" shows "d" + a faint "igital art"),
   instead of a separate dropdown list. That dropdown pattern already
   exists for Web Search (see js/search.js + css/history-search.css)
   and is intentionally NOT reused here -- this is a distinct,
   Image-Search-only interaction.

   Suggestions come from two sources, in priority order: the user's
   own recent searches (see IMAGE_SEARCH_HISTORY_KEY), then the
   curated IMAGE_SEARCH_SUGGESTIONS dataset below.
   =============================== */

/**
 * Realistic Image Search queries, grouped by category purely for
 * readability/maintenance. Matching itself works against a flattened,
 * de-duplicated list built from this object (see IMAGE_SUGGESTIONS_FLAT
 * below) -- the category grouping has no effect on suggestion order.
 *
 * Deliberately excludes website/brand names: these are meant to read
 * like real image-search queries, not navigation shortcuts.
 */
const IMAGE_SEARCH_SUGGESTIONS = {
  "AI & Generative Art": [
    "ai generated art",
    "ai portrait",
    "ai fantasy art",
    "ai cyberpunk city",
    "ai character design",
    "ai landscape",
    "ai avatar",
    "ai logo design",
    "ai concept art",
    "ai futuristic architecture",
    "ai anime art",
    "ai 3d render",
    "ai realistic portrait",
    "ai product visualization",
    "ai sci fi artwork",
    "ai generated wallpaper",
    "ai digital painting",
    "ai dreamlike art",
  ],
  "Wallpapers": [
    "4k wallpaper",
    "desktop wallpaper",
    "minimal wallpaper",
    "dark wallpaper",
    "amoled wallpaper",
    "aesthetic wallpaper",
    "nature wallpaper",
    "gaming wallpaper",
    "cyberpunk wallpaper",
    "futuristic wallpaper",
    "abstract wallpaper",
    "iphone wallpaper",
    "android wallpaper",
    "ultrawide wallpaper",
    "minimalist gradient wallpaper",
    "pastel wallpaper",
    "anime wallpaper",
  ],
  "Technology": [
    "artificial intelligence technology",
    "futuristic technology",
    "robot technology",
    "humanoid robot",
    "computer setup",
    "gaming pc setup",
    "mechanical keyboard",
    "coding setup",
    "developer desk setup",
    "cyber security concept",
    "cloud computing illustration",
    "futuristic interface design",
    "holographic interface",
    "quantum computing concept",
    "smart wearable technology",
  ],
  "Cars": [
    "electric car",
    "luxury car",
    "sports car",
    "futuristic car",
    "car interior design",
    "supercar wallpaper",
    "racing car",
    "classic car",
    "cyberpunk car",
    "automotive photography",
    "car engine close up",
    "motorcycle photography",
  ],
  "Nature": [
    "mountain landscape",
    "forest photography",
    "ocean waves",
    "sunset beach",
    "northern lights",
    "desert landscape",
    "waterfall",
    "tropical island",
    "snowy mountains",
    "wildlife photography",
    "autumn forest",
    "lake reflection",
    "foggy forest morning",
    "rainy window view",
  ],
  "Space": [
    "galaxy wallpaper",
    "milky way",
    "black hole",
    "astronaut",
    "planet earth from space",
    "space station",
    "nebula",
    "futuristic spaceship",
    "mars landscape",
    "cosmic background",
    "solar eclipse",
    "deep space telescope image",
  ],
  "Architecture": [
    "modern house design",
    "futuristic building",
    "skyscraper photography",
    "minimal architecture",
    "interior design inspiration",
    "luxury apartment design",
    "smart home design",
    "japanese architecture",
    "urban photography",
    "glass building facade",
    "brutalist architecture",
  ],
  "Gaming": [
    "gaming setup",
    "gaming room",
    "esports setup",
    "fantasy game character",
    "game environment design",
    "pixel art",
    "game ui design",
    "fantasy landscape",
    "rpg character concept art",
    "open world game screenshot",
  ],
  "Photography": [
    "street photography",
    "portrait photography",
    "product photography",
    "cinematic photography",
    "night photography",
    "macro photography",
    "wildlife photography",
    "black and white photography",
    "travel photography",
    "long exposure photography",
    "aerial drone photography",
  ],
  "Digital Art & Design": [
    "digital painting",
    "concept art",
    "3d character render",
    "blender 3d render",
    "abstract art",
    "gradient background",
    "ui ux inspiration",
    "creative illustration",
    "motion design inspiration",
    "poster design",
    "low poly art",
    "isometric illustration",
  ],
  "Food": [
    "food photography",
    "coffee photography",
    "dessert photography",
    "restaurant interior",
    "healthy food",
    "modern cuisine",
    "baking photography",
    "street food photography",
    "minimalist food plating",
  ],
  "Fashion": [
    "street fashion",
    "modern outfit ideas",
    "luxury fashion",
    "sneaker photography",
    "fashion portrait",
    "minimalist outfit",
    "vintage fashion style",
    "fashion editorial photography",
  ],
  "Travel": [
    "europe travel",
    "city skyline",
    "hidden places",
    "tropical vacation",
    "mountain travel",
    "adventure photography",
    "desert road trip",
    "ancient ruins travel",
  ],
  "Animals": [
    "cute cat",
    "dog portrait",
    "wild animals",
    "lion photography",
    "bird photography",
    "underwater animals",
    "pet photography",
    "horse photography",
    "baby animals photography",
  ],
};

/**
 * Flattened, de-duplicated list used for matching. A handful of
 * queries (e.g. "wildlife photography") legitimately belong to more
 * than one category above; de-duping here just avoids testing the
 * same string twice per keystroke.
 */
const IMAGE_SUGGESTIONS_FLAT = [
  ...new Set(Object.values(IMAGE_SEARCH_SUGGESTIONS).flat()),
];

// localStorage key + cap for the user's own recent Image Search
// queries. Kept small (10) since these are only ever used as
// autocomplete suggestions, not shown as a browsable list.
const IMAGE_SEARCH_HISTORY_KEY = "imageSearchHistory";
const IMAGE_SEARCH_HISTORY_LIMIT = 10;

/** Reads the saved recent-search list (most recent first). */
function getImageSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_SEARCH_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Prepends `query` to the recent-search list, de-duplicated (case
 * insensitive) and capped at IMAGE_SEARCH_HISTORY_LIMIT. Called from
 * html/image.html's submit handler once a search actually goes out.
 */
function saveImageSearchHistory(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  let history = getImageSearchHistory();
  history = [trimmed, ...history.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())];
  history = history.slice(0, IMAGE_SEARCH_HISTORY_LIMIT);
  localStorage.setItem(IMAGE_SEARCH_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Returns the shortest entry in `list` that starts with
 * `normalizedQuery` (already lowercased) and is longer than it, or
 * null if nothing matches. Ties are broken alphabetically for stable,
 * predictable results. Shared by both the history and dataset lookups
 * in getImageSearchSuggestion() below.
 */
function findShortestPrefixMatch(list, normalizedQuery) {
  let best = null;
  for (const entry of list) {
    const candidate = entry.toLowerCase();
    if (!candidate.startsWith(normalizedQuery) || candidate.length === normalizedQuery.length) {
      continue;
    }
    if (
      !best ||
      candidate.length < best.length ||
      (candidate.length === best.length && candidate < best)
    ) {
      best = entry; // keep the original casing (matters for history entries)
    }
  }
  return best;
}

/**
 * Finds the best inline completion for `query`. The user's own recent
 * searches (see IMAGE_SEARCH_HISTORY_KEY) are checked first and win
 * over the curated dataset, so a phrase they've actually searched
 * before is suggested ahead of a generic one -- e.g. after searching
 * "cyberpunk city lights" once, typing "cyber" suggests that again
 * before falling back to the shorter "cyberpunk car".
 *
 * Returns the full suggestion string, or null when there's nothing to
 * suggest (empty query, no match, or the query already equals a
 * suggestion with nothing left to complete).
 */
function getImageSearchSuggestion(query) {
  const normalized = query.toLowerCase();
  if (!normalized) return null;

  const historyMatch = findShortestPrefixMatch(getImageSearchHistory(), normalized);
  if (historyMatch) return historyMatch;

  return findShortestPrefixMatch(IMAGE_SUGGESTIONS_FLAT, normalized);
}

/**
 * Wires up the ghost-text overlay for a given search input.
 *
 * @param {HTMLInputElement} input        The real, user-facing search field.
 * @param {HTMLElement} typedEl           Invisible span mirroring the typed text (spacing only).
 * @param {HTMLElement} remainderEl       Low-opacity span showing the suggested completion.
 */
function initImageSearchAutocomplete(input, typedEl, remainderEl) {
  /** Re-renders the ghost overlay to match the input's current value. */
  function render() {
    const value = input.value;
    const suggestion = getImageSearchSuggestion(value);

    // The invisible spacer always mirrors the real value, so the
    // suggestion (if any) lines up right after the user's own text.
    typedEl.textContent = value;

    if (suggestion) {
      remainderEl.textContent = suggestion.slice(value.length);
      // Toggling the class (rather than just changing text) is what
      // drives the fade transition defined in css/image-search.css.
      remainderEl.classList.add("visible");
    } else {
      remainderEl.textContent = "";
      remainderEl.classList.remove("visible");
    }
  }

  /** Commits the currently displayed suggestion into the real input. */
  function acceptSuggestion() {
    const suggestion = getImageSearchSuggestion(input.value);
    if (!suggestion) return false;

    input.value = suggestion;
    render();
    return true;
  }

  input.addEventListener("input", render);

  // Tab and Right-arrow (when the caret already sits at the end of the
  // text) accept the suggestion -- the same shortcuts browsers use for
  // their own address-bar autocomplete, so the interaction feels
  // familiar rather than bespoke.
  input.addEventListener("keydown", (e) => {
    const caretAtEnd = input.selectionStart === input.value.length;

    if (e.key === "Tab" && getImageSearchSuggestion(input.value)) {
      e.preventDefault();
      acceptSuggestion();
    } else if (e.key === "ArrowRight" && caretAtEnd) {
      if (acceptSuggestion()) e.preventDefault();
    }
  });

  // Suggestions are only meaningful while the field has focus; clear
  // the ghost text on blur so it doesn't linger over an unfocused bar.
  input.addEventListener("blur", () => {
    remainderEl.textContent = "";
    remainderEl.classList.remove("visible");
  });
}