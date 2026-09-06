/* ===============================
   Weather Widget
   Shows current conditions (temp, clouds, humidity) for a fixed city,
   plus a "View forecast" link out to OpenWeatherMap.
   =============================== */

/**
 * OpenWeatherMap API key.
 *
 * SECURITY NOTE: this project has no backend, so any key placed here is
 * visible to anyone who views the page source (or this public repo).
 * - Use a free-tier key with a low quota so a leak has limited impact.
 * - Rotate the key periodically.
 * - For production use, proxy this request through a small backend/
 *   serverless function so the real key never reaches the browser.
 */
const WEATHER_API_KEY = "530b11acc74c2eabe7b215382a072dee";
const WEATHER_CITY = "Tehran";

// localStorage key for the user's preferred temperature unit ("C" or "F").
const WEATHER_UNIT_KEY = "weatherUnit";

// localStorage keys for which metric each side is currently showing.
const WEATHER_LEFT_METRIC_KEY = "weatherLeftMetric";
const WEATHER_RIGHT_METRIC_KEY = "weatherRightMetric";

// Each side cycles independently through its own small set of metrics
// (left keeps its original "Clouds" as the first/default entry, right
// keeps "Humidity" as its first/default entry).
const LEFT_METRICS = ["clouds", "feelsLike", "wind", "visibility"];
const RIGHT_METRICS = ["humidity", "uv", "aqi", "precip"];

const METRIC_LABELS = {
  clouds: "Clouds",
  feelsLike: "Feels Like",
  wind: "Wind",
  visibility: "Visibility",
  humidity: "Humidity",
  uv: "UV Index",
  aqi: "AQI",
  precip: "Precip",
};

// Last Celsius reading from the API (the source of truth), kept around
// so toggling the unit just re-renders instead of re-fetching.
let lastTempCelsius = null;

// Raw values for every metric, populated once per fetchWeather() call
// and just re-formatted/re-displayed on each cycle click (no re-fetch
// per click). Values stay null until their fetch resolves.
let weatherData = {
  clouds: null,
  feelsLikeC: null,
  windSpeed: null,
  visibilityM: null,
  humidity: null,
  uvIndex: null,
  aqi: null,
  precipMm: null,
};

let currentLeftMetric = loadMetricPref(WEATHER_LEFT_METRIC_KEY, LEFT_METRICS);
let currentRightMetric = loadMetricPref(WEATHER_RIGHT_METRIC_KEY, RIGHT_METRICS);

/** Reads a saved metric choice, falling back to that list's first (original) entry if missing/invalid. */
function loadMetricPref(storageKey, list) {
  const saved = localStorage.getItem(storageKey);
  return list.includes(saved) ? saved : list[0];
}

/** Reads the saved unit preference, defaulting to Celsius. */
function getPreferredTempUnit() {
  return localStorage.getItem(WEATHER_UNIT_KEY) === "F" ? "F" : "C";
}

/**
 * Converts a PM2.5 concentration (µg/m³) into the standard US EPA AQI
 * number (0-500), using the official piecewise-linear breakpoint
 * table. OpenWeatherMap's air pollution endpoint only gives a 1-5
 * relative index, but it does return raw pollutant concentrations
 * (including PM2.5) -- this turns that into the real AQI number
 * instead of the 1-5 scale, without needing a different API.
 */
function pm25ToAqi(pm) {
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
  ];

  const bp = breakpoints.find(b => pm >= b.cLow && pm <= b.cHigh) || breakpoints[breakpoints.length - 1];
  const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm - bp.cLow) + bp.iLow;
  return Math.round(aqi);
}

/** Formats a single metric's raw value for display; "--" while unknown, "N/A" when the source doesn't have it. */
function formatMetricValue(key) {
  switch (key) {
    case "clouds":
      return weatherData.clouds === null ? "--" : weatherData.clouds + "%";
    case "feelsLike": {
      if (weatherData.feelsLikeC === null) return "--";
      const unit = getPreferredTempUnit();
      const t = unit === "F" ? Math.round((weatherData.feelsLikeC * 9) / 5 + 32) : weatherData.feelsLikeC;
      return `${t}°${unit}`;
    }
    case "wind":
      return weatherData.windSpeed === null ? "--" : Math.round(weatherData.windSpeed) + " m/s";
    case "visibility":
      return weatherData.visibilityM === null ? "--" : (weatherData.visibilityM / 1000).toFixed(1) + " km";
    case "humidity":
      return weatherData.humidity === null ? "--" : weatherData.humidity + "%";
    case "uv":
      return weatherData.uvIndex === null ? "N/A" : Math.round(weatherData.uvIndex);
    case "aqi":
      return weatherData.aqi === null ? "N/A" : String(weatherData.aqi);
    case "precip":
      return weatherData.precipMm === null ? "--" : weatherData.precipMm + " mm";
    default:
      return "--";
  }
}

