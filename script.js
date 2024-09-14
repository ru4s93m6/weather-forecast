const CONFIG = {
  API_KEY: "SHAQ3F9T2NFDS39J7CSKZZA9N",
  API_BASE_URL:
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/",
  DEFAULT_CITY: "LONDON",
};

const DOM = {
  searchInput: document.querySelector(".search-input"),
  searchBtn: document.querySelector(".search-btn"),
  currentWeatherInfo: document.querySelector(".current-weather-info"),
  currentLocation: document.querySelector("#current-location"),
  currentTimeStamp: document.querySelector("#current-time-stamp"),
  currentWeatherIcon: document.querySelector(".current-weather-icon"),
  currentTemperature: document.querySelector(".current-temperature"),
  currentWeatherDescription: document.querySelector(
    ".current-weather-description"
  ),
  currentBodyTemperature: document.querySelector(".current-body-temperature"),
  currentWind: document.querySelector(".current-wind"),
  currentHumidity: document.querySelector(".current-humidity"),
  currentVisibility: document.querySelector(".current-visibility"),
  currentPressure: document.querySelector(".current-pressure"),
  infoContainer: document.querySelector(".info-container"),
  loading: document.querySelector(".loading"),
  predictCards: document.querySelectorAll(".predict-card"),
};

/**
 * instance of map class, default latlng is based on LONDON
 */
class WeatherMap {
  constructor(lat = "51.5064", lng = "-0.12721") {
    this.lat = lat;
    this.lng = lng;
    this.map = null;
    this.marker = null;
  }

  mapInit() {
    this.map = L.map("map").setView([this.lat, this.lng], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      minZoom: 3,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
  }

  setMapCenter(lat, lng) {
    this.map.panTo([lat, lng]);
  }

  setMapMarker(lat, lng) {
    if (this.marker === null) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    } else {
      this.marker.setLatLng([lat, lng]);
    }
  }

  removeMarker() {
    this.map.removeLayer(this.marker);
    this.marker = null;
  }
}

/**
 * instance of UI class, handle DOM manipulation
 */
class UI {
  static updateCurrentWeatherInfo(weatherObj) {
    const { currentConditions, address } = weatherObj;
    DOM.currentLocation.textContent = `Location: ${address}`;
    DOM.currentTimeStamp.textContent = currentConditions.datetime;
    DOM.currentWeatherIcon.src = `./images/${currentConditions.icon}.png`;
    DOM.currentTemperature.textContent = `${currentConditions.temp}F`;
    DOM.currentWeatherDescription.textContent = currentConditions.conditions;
    DOM.currentBodyTemperature.textContent = `${currentConditions.feelslike}F`;
    DOM.currentWind.textContent = currentConditions.windspeed;
    DOM.currentHumidity.textContent = `${currentConditions.humidity}%`;
    DOM.currentVisibility.textContent = currentConditions.visibility;
    DOM.currentPressure.textContent = `${currentConditions.pressure} hPa`;
  }

  static updateWeatherPrediction(daysInfo) {
    DOM.predictCards.forEach((card, index) => {
      const weatherData = daysInfo[index];
      const date = card.querySelector("h3");
      const weatherIcon = card.querySelector("#weather-icon");
      const weatherDescription = card.querySelector("#weather-description");
      const minTempValue = card.querySelector("#min-temp-value");
      const maxTempValue = card.querySelector("#max-temp-value");
      const rainPredictValue = card.querySelector("#rain-precipitation-value");

      date.textContent = weatherData.datetime;
      weatherIcon.src = `./images/${weatherData.icon}.png`;
      weatherIcon.alt = weatherData.icon;
      weatherDescription.textContent = weatherData.description;
      minTempValue.textContent = weatherData.tempmin;
      maxTempValue.textContent = weatherData.tempmax;
      rainPredictValue.textContent = `${weatherData.precipprob}%`;
    });
  }

  static displayLoading() {
    DOM.infoContainer.style.display = "none";
    DOM.loading.style.display = "flex";
    DOM.predictCards.forEach((card) => {
      card.querySelector(".info-container").style.display = "none";
      card.querySelector(".loading").style.display = "flex";
    });
  }

  static cancelLoading() {
    DOM.infoContainer.style.display = "block";
    DOM.loading.style.display = "none";
    DOM.predictCards.forEach((card) => {
      card.querySelector(".info-container").style.display = "flex";
      card.querySelector(".loading").style.display = "none";
    });
  }

  static handleError(message) {
    weatherMap.removeMarker();
    DOM.loading.textContent = `Error: ${message}`;
  }
}

/**
 * async function to fetch weather API
 * @param { string } city - the parameter used to query the weather
 */
async function queryWeather(city) {
  UI.displayLoading();
  try {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}${city}?key=${CONFIG.API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    UI.cancelLoading();
    UI.updateCurrentWeatherInfo(data);
    UI.updateWeatherPrediction(data.days.slice(0, 3));

    weatherMap.setMapCenter(data.latitude, data.longitude);
    weatherMap.setMapMarker(data.latitude, data.longitude);
  } catch (error) {
    console.error("Error:", error);
    UI.handleError(error.message);
  }
}

DOM.searchBtn.addEventListener("click", () => {
  const inputValue = DOM.searchInput.value.trim();
  if (inputValue) {
    queryWeather(inputValue);
  }
});

DOM.searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const inputValue = DOM.searchInput.value.trim();
    if (inputValue) {
      queryWeather(inputValue);
    }
  }
});

function init() {
  weatherMap = new WeatherMap();
  weatherMap.mapInit();
  queryWeather(CONFIG.DEFAULT_CITY);
}

window.addEventListener("DOMContentLoaded", init);
