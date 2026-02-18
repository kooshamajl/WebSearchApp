/* ===============================
   Crypto Price Widget (Neon)
   =============================== */

const prices = [];
const MAX_POINTS = 45;
let intervalId;

/* ---------- Init ---------- */
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

    drawSparkline(prices);
    updateText(prices);

  } catch (err) {
    console.error("Init error:", err);

    // fallback demo data
    prices.length = 0;
    for (let i = 0; i < MAX_POINTS; i++) {
      prices.push(45000 + Math.sin(i / 3) * 800);
    }

    drawSparkline(prices);
    updateText(prices);
  }

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(fetchLivePrice, 15000);
}

/* ---------- Live Price ---------- */
async function fetchLivePrice() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );
    const data = await res.json();

    const lastPrice = data.bitcoin.usd;
    prices.push(lastPrice);
    if (prices.length > MAX_POINTS) prices.shift();

    drawSparkline(prices);
    updateText(prices);

  } catch (err) {
    console.error("Live fetch error:", err);
  }
}

/* ---------- Text Update ---------- */
function updateText(arr) {
  const last = arr[arr.length - 1];
  const first = arr[0];
  const change = ((last - first) / first) * 100;

  document.getElementById("cryptoName").textContent = "Bitcoin ( BTC)";
  document.getElementById("cryptoPrice").textContent =
    "$" + last.toLocaleString();

  const changeEl = document.getElementById("cryptoChange");
  changeEl.textContent =
    (change > 0 ? "+" : "") + change.toFixed(2) + "%";
  changeEl.style.color = change >= 0 ? "#2c7145b5" : "#ef4444aa";
}

/* ---------- Neon Chart ---------- */
function drawSparkline(data) {
  if (data.length < 2) return;

  const canvas = document.getElementById("cryptoChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = (max - min) * 0.15 || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - (min - pad)) / ((max - min) + pad * 2)) * height
  }));

  const up = data[data.length - 1] >= data[0];
  const mainColor = up ? "#2cc7655f" : "#ef44447d";

  /* path */
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

  /* glow */
  ctx.save();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 14;
  ctx.shadowColor = mainColor;
  ctx.globalAlpha = 0.35;
  ctx.stroke();
  ctx.restore();

  /* main line */
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 1;
  ctx.stroke();

  /* fill */
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, up ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)");
  grad.addColorStop(1, up ? "rgba(34,197,94,0.02)" : "rgba(239,68,68,0.02)");

  ctx.fillStyle = grad;
  ctx.fill();

  /* last point */
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = mainColor;
  ctx.shadowBlur = 10;
  ctx.shadowColor = mainColor;
  ctx.fill();
}

/* ---------- Resize ---------- */
window.addEventListener("resize", () => {
  if (prices.length) drawSparkline(prices);
});

/* ---------- Start ---------- */
window.addEventListener("DOMContentLoaded", () => {
  initCryptoWidget(30);
});
