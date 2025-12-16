const apiKey = "dc62c955a71ef5219cd02fbddd6c4b9d";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert("Please enter a city name 🌆");
  }
});

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found 😢");
    const data = await response.json();
    displayWeather(data);
    updateBackground(data.weather[0].main);
  } catch (error) {
    document.getElementById("weatherInfo").innerHTML = `<p>${error.message}</p>`;
  }
}

function displayWeather(data) {
  const { name, main, weather } = data;

  document.getElementById("cityName").textContent = name;
  document.getElementById("temperature").textContent = `🌡️ ${main.temp}°C`;
  document.getElementById("condition").textContent = `☁️ ${weather[0].description}`;
  document.getElementById("humidity").textContent = `💧 Humidity: ${main.humidity}%`;

  const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  document.getElementById("weatherIcon").src = icon;
}

/* 🎨 Change Background Based on Weather */
function updateBackground(condition) {
  let bg;
  switch (condition.toLowerCase()) {
    case "clear":
      bg = "linear-gradient(135deg, #f6d365 0%, #fda085 100%)";
      break;
    case "clouds":
      bg = "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)";
      break;
    case "rain":
      bg = "linear-gradient(135deg, #00c6fb 0%, #005bea 100%)";
      break;
    case "thunderstorm":
      bg = "linear-gradient(135deg, #283E51 0%, #485563 100%)";
      break;
    case "snow":
      bg = "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)";
      break;
    default:
      bg = "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)";
  }
  document.body.style.background = bg;
}
