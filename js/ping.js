/* ===============================
   Connection (Ping) Widget
   Estimates network latency by timing a small, cached-bypassed request
   to a public CDN file, since there's no backend of our own to ping.
   =============================== */

/**
 * Times a no-cors fetch to a public CDN asset and returns the elapsed
 * time in milliseconds, or "Offline" if it times out / fails.
 * `mode: "no-cors"` means we can't read the response body or status,
 * but we don't need to -- only the round-trip time matters here.
 */
async function pingFetch() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const start = performance.now();

    await fetch(
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
      {
        cache: "no-store",
        mode: "no-cors",
        signal: controller.signal
      }
    );

    const end = performance.now();
    clearTimeout(timeout);

    return Math.round(end - start);
  } catch (e) {
    return "Offline";
  }
}

/** Maps a ping value to a short human-readable status label. */
function getStatus(ping) {
  if (typeof ping !== "number") return "Offline";
  if (ping < 100) return "Excellent";
  if (ping < 300) return "Normal";
  return "Bad";
}

/**
 * Icon for the current connection state. Font Awesome's free tier only
 * ships one wifi glyph, so "good" and "warn" intentionally share it --
 */
function getIcon(ping) {
  return typeof ping === "number" ? "fa-solid fa-wifi" : "fa-solid fa-triangle-exclamation";
}

/**
 * Runs a ping check and updates the widget's value/status/icon,
 * replaying a small "pulse" animation on every refresh.
 */
async function updatePing() {
  const el = document.getElementById("pingValue");
  const icon = document.getElementById("pingIcon");
  const status = document.getElementById("pingStatus");

  if (!el || !icon || !status) return;

  const ping = await pingFetch();

  if (typeof ping === "number") {
    const safePing = Math.min(ping, 999);

    el.textContent = safePing + " ms";
    status.textContent = getStatus(safePing);
    icon.className = getIcon(safePing);
  } else {
    el.textContent = "Offline";
    status.textContent = "Disconnected";
    icon.className = getIcon(ping);
  }

  // Re-trigger the CSS pulse animation by removing and re-adding the class.
  el.classList.remove("ping-animate");
  void el.offsetWidth;
  el.classList.add("ping-animate");
}

let pingIntervalId;

/**
 * Entry point called by widget-loader.js once ping.html has been
 * injected into #widget-container.
 */
function initPingWidget() {
  updatePing();

  if (pingIntervalId) clearInterval(pingIntervalId);
  pingIntervalId = setInterval(updatePing, 4000);

  // The widget is styled with cursor: pointer (see css/widgets.css) to invite
  // a manual refresh instead of waiting up to 4s for the next scheduled tick.
  const widget = document.getElementById("pingWidget");
  if (widget) {
    widget.addEventListener("click", () => updatePing());
  }
}
