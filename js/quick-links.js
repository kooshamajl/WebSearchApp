/* ===============================
   Quick Links Widget
   A small row of shortcut icons, persisted in localStorage and capped
   at MAX_QUICK_LINKS. Ships with the same 6 sites this widget used to
   hard-code (see DEFAULT_LINKS) as the seed for first-time visitors.

   "Add Quick Link" resolves whatever the user types against the
   shared POPULAR_SITES data (js/sites-data.js, loaded before this
   file) so a known site name reuses its existing icon/domain, instead
   of duplicating that list here.
   =============================== */

function initQuickLinksWidget() {

  const MAX_QUICK_LINKS = 6;
  const STORAGE_KEY = "quickLinks";

  /** Seeded for first-time visitors; matches the widget's previous static markup. */
  const DEFAULT_LINKS = [
    { name: "YouTube", url: "https://youtube.com", icon: "fab fa-youtube" },
    { name: "Instagram", url: "https://instagram.com", icon: "fab fa-instagram" },
    { name: "ChatGPT", url: "https://chat.openai.com", icon: "fas fa-robot" },
    { name: "GitHub", url: "https://github.com", icon: "fab fa-github" },
    { name: "Gmail", url: "https://mail.google.com", icon: "fas fa-envelope" },
    { name: "Drive", url: "https://drive.google.com", icon: "fab fa-google-drive" },
  ];

  let links = [];

  const row = document.getElementById("quickLinksRow");
  const addBtn = document.getElementById("quickLinkAddBtn");
  const popover = document.getElementById("quickLinkPopover");
  const nameInput = document.getElementById("quickLinkName");
  const urlInput = document.getElementById("quickLinkUrl");
  const errorEl = document.getElementById("quickLinkError");
  const saveBtn = document.getElementById("quickLinkSaveBtn");
  const cancelBtn = document.getElementById("quickLinkCancelBtn");

  if (!row || !addBtn || !popover) return;

  /* ---------- Persistence ---------- */

  /** Loads saved links, seeding + persisting the defaults on first run. */
  function loadLinks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch {
      /* fall through to defaults */
    }
    saveLinks(DEFAULT_LINKS);
    return DEFAULT_LINKS.slice();
  }

  function saveLinks(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  /* ---------- Name / URL resolution ---------- */

  /**
   * Strips a leading "www." and any path/query, for comparing two URLs
   * by the site they actually point to rather than their exact string.
   */
  function getHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Conservative URL heuristic shared with js/search.js's isLikelyUrl:
   * only a bare domain ("example.com") or an explicit http(s) URL
   * counts, so a plain word doesn't get misread as one.
   */
  function isLikelyUrl(str) {
    if (/\s/.test(str)) return false;
    if (/^https?:\/\//i.test(str)) return true;
    return /^([\w-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(str);
  }

  /**
   * Resolves the "URL or site name" field into a { url, icon } pair.
   * A name/domain matching POPULAR_SITES (js/sites-data.js) wins first
   * and reuses that entry's icon; otherwise the input is only accepted
   * if it already looks like a real URL/domain, with the default
   * monochrome icon. Returns null when nothing valid was entered.
   */
  function resolveLink(input) {
    const raw = input.trim();
    if (!raw) return null;

    const normalized = raw.toLowerCase().replace(/^https?:\/\//i, "");

    const known = POPULAR_SITES.find(
      (site) =>
        site.name.toLowerCase() === normalized ||
        site.url.toLowerCase() === normalized
    );
    if (known) {
      return { url: "https://" + known.url, icon: known.icon || DEFAULT_SITE_ICON };
    }

    if (!isLikelyUrl(raw)) return null;

    const url = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    return { url, icon: DEFAULT_SITE_ICON };
  }

  /* ---------- Rendering ---------- */

  const widget = document.getElementById("quickLinks");

  /**
   * Rebuilds the link row. When `animate` is true, the widget's width
   * is briefly locked to its old value and then transitioned to the
   * new one, so adding/removing a link resizes the widget smoothly
   * instead of snapping -- same technique js/DailyTask.js uses for
   * its own height changes, applied to width here since this widget
   * grows/shrinks horizontally.
   */
  function renderLinks(animate = true) {
    const startWidth = animate && widget ? widget.getBoundingClientRect().width : null;

    row.innerHTML = "";

    if (links.length === 0) {
      // Empty state, same idea as .tasks-empty's "No tasks yet" / the
      // history dropdown's "History is empty" -- so removing every
      // link leaves a small placeholder instead of a blank gap.
      // Styled inline (not a new CSS class) since it's just a couple
      // of properties reusing the existing --widget-text-muted token.
      const empty = document.createElement("span");
      empty.textContent = "No quick links yet";
      empty.style.fontSize = "11px";
      empty.style.color = "var(--widget-text-muted)";
      empty.style.opacity = "0.75";
      row.appendChild(empty);
    }

    links.forEach((link, index) => {
      const item = document.createElement("span");
      item.className = "quick-link-item";

      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.title = link.name;
      a.setAttribute("aria-label", `Open ${link.name}`);

      const icon = document.createElement("i");
      icon.className = link.icon || DEFAULT_SITE_ICON;
      icon.setAttribute("aria-hidden", "true");
      a.appendChild(icon);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "quick-link-remove";
      removeBtn.innerHTML = "&times;";
      removeBtn.setAttribute("aria-label", `Remove ${link.name}`);
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        links.splice(index, 1);
        saveLinks(links);
        renderLinks();
        updateAddAvailability();
      });

      item.append(a, removeBtn);
      row.appendChild(item);
    });

    if (startWidth !== null) {
      const endWidth = widget.getBoundingClientRect().width;

      widget.style.width = startWidth + "px";
      void widget.offsetWidth; // force reflow so the width change below animates

      requestAnimationFrame(() => {
        widget.style.width = endWidth + "px";
      });

      widget.addEventListener("transitionend", function handler(e) {
        if (e.propertyName !== "width") return;
        widget.style.width = "";
        widget.removeEventListener("transitionend", handler);
      });
    }
  }

  function updateAddAvailability() {
    const limitReached = links.length >= MAX_QUICK_LINKS;
    addBtn.disabled = limitReached;
    addBtn.title = limitReached ? `Limit reached (${MAX_QUICK_LINKS})` : "Add quick link";
  }

  /* ---------- Add popover ---------- */

  function showError(message) {
    errorEl.textContent = message;
  }

  /**
   * Marks `input` as the invalid field: a subtle border-color change
   * (see .quick-link-input.invalid in css/widgets.css) plus the same
   * brief "shake" cue already used for empty/invalid input elsewhere
   * in the app (js/search.js's searchInput, js/DailyTask.js's
   * taskInput), instead of relying on the shared error text alone.
   */
  function markInvalid(input) {
    input.classList.add("invalid");
    input.classList.remove("shake");
    void input.offsetWidth; // restart the animation if it's already mid-way
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 300);
  }

  /** Clears the invalid state from both fields, e.g. before a fresh attempt. */
  function clearInvalid() {
    nameInput.classList.remove("invalid");
    urlInput.classList.remove("invalid");
  }

  function openPopover() {
    if (addBtn.disabled) return;
    nameInput.value = "";
    urlInput.value = "";
    showError("");
    clearInvalid();
    popover.classList.add("open");
    addBtn.setAttribute("aria-expanded", "true");
    nameInput.focus();
  }

  function closePopover() {
    popover.classList.remove("open");
    addBtn.setAttribute("aria-expanded", "false");
  }

  function handleSave() {
    clearInvalid();

    const name = nameInput.value.trim();
    if (!name) {
      showError("Name is required.");
      markInvalid(nameInput);
      return;
    }

    const resolved = resolveLink(urlInput.value);
    if (!resolved) {
      showError("Enter a valid URL");
      markInvalid(urlInput);
      return;
    }

    const newHost = getHostname(resolved.url);
    if (links.some((l) => getHostname(l.url) === newHost)) {
      showError("That link is already in your Quick Links.");
      markInvalid(urlInput);
      return;
    }

    if (links.length >= MAX_QUICK_LINKS) {
      showError(`You can only have ${MAX_QUICK_LINKS} quick links.`);
      return;
    }

    showError("");
    links.push({ name, url: resolved.url, icon: resolved.icon });
    saveLinks(links);
    renderLinks();
    updateAddAvailability();
    closePopover();
  }

  addBtn.addEventListener("click", openPopover);
  cancelBtn.addEventListener("click", closePopover);
  saveBtn.addEventListener("click", handleSave);

  // Clear a field's invalid state as soon as the user starts fixing it,
  // rather than leaving the border red until the next Add attempt.
  [nameInput, urlInput].forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("invalid");
    });
  });

  [nameInput, urlInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        closePopover();
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (
      popover.classList.contains("open") &&
      !popover.contains(e.target) &&
      !addBtn.contains(e.target)
    ) {
      closePopover();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popover.classList.contains("open")) {
      closePopover();
    }
  });

  links = loadLinks();
  renderLinks(false);
  updateAddAvailability();
}

// widgetName "quick-links" -> initFunctionName "initQuick-linksWidget"
// (see js/widget-loader.js's naming convention). The hyphen makes this
// an invalid `function` identifier, so it's exposed as a plain window
// property instead, same as any other init function it looks up.
window["initQuick-linksWidget"] = initQuickLinksWidget;