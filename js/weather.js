const apiKey = "530b11acc74c2eabe7b215382a072dee";
const city = "Tehran";

function fetchWeather() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
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
    .catch(err => console.log(err));
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const timeEl = document.getElementById('time');
  if (!timeEl) return;

  timeEl.innerText = timeStr;
}

function initWeatherWidget() {
  fetchWeather();
  updateClock();
  setInterval(updateClock, 1000);

  const weatherDiv = document.getElementById("weather");
  if (weatherDiv) {
    weatherDiv.addEventListener("click", () => {
      const cityName = encodeURIComponent(document.getElementById("city").innerText);
      window.open(`https://openweathermap.org/find?q=${cityName}`, "_blank");
    });
  }
}
