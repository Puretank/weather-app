const API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/search";

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status");

const weatherLabels = {
  0: ["Despejado", "☀️"], 1: ["Mayormente despejado", "🌤️"],
  2: ["Parcialmente nublado", "⛅"], 3: ["Nublado", "☁️"],
  45: ["Niebla", "🌫️"], 48: ["Niebla con escarcha", "🌫️"],
  51: ["Llovizna ligera", "🌦️"], 53: ["Llovizna moderada", "🌦️"],
  55: ["Llovizna intensa", "🌧️"], 56: ["Llovizna helada ligera", "🌧️"],
  57: ["Llovizna helada intensa", "🌧️"], 61: ["Lluvia ligera", "🌦️"],
  63: ["Lluvia moderada", "🌧️"], 65: ["Lluvia intensa", "🌧️"],
  66: ["Lluvia helada ligera", "🌧️"], 67: ["Lluvia helada intensa", "🌧️"],
  71: ["Nieve ligera", "🌨️"], 73: ["Nieve moderada", "🌨️"],
  75: ["Nieve intensa", "❄️"], 77: ["Granos de nieve", "❄️"],
  80: ["Chubascos ligeros", "🌦️"], 81: ["Chubascos moderados", "🌧️"],
  82: ["Chubascos intensos", "⛈️"], 85: ["Chubascos de nieve", "🌨️"],
  86: ["Chubascos de nieve intensos", "❄️"], 95: ["Tormenta", "⛈️"],
  96: ["Tormenta con granizo ligero", "⛈️"], 99: ["Tormenta con granizo intenso", "⛈️"]
};

function weatherInfo(code) {
  return weatherLabels[code] || ["Condición no disponible", "🌡️"];
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function formatDate(dateString, options) {
  return new Intl.DateTimeFormat("es-CO", options).format(new Date(`${dateString}T12:00:00`));
}

function displayNumber(value, suffix = "") {
  return Number.isFinite(value) ? `${Math.round(value)}${suffix}` : `--${suffix}`;
}

async function getCoordinates(city) {
  const url = new URL(GEOCODING_BASE);
  url.search = new URLSearchParams({ name: city, count: "1", language: "es", format: "json" });
  const response = await fetch(url);
  if (!response.ok) throw new Error("No fue posible consultar el servicio de búsqueda de ciudades.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No encontramos “${city}”. Revisa el nombre e inténtalo de nuevo.`);
  }
  return data.results[0];
}

async function getForecast(place) {
  const url = new URL(API_BASE);
  url.search = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max",
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh"
  });
  const response = await fetch(url);
  if (!response.ok) throw new Error("No fue posible obtener el pronóstico meteorológico.");
  return response.json();
}

function renderCurrent(place, data) {
  const current = data.current;
  const daily = data.daily;
  const [label, icon] = weatherInfo(current.weather_code);
  const country = place.country || "";
  document.querySelector("#location-name").textContent = [place.name, place.admin1, country]
    .filter((part, index, all) => part && all.indexOf(part) === index).join(", ");
  document.querySelector("#current-date").textContent =
    new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  document.querySelector("#weather-icon").textContent = icon;
  document.querySelector("#temperature").textContent = displayNumber(current.temperature_2m, "°");
  document.querySelector("#condition").textContent = label;
  document.querySelector("#feels-like").textContent = displayNumber(current.apparent_temperature, "°");
  document.querySelector("#apparent").textContent = displayNumber(current.apparent_temperature, "°");
  document.querySelector("#humidity").textContent = displayNumber(current.relative_humidity_2m, "%");
  document.querySelector("#wind").textContent = displayNumber(current.wind_speed_10m, " km/h");
  document.querySelector("#uv").textContent = displayNumber(daily.uv_index_max[0]);
  document.querySelector("#today-max").textContent = displayNumber(daily.temperature_2m_max[0], "°");
  document.querySelector("#today-min").textContent = displayNumber(daily.temperature_2m_min[0], "°");
  document.querySelector("#timezone").textContent = data.timezone_abbreviation || data.timezone || "—";
}

function renderForecast(daily) {
  const container = document.querySelector("#forecast");
  container.replaceChildren();
  daily.time.forEach((date, index) => {
    const [label, icon] = weatherInfo(daily.weather_code[index]);
    const card = document.createElement("article");
    card.className = `forecast-day${index === 0 ? " today" : ""}`;
    card.innerHTML = `
      <p class="day-name">${index === 0 ? "Hoy" : formatDate(date, { weekday: "short" })}</p>
      <div class="day-icon" role="img" aria-label="${label}">${icon}</div>
      <span class="high">${displayNumber(daily.temperature_2m_max[index], "°")}</span>
      <span class="low">${displayNumber(daily.temperature_2m_min[index], "°")}</span>`;
    container.append(card);
  });
}

async function searchWeather(city) {
  const query = city.trim();
  if (!query) {
    setStatus("Escribe el nombre de una ciudad para continuar.", true);
    return;
  }
  setStatus(`Buscando el clima de ${query}…`);
  document.querySelector("#forecast").innerHTML = '<div class="forecast-placeholder">Consultando el pronóstico…</div>';
  try {
    const place = await getCoordinates(query);
    const data = await getForecast(place);
    renderCurrent(place, data);
    renderForecast(data.daily);
    setStatus(`Información actualizada para ${place.name}.`);
  } catch (error) {
    setStatus(error.message || "Ocurrió un error inesperado. Inténtalo de nuevo.", true);
    document.querySelector("#forecast").innerHTML = '<div class="forecast-placeholder">No se pudo cargar el pronóstico.</div>';
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

searchWeather(cityInput.value);
