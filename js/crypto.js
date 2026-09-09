/* ===============================
   Crypto Price Widget (Neon Chart)
   Renders a small glowing sparkline of Bitcoin's price using the
   CoinGecko public API, with a 24H/7D toggle for the chart and the
   percentage-change figure.

   Data model: ONE 7-day historical request (~hourly points) is kept
   as `priceHistory`, an array of { t: timestampMs, p: price } points.
   Both the 24H and 7D views (and the "current" price) are derived
   from that single coherent, evenly-spaced dataset -- there's no
   separate live-price poll appending differently-spaced points onto
   it, which used to make the array's time spacing inconsistent.

   If the API is unreachable, the widget falls back to synthetic demo
   data and clearly labels it as such (see isDemoData) instead of
   silently pretending it's real.
   =============================== */

const MAX_POINTS = 45; // chart points to actually render, after downsampling
const REFRESH_MS = 5 * 60 * 1000; // 5 minutes
const DAY_MS = 24 * 60 * 60 * 1000;
const TIMEFRAME_KEY = "cryptoTimeframe"; // localStorage key for the 24H/7D choice

let priceHistory = []; // [{ t, p }, ...], oldest first, ~7 days of hourly points
let currentTimeframe = loadTimeframePref(); // "24h" | "7d" -- restored from localStorage, defaults to "24h"
let intervalId;
let isDemoData = false;

/* ---------- Helpers ---------- */

/** Reads the saved 24H/7D choice, defaulting to "24h" if missing/invalid. */
function loadTimeframePref() {
  const saved = localStorage.getItem(TIMEFRAME_KEY);
  return saved === "24h" || saved === "7d" ? saved : "24h";
}

/** Reflects `currentTimeframe` onto the toggle buttons' active/aria-pressed state. */
function syncTimeframeButtons() {
  document.querySelectorAll(".tf-btn").forEach(btn => {
    const active = btn.dataset.tf === currentTimeframe;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

/** Reads a CSS custom property from :root, e.g. cssVar('--neon-success'). */
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Converts a "#RRGGBB" hex color into an "R,G,B" string for rgba(). */
function hexToRgb(hex) {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  return m.map(x => parseInt(x, 16)).join(",");
}

/**
 * Reduces `points` to at most `maxPoints` for cheap Canvas rendering
 * (the widget is a small sparkline, not a data-dense chart). Always
 * keeps the true last point so the chart's end matches the actual
 * latest price.
 */
function downsample(points, maxPoints) {
  if (points.length <= maxPoints) return points;
  const step = points.length / maxPoints;
  const out = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.floor(i * step)]);
  }
  out[out.length - 1] = points[points.length - 1];
  return out;
}

/** The slice of priceHistory belonging to the currently selected timeframe. */
function getSliceForTimeframe(tf) {
  if (tf === "24h") {
    const cutoff = priceHistory[priceHistory.length - 1].t - DAY_MS;
    const slice = priceHistory.filter(pt => pt.t >= cutoff);
    // Hourly data should easily cover the last 24h; fall back to the
    // full history only if something left an unexpectedly sparse set.
    return slice.length >= 2 ? slice : priceHistory;
  }
  return priceHistory; // "7d" -- the whole (~7-day) history
}

/* ---------- Init ---------- */

/**
 * Entry point called by widget-loader.js once crypto.html has been
 * injected into #widget-container. Fetches ~7 days of price history
 * (used to derive both 24H and 7D), then starts polling for updates.
 */
async function initCryptoWidget() {
  // HTML always ships with "24H" marked active -- if a "7d" preference
  // was restored from localStorage, reflect that before the first render.
  syncTimeframeButtons();

  await fetchHistory();

  // Re-create the interval on every init so switching widgets away and
  // back doesn't stack up multiple concurrent pollers.
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(fetchHistory, REFRESH_MS);

  // The widget is styled with cursor: pointer (see css/widgets.css) to invite
  // a click-through to the full chart, same as the weather widget does.
  const chart = document.getElementById("cryptoChart");
  if (chart) {
    chart.addEventListener("click", () => {
      window.open("https://www.coingecko.com/en/coins/bitcoin", "_blank");
    });
  }

  // 24H/7D toggle. stopPropagation keeps a toggle click from also
  // triggering the widget-wide "open CoinGecko" click handler above.
  document.querySelectorAll(".tf-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setTimeframe(btn.dataset.tf);
    });
  });
}

/** Switches the active timeframe, persists the choice, updates the toggle's visual state, and re-renders. */
function setTimeframe(tf) {
  if (tf === currentTimeframe) return;
  currentTimeframe = tf;
  localStorage.setItem(TIMEFRAME_KEY, tf);

  syncTimeframeButtons();
  render();
}

/* ---------- Data Fetch ---------- */

/**
 * Fetches ~7 days of Bitcoin price history in ONE request and derives
 * everything the widget needs (current price, 24H, 7D, chart) from
 * it -- no separate "current price" or per-timeframe requests.
 */
