const form = document.querySelector('form');
const card = document.querySelector('.card-info');
const icon = document.querySelector('.icon');
const info = document.querySelector('.info');
const btn = document.querySelector('button');
const input = document.querySelector('input');
const list = document.querySelector('.list');

const weatherConditions = {
  clear: '<i class="fa-solid fa-sun fa-spin fa-6x"></i>',
  cloudy: '<i class="fa-solid fa-cloud fa-beat-fade fa-6x"></i>',
  fog: '<i class="fa-solid fa-smog fa-fade fa-6x"></i>',
  rain: '<i class="fa-solid fa-cloud-rain fa-fade fa-6x"></i>',
  snow: '<i class="fa-solid fa-snowflake fa-beat-fade fa-6x"></i>',
  thunderstorm: '<i class="fa-solid fa-bolt fa-shake fa-6x"></i>',
};

// get location data for selected city
async function getCityLoc(cityName) {
  const base = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;

  const res = await fetch(base);
  const data = await res.json();

  console.log({
    city: data.results[0].name,
    admin: data.results[0].admin1,
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
  });
  return {
    city: data.results[0].name,
    admin: data.results[0].admin1,
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
  };
}

// get list of matched cities
async function getCitiesData(cityName) {
  const base = 'https://geocoding-api.open-meteo.com/v1/search';
  const query = `?name=${cityName}&count=6&language=en&format=json`;

  const res = await fetch(base + query);
  const cities = await res.json();
  return cities.results;
}

// get weather data for selected city
async function getForecast(cityName) {
  // get city latitude and longitude
  const cityLoc = await getCityLoc(cityName);
  const lat = cityLoc.latitude;
  const lon = cityLoc.longitude;
  const admin = cityLoc.admin;

  // call API and get resp in JSON
  const base = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current_weather=true&windspeed_unit=ms`;
  const res = await fetch(base);
  const forecast = await res.json();

  // convert the weathercode into human readable format
  const weatherDesc = setCond(forecast.current_weather.weathercode);

  return {
    city: cityLoc.city,
    admin: cityLoc.admin,
    temp: forecast.current_weather.temperature,
    wind: forecast.current_weather.windspeed,
    weatherDesc,
  };
}

// set weather icon
function setIcon(weather) {
  icon.innerHTML = weather;
}

// check weathercode and update UI with a suitable icon and description
function setCond(weathercode) {
  if (weathercode === 0) {
    setIcon(weatherConditions.clear);
    return 'Clear sky';
  } else if (weathercode <= 3) {
    setIcon(weatherConditions.cloudy);
    return 'Mainly clear, partly cloudy';
  } else if (weathercode <= 48) {
    setIcon(weatherConditions.fog);
    return 'Fog';
  } else if (weathercode <= 57) {
    setIcon(weatherConditions.rain);
    return 'Drizzle';
  } else if (weathercode <= 82) {
    setIcon(weatherConditions.rain);
    return 'Rain';
  } else if (weathercode <= 86) {
    setIcon(weatherConditions.snow);
    return 'Snow';
  } else if (weathercode <= 99) {
    setIcon(weatherConditions.thunderstorm);
    return 'Thunderstorm';
  }
}

// update UI with weather data
function displayData(cityData) {
  const { city, admin, temp, wind, weatherDesc } = cityData;
  list.classList.remove('drop');
  info.innerHTML = `<ul>
  <li>${city}, ${admin}</li>
  <li>${weatherDesc}</li>
  <li>${temp}&deg;C</li>
  <li>${wind} m/s</li>
</ul>`;
}

// show suggestion list for typed city name
function displaySuggestions(cities) {
  list.innerHTML = '';
  if (cities !== undefined) {
    for (const city of cities) {
      const li = document.createElement('li');
      li.textContent = `${city.name}, ${city.admin1}`;
      list.appendChild(li);
      list.classList.add('drop');
    }
  }
}

function displayErr(cityName) {
  icon.innerHTML = '';
  info.innerHTML = `<p>Cannot get any data :(</p>`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let city = document.querySelector('input').value.split(',')[0];

  if (city.length < 1) {
    form.style.borderColor = '#ff1616';
  } else {
    form.style.borderColor = 'unset';
    list.innerHTML = '';
    form.reset();
    getForecast(city)
      .then((forecast) => displayData(forecast))
      .catch((err) => displayErr());
  }
});

list.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const cityName = e.target.textContent;
    input.value = cityName;
  }
});

input.addEventListener('input', () => {
  let city = document.querySelector('input').value;
  getCitiesData(city).then((citiesList) => displaySuggestions(citiesList));
});
