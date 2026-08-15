/* ===============================
   Search Engine Selector
   Compact glassmorphism dropdown embedded in the main search bar
   (see .engine-select in html/web.html) that lets the user choose
   which engine plain-text queries are sent to. The chosen engine is
   persisted in localStorage and read by js/search.js's submit
   handler.

   Loaded before js/search.js (see html/web.html) so SEARCH_ENGINES
   and getSelectedEngine() are ready when the submit handler needs
   them. Like search.js, it relies on running at the end of <body>,
   so no DOMContentLoaded wrapper is needed.
   =============================== */

const ENGINE_STORAGE_KEY = "selectedSearchEngine";
const DEFAULT_ENGINE = "google";

/**
 * Supported engines and how to build a search URL for each. Shared
 * with js/search.js, which calls SEARCH_ENGINES[getSelectedEngine()]
 * .searchUrl(query) for any input that isn't itself a URL.
 */
const SEARCH_ENGINES = {
  google: {
    name: "Google",
    searchUrl: (q) => "https://www.google.com/search?q=" + encodeURIComponent(q),
  },
  bing: {
    name: "Bing",
    searchUrl: (q) => "https://www.bing.com/search?q=" + encodeURIComponent(q),
  },
  duckduckgo: {
    name: "DuckDuckGo",
    searchUrl: (q) => "https://duckduckgo.com/?q=" + encodeURIComponent(q),
  },
};

const engineSelect = document.getElementById("engineSelect");
const engineBtn = document.getElementById("engineSelectBtn");
const engineMenu = document.getElementById("engineMenu");
const engineIconSlot = document.getElementById("engineIconSlot");
const engineNameEl = document.getElementById("engineName");
const engineOptions = engineMenu ? Array.from(engineMenu.querySelectorAll("li")) : [];

/**
 * Returns the currently persisted engine key, falling back to Google
 * if nothing (valid) is stored yet -- e.g. first visit, or a stale
 * key from a future version that added/removed an engine.
 */
function getSelectedEngine() {
  const stored = localStorage.getItem(ENGINE_STORAGE_KEY);
  return SEARCH_ENGINES[stored] ? stored : DEFAULT_ENGINE;
}

/**
 * Syncs the button (icon + name) and the menu's checkmark/aria-selected
 * state to `key`, without touching localStorage. Used both on load
 * (to restore a previously saved engine) and immediately on selection
 * (so the UI updates without a page reload).
 */
function applyEngineSelection(key) {
  const engine = SEARCH_ENGINES[key];
  const option = engineOptions.find((li) => li.dataset.engine === key);
  if (!engine || !option) return;

  // Reuse the option's own icon markup (FA icon or inline SVG) as the
  // single source of truth, instead of duplicating it here.
  const optionIcon = option.querySelector(".engine-menu-icon");
  engineIconSlot.innerHTML = optionIcon ? optionIcon.innerHTML : "";
  engineNameEl.textContent = engine.name;

  engineOptions.forEach((li) => {
    const isSelected = li.dataset.engine === key;
    li.setAttribute("aria-selected", isSelected ? "true" : "false");
    li.tabIndex = isSelected ? 0 : -1;
  });
}

/** Opens the dropdown and moves focus to the currently selected option. */
function openEngineMenu() {
  // Avoid overlapping with the autocomplete/history dropdowns, which
  // also live inside/near the search bar. Guarded with typeof since
  // js/search.js (which defines these) loads after this file, but by
  // the time a user can actually open this menu it's always ready.
  if (typeof closeAutocomplete === "function") closeAutocomplete();
  if (typeof historyList !== "undefined") historyList.classList.remove("show");

  engineSelect.classList.add("open");
  engineBtn.setAttribute("aria-expanded", "true");
  const selected = engineOptions.find((li) => li.getAttribute("aria-selected") === "true");
  if (selected) selected.focus();
}

/** Closes the dropdown. Optionally returns focus to the trigger button. */
function closeEngineMenu(focusButton) {
  engineSelect.classList.remove("open");
  engineBtn.setAttribute("aria-expanded", "false");
  if (focusButton) engineBtn.focus();
}

function isEngineMenuOpen() {
  return engineSelect.classList.contains("open");
}

/** Commits `key` as the chosen engine: persists, updates the UI, closes. */
function selectEngine(key, focusButton) {
  localStorage.setItem(ENGINE_STORAGE_KEY, key);
  applyEngineSelection(key);
  closeEngineMenu(focusButton);
}

if (engineSelect && engineBtn && engineMenu) {
  // Restore any previously saved choice on load.
  applyEngineSelection(getSelectedEngine());

  engineBtn.addEventListener("click", () => {
    if (isEngineMenuOpen()) {
      closeEngineMenu(false);
    } else {
      openEngineMenu();
    }
  });

  engineBtn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEngineMenu();
    }
  });

  engineOptions.forEach((li) => {
    li.addEventListener("click", () => selectEngine(li.dataset.engine, true));

    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectEngine(li.dataset.engine, true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = engineOptions.indexOf(li);
        engineOptions[Math.min(idx + 1, engineOptions.length - 1)].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = engineOptions.indexOf(li);
        engineOptions[Math.max(idx - 1, 0)].focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeEngineMenu(true);
      } else if (e.key === "Tab") {
        closeEngineMenu(false);
      }
    });
  });

  // Close on outside click.
  document.addEventListener("click", (e) => {
    if (isEngineMenuOpen() && !engineSelect.contains(e.target)) {
      closeEngineMenu(false);
    }
  });

  // Close on Escape from anywhere (e.g. focus lands back on the button).
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isEngineMenuOpen()) {
      closeEngineMenu(true);
    }
  });
}