/**
 * Renders the currently-selected metric for one side ("left"/"right"),
 * with the same pulse cue used for the temperature value.
 * @param {boolean} animate - only used for user-triggered changes, not the initial fetch.
 */
function renderMetric(side, animate) {
  const key = side === "left" ? currentLeftMetric : currentRightMetric;
  const labelEl = document.getElementById(side === "left" ? "weatherLeftLabel" : "weatherRightLabel");
  const valueEl = document.getElementById(side === "left" ? "weatherLeftValue" : "weatherRightValue");
  if (!labelEl || !valueEl) return;

  labelEl.textContent = METRIC_LABELS[key];
  valueEl.textContent = formatMetricValue(key);

  if (animate) {
    valueEl.classList.remove("value-pulse");
    void valueEl.offsetWidth; // restart the animation if it's already mid-way
    valueEl.classList.add("value-pulse");
  }
}

/** Advances one side to its next metric (independent of the other side) and re-renders just that side. */
function cycleMetric(side) {
  const list = side === "left" ? LEFT_METRICS : RIGHT_METRICS;
  const current = side === "left" ? currentLeftMetric : currentRightMetric;
  const next = list[(list.indexOf(current) + 1) % list.length];

  if (side === "left") {
    currentLeftMetric = next;
    localStorage.setItem(WEATHER_LEFT_METRIC_KEY, next);
  } else {
    currentRightMetric = next;
    localStorage.setItem(WEATHER_RIGHT_METRIC_KEY, next);
  }

  renderMetric(side, true);
}

/**
 * Renders lastTempCelsius in the currently preferred unit.
 * @param {boolean} animate - plays the shared "value changed" pulse;
 *   used for user-triggered unit toggles, not the initial fetch.
 */
function renderTemp(animate) {
  const tempValueEl = document.getElementById("tempValue");
  const tempUnitEl = document.getElementById("tempUnit");
  if (!tempValueEl || lastTempCelsius === null) return;

  const unit = getPreferredTempUnit();
  const displayTemp = unit === "F"
    ? Math.round((lastTempCelsius * 9) / 5 + 32)
    : lastTempCelsius;

  tempValueEl.textContent = displayTemp;
  if (tempUnitEl) tempUnitEl.textContent = `°${unit}`;

  if (animate) {
    tempValueEl.classList.remove("value-pulse");
    void tempValueEl.offsetWidth; // restart the animation if it's already mid-way
    tempValueEl.classList.add("value-pulse");
  }
}

/** Flips the saved unit preference and re-renders (with the pulse cue). */
function toggleTempUnit() {
  if (lastTempCelsius === null) return; // nothing to convert yet

  const nextUnit = getPreferredTempUnit() === "C" ? "F" : "C";
  localStorage.setItem(WEATHER_UNIT_KEY, nextUnit);
  renderTemp(true);

  // "Feels Like" is temperature-based too -- keep it in sync if it's
  // the metric currently showing on either side, without touching the
  // temperature toggle's own behavior above.
  if (currentLeftMetric === "feelsLike") renderMetric("left", false);
  if (currentRightMetric === "feelsLike") renderMetric("right", false);
}

/**
 * Fetches air quality (AQI) and, where available, UV index for the
 * given coordinates from OpenWeatherMap's other free endpoints, then
 * re-renders whichever side is currently showing one of those metrics.
 * Best-effort only: either call failing just leaves that metric "N/A",
 * it never affects the main temp/clouds/humidity data.
 */
function fetchExtraMetrics(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const entry = data.list && data.list[0];
      const pm25 = entry && entry.components && typeof entry.components.pm2_5 === "number"
        ? entry.components.pm2_5
        : null;
      weatherData.aqi = pm25 === null ? null : pm25ToAqi(pm25);
      if (currentLeftMetric === "aqi") renderMetric("left", false);
      if (currentRightMetric === "aqi") renderMetric("right", false);
    })
    .catch(err => console.error("Air quality fetch failed:", err));

  fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      weatherData.uvIndex = typeof data.value === "number" ? data.value : null;
      if (currentLeftMetric === "uv") renderMetric("left", false);
      if (currentRightMetric === "uv") renderMetric("right", false);
    })
    .catch(err => console.error("UV index fetch failed:", err));
}

