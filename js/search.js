/* ===============================
   Search Bar: submit handling, history, and autocomplete
   Loaded at the end of <body> (see html/web.html), so the DOM elements
   below are guaranteed to already exist -- no DOMContentLoaded wrapper
   needed.
   =============================== */

  const form = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const historyList = document.getElementById("historyList");
  const toggleHistoryBtn = document.getElementById("toggleHistory");
  const autocompleteList = document.getElementById("autocompleteList");

  searchInput.focus();

  /* ---------- Autocomplete ---------- */

  /**
   * A small, curated list of well-known sites shown as suggestions once
   * the user's own search history runs out of matches. Deliberately
   * kept short (rather than an exhaustive directory) so results stay
   * relevant instead of matching every common letter typed.
   */
  const POPULAR_SITES = [
    { name: "Google", url: "google.com" },
    { name: "YouTube", url: "youtube.com" },
    { name: "Gmail", url: "mail.google.com" },
    { name: "GitHub", url: "github.com" },
    { name: "Instagram", url: "instagram.com" },
    { name: "Telegram", url: "web.telegram.org" },
    { name: "Twitter / X", url: "x.com" },
    { name: "LinkedIn", url: "linkedin.com" },
    { name: "Wikipedia", url: "wikipedia.org" },
    { name: "Amazon", url: "amazon.com" },
    { name: "Netflix", url: "netflix.com" },
    { name: "Spotify", url: "open.spotify.com" },
    { name: "Reddit", url: "reddit.com" },
    { name: "Stack Overflow", url: "stackoverflow.com" },
    { name: "ChatGPT", url: "chat.openai.com" },
    { name: "Discord", url: "discord.com" },
    { name: "WhatsApp", url: "web.whatsapp.com" },
    { name: "Aparat", url: "aparat.com" },
    { name: "Digikala", url: "digikala.com" },
    { name: "Divar", url: "divar.ir" },
  ];

  const MAX_SUGGESTIONS = 6;
  const MAX_HISTORY_SUGGESTIONS = 4;

  let acItems = [];   // rendered <li> suggestions currently in the dropdown
  let acIndex = -1;   // index of the keyboard-highlighted suggestion, -1 = none

  /**
   * Builds the combined suggestion list for the given query: up to
   * MAX_HISTORY_SUGGESTIONS matches from the user's own search history,
   * then enough matches from POPULAR_SITES to fill the remaining slots
   * (skipping any site already covered by a history match).
   */
  function getSuggestions(query) {
    const q = query.toLowerCase();

    const historyMatches = (JSON.parse(localStorage.getItem("history")) || [])
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, MAX_HISTORY_SUGGESTIONS)
      .map((item) => ({ type: "history", label: item, value: item }));

    const remainingSlots = MAX_SUGGESTIONS - historyMatches.length;

    const siteMatches = POPULAR_SITES
      .filter(
        (site) =>
          site.name.toLowerCase().includes(q) ||
          site.url.toLowerCase().includes(q)
      )
      .filter(
        (site) => !historyMatches.some((h) => h.value.toLowerCase() === site.url.toLowerCase())
      )
      .slice(0, Math.max(0, remainingSlots))
      .map((site) => ({ type: "site", label: site.name, value: site.url }));

    return [...historyMatches, ...siteMatches];
  }

  /**
   * Returns a DocumentFragment of `text` with the first case-insensitive
   * occurrence of `query` wrapped in a <mark> element, for highlighting
   * the matched part of a suggestion.
   */
  function highlightMatch(text, query) {
    const frag = document.createDocumentFragment();
    const idx = text.toLowerCase().indexOf(query.toLowerCase());

    if (idx === -1) {
      frag.appendChild(document.createTextNode(text));
      return frag;
    }

    frag.appendChild(document.createTextNode(text.slice(0, idx)));

    const mark = document.createElement("mark");
    mark.textContent = text.slice(idx, idx + query.length);
    frag.appendChild(mark);

    frag.appendChild(document.createTextNode(text.slice(idx + query.length)));
    return frag;
  }

  /** Hides and clears the autocomplete dropdown, resetting its state. */
  function closeAutocomplete() {
    autocompleteList.classList.remove("show");
    autocompleteList.innerHTML = "";
    acItems = [];
    acIndex = -1;
    searchInput.setAttribute("aria-expanded", "false");
  }

  /** Applies the "active" (keyboard-highlighted) class to acItems[index] only. */
  function setActiveItem(index) {
    acItems.forEach((li) => li.classList.remove("active"));
    if (index >= 0 && index < acItems.length) {
      acItems[index].classList.add("active");
      acItems[index].scrollIntoView({ block: "nearest" });
    }
  }

  /**
   * Commits a suggestion: fills the search input with its value and
   * submits the form, whether the suggestion was a history entry (goes
   * through the normal URL-vs-search-query logic) or a popular site
   * (its bare domain, e.g. "youtube.com", is itself a valid URL).
   */
  function selectSuggestion(li) {
    searchInput.value = li.dataset.value;
    closeAutocomplete();
    form.requestSubmit();
  }

  /**
   * Renders the autocomplete dropdown for the given query, or closes it
   * if there's nothing to show. Each suggestion <li> stores its
   * navigation value in `dataset.value` so click and keyboard selection
   * can share the same selectSuggestion() logic.
   */
  function renderAutocomplete(query) {
    if (!query) {
      closeAutocomplete();
      return;
    }

    const suggestions = getSuggestions(query);

    if (suggestions.length === 0) {
      closeAutocomplete();
      return;
    }

    autocompleteList.innerHTML = "";
    acIndex = -1;

    acItems = suggestions.map((s) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.dataset.value = s.value;

      const icon = document.createElement("i");
      icon.className =
        s.type === "site"
          ? "fa-solid fa-globe ac-icon"
          : "fa-solid fa-clock-rotate-left ac-icon";
      li.appendChild(icon);

      const labelEl = document.createElement("span");
      labelEl.className = "ac-label";
      labelEl.appendChild(highlightMatch(s.label, query));
      li.appendChild(labelEl);

      if (s.type === "site") {
        const urlEl = document.createElement("span");
        urlEl.className = "ac-url";
        urlEl.textContent = s.value;
        li.appendChild(urlEl);
      }

      // mousedown fires before the input's blur, so the click isn't lost
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectSuggestion(li);
      });

      autocompleteList.appendChild(li);
      return li;
    });

    autocompleteList.classList.add("show");
    searchInput.setAttribute("aria-expanded", "true");
  }

  /**
   * Heuristic for deciding whether the typed text should be treated as
   * a URL to navigate to directly, versus a query to send to Google.
   * Deliberately conservative: only bare domains ("example.com") or
   * explicit http(s) URLs qualify, so plain search phrases containing
   * a period (e.g. "3.5 vs 4.0") aren't mistaken for links.
   */
  function isLikelyUrl(str) {
    if (/\s/.test(str)) return false; // real URLs never contain spaces
    if (/^https?:\/\//i.test(str)) return true;
    // matches things like "example.com" or "sub.example.co.uk/path" only
    return /^([\w-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(str);
  }

  // Live-update the autocomplete dropdown as the user types, and make
  // sure it doesn't overlap with the history dropdown.
  searchInput.addEventListener("input", () => {
    historyList.classList.remove("show");
    renderAutocomplete(searchInput.value.trim());
  });

  // Keyboard navigation within the open autocomplete dropdown.
  searchInput.addEventListener("keydown", (e) => {
    if (!autocompleteList.classList.contains("show")) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      acIndex = Math.min(acIndex + 1, acItems.length - 1);
      setActiveItem(acIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      acIndex = Math.max(acIndex - 1, -1);
      setActiveItem(acIndex);
    } else if (e.key === "Enter" && acIndex >= 0) {
      e.preventDefault();
      selectSuggestion(acItems[acIndex]);
    } else if (e.key === "Escape") {
      closeAutocomplete();
    }
  });

  // Main submit handler: validates input, records it in history, then
  // routes to either a direct URL or a Google search.
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = searchInput.value.trim();

    if (!input) {
      searchInput.classList.add("shake");
      setTimeout(() => searchInput.classList.remove("shake"), 300);
      return;
    }

    closeAutocomplete();
    saveSearch(input);
    renderHistory();

    if (isLikelyUrl(input)) {
      window.location.href = input.startsWith("http")
        ? input
        : "https://" + input;
    } else {
      window.location.href =
        "https://www.google.com/search?q=" + encodeURIComponent(input);
    }
  });

  /** Prepends `value` to the search history, de-duplicated and capped at 5. */
  function saveSearch(value) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift(value);
    history = [...new Set(history)];
    history = history.slice(0, 5);
    localStorage.setItem("history", JSON.stringify(history));
  }

  /**
   * Rebuilds the #historyList dropdown from localStorage. Each entry is
   * keyboard-accessible (tabbable, Enter/Space to re-run the search) in
   * addition to being clickable, and carries its own delete button.
   */
  function renderHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    historyList.innerHTML = "";

    if (history.length === 0) {
      const li = document.createElement("li");
      li.textContent = "History is empty";
      li.style.listStyle = "none";
      li.style.opacity = "0.7";
      li.style.cursor = "default";
      historyList.appendChild(li);
      return;
    }

    history.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = item;
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", `Search again: ${item}`);

      const selectItem = () => {
        searchInput.value = item;
        form.requestSubmit();
      };

      li.addEventListener("click", selectItem);

      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectItem();
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "×";
      deleteBtn.className = "delete-btn";
      deleteBtn.setAttribute("aria-label", `Delete "${item}" from history`);

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        let current = JSON.parse(localStorage.getItem("history")) || [];
        current.splice(index, 1);
        localStorage.setItem("history", JSON.stringify(current));
        renderHistory();
      });

      li.appendChild(deleteBtn);
      historyList.appendChild(li);
    });
  }

  // Toggle the history dropdown via button click or the Ctrl+H shortcut.
  toggleHistoryBtn.addEventListener("click", () => {
    closeAutocomplete();
    historyList.classList.toggle("show");
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "h") {
      e.preventDefault();
      closeAutocomplete();
      historyList.classList.toggle("show");
    }
  });


  // Focus the search input via the "/" keyboard shortcut.
  document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
  });



  // Close either dropdown when the user clicks outside of it.
  document.addEventListener("click", (e) => {
    if (
      historyList.classList.contains("show") &&
      !historyList.contains(e.target) &&
      !toggleHistoryBtn.contains(e.target) &&
      !searchInput.contains(e.target)
    ) {
      historyList.classList.remove("show");
    }

    if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
      closeAutocomplete();
    }
  });

  renderHistory();