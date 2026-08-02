/* ===============================
   Crypto Price Widget (Neon Chart)
   Renders a small glowing sparkline of Bitcoin's price using the
   CoinGecko public API, with a live price refreshed periodically.
   If the API is unreachable, the widget falls back to synthetic demo
   data and clearly labels it as such (see isDemoData) instead of
   silently pretending it's real.
   =============================== */

const prices = [];
const MAX_POINTS = 45;
let intervalId;
let isDemoData = false;

/* ---------- Helpers ---------- */

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

/* ---------- Init ---------- */

/**
 * Entry point called by widget-loader.js once crypto.html has been
 * injected into #widget-container. Loads `days` worth of daily price
 * history to seed the sparkline, then starts polling for the live price.
 */
async function initCryptoWidget(days = 30) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    const data = await res.json();

    if (!data.prices || !data.prices.length)
      throw new Error("No data returned");

    prices.length = 0;
    data.prices.slice(-MAX_POINTS).forEach(p => prices.push(p[1]));

    isDemoData = false;
    drawSparkline(prices);
    updateText(prices);

  } catch (err) {
    console.error("Init error:", err);

    // API unreachable/rate-limited: fall back to a synthetic wave so the
    // widget still has *something* to draw, but flag it via isDemoData
    // so updateText() can make that visible to the user instead of
    // showing fake numbers as if they were real.
    prices.length = 0;
    for (let i = 0; i < MAX_POINTS; i++) {
      prices.push(45000 + Math.sin(i / 3) * 800);
    }

    isDemoData = true;
    drawSparkline(prices);
    updateText(prices);
  }

  // Re-create the interval on every init so switching widgets away and
  // back doesn't stack up multiple concurrent pollers.
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(fetchLivePrice, 100000);

  // The widget is styled with cursor: pointer (see css/widgets.css) to invite
  // a click-through to the full chart, same as the weather widget does.
  const widget = document.getElementById("cryptoWidget");
  if (widget) {
    widget.addEventListener("click", () => {
      window.open("https://www.coingecko.com/en/coins/bitcoin", "_blank");
    });
  }
}

/* ---------- Live Price ---------- */

/**
 * Polls CoinGecko's simple price endpoint and appends the latest price
 * to the rolling `prices` window, then redraws the chart. On failure,
 * the widget simply keeps showing its last known state.
 */
async function fetchLivePrice() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const data = await res.json();

    const lastPrice = data.bitcoin.usd;
    prices.push(lastPrice);
    if (prices.length > MAX_POINTS) prices.shift();

    isDemoData = false;
    drawSparkline(prices);
    updateText(prices);

  } catch (err) {
    console.error("Live fetch error:", err);
  }
}

/* ---------- Text Update ---------- */

/**
 * Updates the widget's name/price/percent-change text based on the
 * first and last points currently in `arr`.
 */
function updateText(arr) {
  const last = arr[arr.length - 1];
  const first = arr[0];
  const change = ((last - first) / first) * 100;

  const nameEl = document.getElementById("cryptoName");
  nameEl.textContent = isDemoData ? "Bitcoin (Demo)" : "Bitcoin (BTC)";
  nameEl.classList.toggle("demo-label", isDemoData);

  document.getElementById("cryptoPrice").textContent =
    "$" + Math.round(last).toLocaleString();

  const changeEl = document.getElementById("cryptoChange");
  changeEl.textContent =
    (change > 0 ? "+" : "") + change.toFixed(2) + "%";
  changeEl.classList.toggle("trend-up", change >= 0);
  changeEl.classList.toggle("trend-down", change < 0);
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

  /* glow: a wider, blurred, translucent stroke behind the crisp line */
  ctx.save();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 14;
  ctx.shadowColor = mainColor;
  ctx.globalAlpha = 0.35;
  ctx.stroke();
  ctx.restore();

  /* main line: the crisp, fully opaque stroke on top of the glow */
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 1.2;
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
  if (prices.length) drawSparkline(prices);
});

// Redraw immediately when the user toggles light/dark mode (see
// js/footer.js) instead of waiting up to 100s for the next scheduled
// fetchLivePrice() tick to happen to redraw with the new colors.
document.addEventListener("themechange", () => {
  if (prices.length) drawSparkline(prices);
});
