/* ===============================
   Weather + Clock Widget
   Shows the current temperature for a fixed city plus a live clock.
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
 * city/temperature text and tooltip. Fails silently in the UI (the
 * widget just keeps its last known values) but logs the error.
 */
function fetchWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const hum = data.main.humidity;
      const cond = data.weather[0].main;
      const cityName = data.name;

      const cityEl = document.getElementById("city");
      const tempEl = document.getElementById("temp");
      const weatherDiv = document.getElementById("weather");

      if (!cityEl || !tempEl || !weatherDiv) return;

      cityEl.innerText = cityName;
      tempEl.textContent = temp + "°C";

      weatherDiv.title = `${cond} · ${temp}°C\nHumidity: ${hum}%\nClick for forecast`;
    })
    .catch(err => {
      console.error("Weather fetch failed:", err);

      const cityEl = document.getElementById("city");
      const tempEl = document.getElementById("temp");
      if (cityEl && tempEl) {
        cityEl.textContent = WEATHER_CITY;
        tempEl.textContent = "N/A";
      }
    });
}

/** Updates the widget's clock text to the current local time (HH:MM). */
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const timeEl = document.getElementById("time");
  if (!timeEl) return;

  timeEl.innerText = timeStr;
}

let weatherClockIntervalId;

/**
 * Entry point called by widget-loader.js once weather.html has been
 * injected into #widget-container. Starts the clock ticker and wires
 * up the click-to-open-forecast behavior.
 */
function initWeatherWidget() {
  fetchWeather();
  updateClock();

  // Re-create the interval on every init so switching widgets away and
  // back doesn't stack up multiple ticking clocks.
  if (weatherClockIntervalId) clearInterval(weatherClockIntervalId);
  weatherClockIntervalId = setInterval(updateClock, 1000);

  const weatherDiv = document.getElementById("weather");
  if (weatherDiv) {
    weatherDiv.addEventListener("click", () => {
      const cityName = encodeURIComponent(document.getElementById("city").innerText);
      window.open(`https://openweathermap.org/find?q=${cityName}`, "_blank");
    });
  }
}
