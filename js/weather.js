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
      tempValueEl.textContent = temp;
      if (tempUnitEl) tempUnitEl.style.display = "";
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
        tempValueEl.textContent = "N/A";
        if (tempUnitEl) tempUnitEl.style.display = "none";
      }
    });
}

/**
 * Entry point called by widget-loader.js once weather.html has been
 * injected into #widget-container. Fetches weather and wires up the
 * "View forecast" link.
 */
function initWeatherWidget() {
  fetchWeather();

  const forecastLink = document.getElementById("weatherForecastLink");
  if (forecastLink) {
    forecastLink.addEventListener("click", (e) => {
      e.preventDefault();
      const cityName = encodeURIComponent(document.getElementById("city").innerText || WEATHER_CITY);
      window.open(`https://openweathermap.org/find?q=${cityName}`, "_blank");
    });
  }
}