/**
 * Fetches current weather and updates the widget's city/temperature/
 * clouds/humidity text. Pass lat/lon to look up the user's actual
 * location; omit them to use the WEATHER_CITY (Tehran) fallback.
 * Fails silently in the UI (the widget just keeps its last known
 * values, or falls back to Tehran if a coordinate lookup failed) but
 * logs the error.
 */
function fetchWeather(lat, lon) {
  const usingCoords = typeof lat === "number" && typeof lon === "number";
  const url = usingCoords
    ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    : `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const clouds = data.clouds && typeof data.clouds.all === "number" ? data.clouds.all : null;
      const humidity = data.main.humidity;
      const cityName = data.name;

      const cityEl = document.getElementById("city");
      const tempValueEl = document.getElementById("tempValue");
      const tempUnitEl = document.getElementById("tempUnit");

      if (!cityEl || !tempValueEl) return;

      cityEl.innerText = cityName;
      lastTempCelsius = temp;
      if (tempUnitEl) tempUnitEl.style.display = "";
      renderTemp(false);

      weatherData.clouds = clouds;
      weatherData.humidity = typeof humidity === "number" ? humidity : null;
      weatherData.feelsLikeC = data.main && typeof data.main.feels_like === "number"
        ? Math.round(data.main.feels_like)
        : null;
      weatherData.windSpeed = data.wind && typeof data.wind.speed === "number" ? data.wind.speed : null;
      weatherData.visibilityM = typeof data.visibility === "number" ? data.visibility : null;
      weatherData.precipMm = (data.rain && data.rain["1h"]) || (data.snow && data.snow["1h"]) || 0;

      renderMetric("left", false);
      renderMetric("right", false);

      if (data.coord && typeof data.coord.lat === "number" && typeof data.coord.lon === "number") {
        fetchExtraMetrics(data.coord.lat, data.coord.lon);
      }
    })
    .catch(err => {
      console.error("Weather fetch failed:", err);

      if (usingCoords) {
        // The coordinate-based lookup failed -- silently retry with
        // the default city instead of showing a broken state.
        fetchWeather();
        return;
      }

      const cityEl = document.getElementById("city");
      const tempValueEl = document.getElementById("tempValue");
      const tempUnitEl = document.getElementById("tempUnit");
      if (cityEl && tempValueEl) {
        cityEl.textContent = WEATHER_CITY;
        lastTempCelsius = null;
        tempValueEl.textContent = "N/A";
        if (tempUnitEl) tempUnitEl.style.display = "none";
      }
    });
}

/**
 * Tries to get the user's local position via the browser Geolocation
 * API and fetch weather for it; falls back to WEATHER_CITY (Tehran)
 * -- silently, no permission/error UI -- when geolocation isn't
 * supported, is denied, times out, or the coordinate lookup fails
 * (that last case is handled inside fetchWeather's catch).
 */
function requestLocalWeather() {
  if (!navigator.geolocation) {
    fetchWeather();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeather(position.coords.latitude, position.coords.longitude);
    },
    () => {
      fetchWeather();
    },
    { timeout: 5000 }
  );
}

/**
 * Entry point called by widget-loader.js once weather.html has been
 * injected into #widget-container. Fetches weather and wires up the
 * "View forecast" link and the click-to-toggle temperature unit.
 */
function initWeatherWidget() {
  renderMetric("left", false);
  renderMetric("right", false);

  requestLocalWeather();

  const tempEl = document.getElementById("temp");
  if (tempEl) {
    tempEl.addEventListener("click", toggleTempUnit);
    tempEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTempUnit();
      }
    });
  }

  const forecastLink = document.getElementById("weatherForecastLink");
  if (forecastLink) {
    forecastLink.addEventListener("click", (e) => {
      e.preventDefault();
      const cityName = encodeURIComponent(document.getElementById("city").innerText || WEATHER_CITY);
      window.open(`https://openweathermap.org/find?q=${cityName}`, "_blank");
    });
  }

  // Left/right metric areas: click or Enter/Space cycles that side's
  // own list of metrics, independently of the other side.
  [["weatherLeftMetric", "left"], ["weatherRightMetric", "right"]].forEach(([id, side]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => cycleMetric(side));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cycleMetric(side);
      }
    });
  });
}