async function fetchHistory() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
    );
    const data = await res.json();

    if (!data.prices || data.prices.length < 2)
      throw new Error("No data returned");

    priceHistory = data.prices.map(([t, p]) => ({ t, p }));
    isDemoData = false;
    render();

  } catch (err) {
    console.error("History fetch error:", err);

    // API unreachable/rate-limited: fall back to a synthetic wave so the
    // widget still has *something* to draw, but flag it via isDemoData
    // so updateText() can make that visible to the user instead of
    // showing fake numbers as if they were real. Built as real hourly
    // points over 7 days so getSliceForTimeframe() works identically.
    const now = Date.now();
    priceHistory = [];
    const hours = 7 * 24;
    for (let i = hours; i >= 0; i--) {
      priceHistory.push({
        t: now - i * 60 * 60 * 1000,
        p: 45000 + Math.sin((hours - i) / 8) * 800,
      });
    }

    isDemoData = true;
    render();
  }
}

/** Re-derives the current timeframe's slice and redraws the chart + text. Also used by resize/theme redraw triggers. */
function render() {
  if (priceHistory.length < 2) return;

  const slice = getSliceForTimeframe(currentTimeframe);
  const chartPoints = downsample(slice, MAX_POINTS).map(pt => pt.p);

  drawSparkline(chartPoints);
  updateText(slice);
}

/* ---------- Text Update ---------- */

/**
 * Updates the widget's name/price/percent-change text. `slice` is the
 * currently selected timeframe's points; the change % is derived from
 * its first/last price, while the displayed price always uses the
 * single most recent point in the full history (independent of which
 * timeframe is selected, per spec).
 */
function updateText(slice) {
  const last = slice[slice.length - 1].p;
  const first = slice[0].p;
  const change = ((last - first) / first) * 100;
  const isUp = change >= 0;

  const currentPrice = priceHistory[priceHistory.length - 1].p;

  const nameEl = document.getElementById("cryptoName");
  nameEl.textContent = isDemoData ? "Bitcoin (Demo)" : "Bitcoin (BTC)";
  nameEl.classList.toggle("demo-label", isDemoData);

  document.getElementById("cryptoPrice").textContent =
    "$" + Math.round(currentPrice).toLocaleString();

  const changeEl = document.getElementById("cryptoChange");
  const changeIconEl = document.getElementById("cryptoChangeIcon");
  const changeValueEl = document.getElementById("cryptoChangeValue");

  changeValueEl.textContent =
    (isUp ? "+" : "") + change.toFixed(2) + "%";
  changeEl.classList.toggle("trend-up", isUp);
  changeEl.classList.toggle("trend-down", !isUp);

  if (changeIconEl) {
    changeIconEl.classList.toggle("fa-arrow-up", isUp);
    changeIconEl.classList.toggle("fa-arrow-down", !isUp);
  }
}

/* ---------- Neon Chart ---------- */

/**
 * Draws a smoothed, glowing sparkline of `data` onto #cryptoChart.
 *
 * Color note: the line/glow always use --neon-success / --neon-danger
 * (defined once in main-style.css) rather than the theme-dependent
 * --success / --danger tokens. The chart sits on a fixed dark navy
 * background in both light and dark mode, so its color intentionally
 * does NOT change with the theme -- using the theme tokens here caused
 * the line to look dull in light mode until something else forced a
 * redraw with the (brighter) dark-mode value.
 */
function drawSparkline(data) {
  if (data.length < 2) return;

  const canvas = document.getElementById("cryptoChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const dpr = window.devicePixelRatio || 1;

  // Render at device pixel ratio for crisp lines on high-DPI screens.
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = (max - min) * 0.15 || 1; // avoid a zero-height range when flat

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - (min - pad)) / ((max - min) + pad * 2)) * height
  }));

  const up = data[data.length - 1] >= data[0];
  const mainColor = up ? cssVar("--neon-success", "#39ff8c") : cssVar("--neon-danger", "#ff5c5c");
  const mainRgb = hexToRgb(mainColor);

  /* path: a smoothed curve through all points using Catmull-Rom-derived
     bezier control points, for a nicer look than straight line segments */
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  /* glow: a wider, blurred, translucent stroke behind the crisp line.
     Slightly reduced from the original (16 -> 10 blur) so the crisper
     main line below reads more clearly against it. */
  ctx.save();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = mainColor;
  ctx.globalAlpha = 0.32;
  ctx.stroke();
  ctx.restore();

  /* main line: the crisp, fully opaque stroke on top of the glow.
     Slightly thicker than before (1.2 -> 1.6) for a touch more
     sharpness/visibility, same shape and color otherwise. */
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 1;
  ctx.stroke();

  /* fill: a soft gradient under the curve down to the chart's bottom edge */
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, `rgba(${mainRgb}, 0.8)`);
  grad.addColorStop(1, `rgba(${mainRgb}, 0.02)`);

  ctx.fillStyle = grad;
  ctx.fill();

  /* last point: a small glowing dot marking the most recent price */
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = mainColor;
  ctx.shadowBlur = 10;
  ctx.shadowColor = mainColor;
  ctx.fill();
}

/* ---------- Redraw Triggers ---------- */

// Canvas pixel buffers don't reflow on their own -- redraw on resize
// so the sparkline stays crisp and correctly scaled.
window.addEventListener("resize", () => {
  if (priceHistory.length) render();
});

// Redraw immediately when the user toggles light/dark mode (see
// js/footer.js) instead of waiting for the next scheduled
// fetchHistory() tick to happen to redraw with the new colors.
document.addEventListener("themechange", () => {
  if (priceHistory.length) render();
});