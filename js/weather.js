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

// Last Celsius reading from the API (the source of truth), kept around
// so toggling the unit just re-renders instead of re-fetching.
let lastTempCelsius = null;

/** Reads the saved unit preference, defaulting to Celsius. */
function getPreferredTempUnit() {
  return localStorage.getItem(WEATHER_UNIT_KEY) === "F" ? "F" : "C";
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
}

/**
 * Fetches current weather for WEATHER_CITY and updates the widget's
 * city/temperature/clouds/humidity text. Fails silently in the UI (the
 * widget just keeps its last known values) but logs the error.
 */
function fetchWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const clouds = data.clouds && typeof data.clouds.all === "number" ? data.clouds.all : null;
      const humidity = data.main.humidity;
      const cityName = data.name;

      const cityEl = document.getElementById("city");
      const tempValueEl = document.getElementById("tempValue");
      const tempUnitEl = document.getElementById("tempUnit");
      const cloudsEl = document.getElementById("weatherClouds");
      const humidityEl = document.getElementById("weatherHumidity");

      if (!cityEl || !tempValueEl) return;

      cityEl.innerText = cityName;
      lastTempCelsius = temp;
      if (tempUnitEl) tempUnitEl.style.display = "";
      renderTemp(false);
      if (cloudsEl) cloudsEl.textContent = clouds === null ? "--" : clouds + "%";
      if (humidityEl) humidityEl.textContent = humidity + "%";
    })
    .catch(err => {
      console.error("Weather fetch failed:", err);

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
 * Entry point called by widget-loader.js once weather.html has been
 * injected into #widget-container. Fetches weather and wires up the
 * "View forecast" link and the click-to-toggle temperature unit.
 */
function initWeatherWidget() {
  fetchWeather();

  const tempEl = document.getElementById("temp");
  if (tempEl) {
    tempEl.addEventListener("click", toggleTempUnit);
  }

  const forecastLink = document.getElementById("weatherForecastLink");
  if (forecastLink) {
    forecastLink.addEventListener("click", (e) => {
      e.preventDefault();
      const cityName = encodeURIComponent(document.getElementById("city").innerText || WEATHER_CITY);
      window.open(`https://openweathermap.org/find?q=${cityName}`, "_blank");
    });
  }
}