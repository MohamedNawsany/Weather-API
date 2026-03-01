let country = 'cairo',
  lang = 'en';

const location_field = document.querySelector('.location-field');
const findBtn = document.getElementById('findBtn');
const lang_btns = document.querySelectorAll('.lang-btns button');

location_field.addEventListener('input', (eventInfo) => {
  country = eventInfo.target.value.trim().toLowerCase();
  if (country === '') country = 'cairo';
  startAPi(country, lang);
});

for (let i = 0; i < lang_btns.length; i++) {
  lang_btns[i].addEventListener('click', (eventInfo) => {
    lang = eventInfo.target.getAttribute('data-lang');
    lang_btns.forEach(btn => btn.classList.remove('active'));
    eventInfo.target.classList.add('active');
    startAPi(country, lang);
  });
}

findBtn.closest('form').addEventListener('submit', (e) => e.preventDefault());
document.getElementById('subscribeBtn').closest('form').addEventListener('submit', (e) => e.preventDefault());

let allItems = [];
startAPi(country, lang);

async function startAPi(country, lang) {
  let responseAPI = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=687fe7f05794486b9ec180422252106&q=${country}&days=3&aqi=yes&alerts=yes&lang=${lang}`);
  allItems = await responseAPI.json();
  console.log(allItems);
  getData();
}

function getData() {
  displayWeatherCard1(allItems);
  displayWeatherCard2and3(allItems, 1);
  displayWeatherCard2and3(allItems, 2);
  document.querySelector('.site-description').innerHTML = ` of ( ${allItems.location.name} )`;

    if (allItems.alerts && Array.isArray(allItems.alerts.alert)) {
    displayAlerts(allItems.alerts.alert);
  } else {
    displayAlerts([]);
  }
}

function displayWeatherCard1(currentWeather) {
  const aq = currentWeather.current.air_quality;
  const aqiHtml = aq
    ? `<div class="weather-aqi mt-3">
        <strong>Air Quality:</strong>
        <div>PM2.5: ${(aq.pm2_5 ?? 0).toFixed(1)}</div>
        <div>PM10: ${(aq.pm10 ?? 0).toFixed(1)}</div>
        <div>O₃: ${(aq.o3 ?? 0).toFixed(1)}</div>
        <div>CO: ${(aq.co ?? 0).toFixed(1)}</div>
        <div>EPA Index: ${getEpaDescription(aq['us-epa-index'])}</div>
      </div>`
    : '';
  let display = `
    <div class="weather-card h-100">
      <div class="weather-date-info d-flex justify-content-between p-2">
        <span class="weather-day">${formatDate(getCurrentDate()).day}</span>
        <span class="weather-date">${formatDate(getCurrentDate()).formattedDate}</span>
      </div>
      <div class="weather-card-body p-3">
        <div class="location">Location: ${currentWeather.location.name}</div>
        <div class="country">Country: ${currentWeather.location.country}</div>
        <div class="region">Region: ${currentWeather.location.region}</div>
        <div class="weather-main d-flex align-items-center gap-4">
          <div class="weather-main-degree">${currentWeather.current.temp_c}<sup>o</sup>C</div>
          <div class="weather-main-icon">
            <img src="https:${currentWeather.current.condition.icon}" alt="weather"/>
          </div>
        </div>
        <div class="weather-desc mb-3">${currentWeather.current.condition.text}</div>
        <div class="weather-summary d-flex gap-3">
          <div><span class="fa-solid fa-umbrella"></span> ${currentWeather.forecast.forecastday[0].day.daily_chance_of_rain}%</div>
          <div><span class="fa-solid fa-wind"></span> ${currentWeather.current.wind_kph} km/h</div>
          <div><span class="fa-solid fa-location-crosshairs"></span> ${windDirection(currentWeather.current.wind_dir)}</div>
        </div>
        ${aqiHtml}
      </div>
    </div>
  `;
  document.querySelector('.weather-card-1').innerHTML = display;
}

function displayWeatherCard2and3(currentWeather, index) {
  let cardNum = index + 1;
  let display = `
    <div class="weather-card h-100 text-center">
      <div class="weather-date-info p-2">
        <span class="weather-day">${formatDate(currentWeather.forecast.forecastday[index].date).day}</span>
      </div>
      <div class="weather-card-body p-3">
        <div class="weather-main-icon mb-4">
          <img src="https:${currentWeather.forecast.forecastday[index].day.condition.icon}" alt='weather-icon'/>
        </div>
        <div class="weather-main-degree">${currentWeather.forecast.forecastday[index].day.avgtemp_c}<sup>o</sup>C</div>
        <div class="weather-degree mb-4">${currentWeather.forecast.forecastday[index].day.maxtemp_c}<sup>o</sup>C</div>
        <div class="weather-desc">${currentWeather.forecast.forecastday[index].day.condition.text}</div>
      </div>
    </div>
  `;
  document.querySelector(`.weather-card-${cardNum}`).innerHTML = display;
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  const formattedDay = dateObj.toLocaleString('en-US', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  return {
    day: formattedDay,
    formattedDate: `${formattedDate}`
  };
}

function getCurrentDate() {
  return new Date();
}

function windDirection(dir) {
  switch (dir.toUpperCase()) {
    case 'N': return 'North';
    case 'NNE': return 'North-Northeast';
    case 'NE': return 'Northeast';
    case 'ENE': return 'East-Northeast';
    case 'E': return 'East';
    case 'ESE': return 'East-Southeast';
    case 'SE': return 'Southeast';
    case 'SSE': return 'South-Southeast';
    case 'S': return 'South';
    case 'SSW': return 'South-Southwest';
    case 'SW': return 'Southwest';
    case 'WSW': return 'West-Southwest';
    case 'W': return 'West';
    case 'WNW': return 'West-Northwest';
    case 'NW': return 'Northwest';
    case 'NNW': return 'North-Northwest';
    default: return 'Unknown direction';
  }
}

function getEpaDescription(index) {
  switch (index) {
    case 1: return "Good";
    case 2: return "Moderate";
    case 3: return "Unhealthy (Sensitive)";
    case 4: return "Unhealthy";
    case 5: return "Very Unhealthy";
    case 6: return "Hazardous";
    default: return "Unknown";
  }
}

function displayAlerts(alerts) {
  const alertContainer = document.querySelector('.alerts-section');
  if (!alertContainer) return;
  if (!alerts || alerts.length === 0) {
    alertContainer.innerHTML = '<div class="alert alert-success">✅ No active weather alerts.</div>';
    return;
  }
  let alertHTML = '<h5>⚠️ Weather Alerts</h5>';
  alerts.forEach(alert => {
    alertHTML += `
      <div class="alert alert-warning mb-3">
        <strong>${alert.event}</strong> — ${alert.headline}<br>
        <small><strong>Severity:</strong> ${alert.severity}, <strong>Urgency:</strong> ${alert.urgency}</small><br>
        <p class="mb-0 mt-2">${alert.desc}</p>
        ${alert.instruction ? `<em class="d-block mt-2">${alert.instruction}</em>` : ''}
      </div>
    `;
  });
  alertContainer.innerHTML = alertHTML;
}
