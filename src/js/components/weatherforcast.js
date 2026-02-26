import { DURATION_HOUR, getDayOfYearUTC } from "@framework/utils";
import {
  createDiv,
  createH3,
  createSpan,
  createInput,
  createLabel,
  emptyDiv,
  createCanvas,
  injectScript,
} from "@framework/dom";
import {
  getWeatherImageAndLabel,
  renderWindWidget,
  setWind,
} from "@components/weatherinfo";

let forcast_data = [];
let daylight_data = [];
const CACHE_KEY = "weatherForcastCache";
const CACHE_DURATION = DURATION_HOUR;

export function fetchAndRenderWeatherForecast(parent, data, daylightData) {
  if (!data.weatherCoordinates) {
    console.error("Unable to render fetchAndRenderWeatherForecast");
    return;
  }

  const latitude = data.weatherCoordinates.latitude;
  const longitude = data.weatherCoordinates.longitude;
  daylight_data = daylightData;

  getWeather(latitude, longitude).then(() => {
    createWeatherFilter(parent);
    renderWeather(parent);
  });
}

export function renderWeather(parent, type = "weather_overview") {
  let id = "sectionWeatherForcast";
  let weatherDiv = document.getElementById(id);
  if (!weatherDiv) {
    weatherDiv = createDiv(parent, "sectionWeatherForecastDiv", id);
  } else {
    emptyDiv(weatherDiv);
  }

  switch (type) {
    default:
    case "weather_overview":
      renderWeatherForecast_Overview(weatherDiv);
      break;
    case "weather_wind":
      renderWeatherForecast_Wind(weatherDiv);
      break;
  }
}

function scrollToHourCentered(day, hour) {
  console.log(`Scrolling to day ${day}, hour ${hour}`);
  let weatherDayId = `weatherDay-${day}`;
  let weatherViewportId = `weatherViewport-${day}`;
  const strip = document.getElementById(weatherDayId);
  if (!strip) {
    return;
  }
  const target = strip.querySelector(`.weatherHourDiv[data-hour="${hour}"]`);
  if (!target) return;

  const viewport = document.getElementById(weatherViewportId);
  if (viewport) {
    const offset =
      target.offsetLeft - (viewport.offsetWidth / 2 - target.offsetWidth / 2);
    viewport.scrollLeft = offset;
  }
}

async function getWeather(latitude, longitude) {
  forcast_data = [];
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log("Using cached weather forcast:", data);
      forcast_data = data;
      procssDatesForWeatherForcast();
      return;
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m&wind_speed_unit=mph`;

  //need to convert this to a structure that the render function can use
  console.log(`Fetching weather data from ${url}`);

  const response = await fetch(url);
  const jsondata = await response.json();

  jsondata.hourly.time.forEach((time, index) => {
    forcast_data.push({
      time: new Date(time),
      temperature: jsondata.hourly.temperature_2m[index],
      weather_code: jsondata.hourly.weather_code[index],
      precipitation_probability:
        jsondata.hourly.precipitation_probability[index],
      precipitation: jsondata.hourly.precipitation[index],
      wind_speed_10m: jsondata.hourly.wind_speed_10m[index],
      wind_speed_80m: jsondata.hourly.wind_speed_80m[index],
      wind_speed_120m: jsondata.hourly.wind_speed_120m[index],
      wind_speed_180m: jsondata.hourly.wind_speed_180m[index],
      wind_direction_10m: jsondata.hourly.wind_direction_10m[index],
      wind_direction_80m: jsondata.hourly.wind_direction_80m[index],
      wind_direction_120m: jsondata.hourly.wind_direction_120m[index],
      wind_direction_180m: jsondata.hourly.wind_direction_180m[index],
      wind_gusts_10m: jsondata.hourly.wind_gusts_10m[index],
    });
  });

  // Save to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: forcast_data,
    }),
  );

  console.log("Fetched new weather forcast:", forcast_data);
}

function procssDatesForWeatherForcast() {
  forcast_data.forEach((entry) => {
    entry.time = new Date(entry.time);
  });
}

function tempToColor(temp) {
  const min = -10;
  const max = 40;

  temp = Math.max(min, Math.min(max, temp));
  const t = (temp - min) / (max - min);

  const hue = 220 - 220 * t;

  return `hsl(${hue}, 70%, 72%)`;
}

function createWeatherFilter(parent) {
  const holderDiv = createDiv(parent, "weather_filter_holder");
  const filterDiv = createDiv(
    holderDiv,
    "btn-group  mb-3 weather_selector", //
    "weatherFilter",
    "group",
  );

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "weatherType",
    "weather_overview",
    "weather_overview",
    true,
  );
  createLabel(
    filterDiv,
    "btn btn-outline-primary",
    "weather_overview",
    "Overview",
  );

  createInput(
    filterDiv,
    "radio",
    "btn-check",
    "weatherType",
    "weather_wind",
    "weather_wind",
  );
  createLabel(filterDiv, "btn btn-outline-primary", "weather_wind", "Wind");

  document.querySelectorAll('input[name="weatherType"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      console.log("weather input changed:" + e.target.value);
      const type = e.target.value;
      let weatherDiv = document.getElementById("sectionWeatherForcast");
      if (weatherDiv) renderWeather(weatherDiv, type);
    });
  });

  return filterDiv;
}

function renderWeatherForecast_Overview(parent) {
  console.log("Rendering overview weather forcast with data:", forcast_data);

  let wind_widget_size = 60;
  let currentDay = getDayOfYearUTC(forcast_data[0].time);
  forcast_data.forEach((data, index) => {
    let day = getDayOfYearUTC(data.time);
    if (day !== currentDay || index === 0) {
      let dayName = data.time.toLocaleDateString("en-GB", { weekday: "long" });

      if (getDayOfYearUTC(data.time) === getDayOfYearUTC(new Date())) {
        dayName = "Today";
      }
      if (
        getDayOfYearUTC(data.time) ===
        getDayOfYearUTC(new Date().setDate(new Date().getDate() + 1))
      ) {
        dayName = "Tomorrow";
      }
      let dayOfYear = getDayOfYearUTC(data.time);
      let daylightInfo = daylight_data[dayOfYear];
      console.log(`Daylight info for day ${dayOfYear}:`, daylightInfo);

      const h2 = createH3(parent, `${dayName}`);
      let weatherDayId = `weatherDay-${day}`;
      let weatherViewpostId = `weatherViewport-${day}`;
      const viewportDiv = createDiv(
        parent,
        "weatherViewport",
        weatherViewpostId,
      );
      const dayDiv = createDiv(viewportDiv, "weatherDayDiv", weatherDayId);
      dayDiv.dataset.day = day;
      for (let i = 0; i < 24; i++) {
        console.log(`Checking daylight for day`);
        let divhourClass = "weatherHourDiv";
        let x = Math.pow(2, i);
        let isNight = false;
        if ((daylightInfo & x) === x) {
          divhourClass += " weather-daylight";
        } else {
          divhourClass += " weather-night";
          isNight = true;
        }
        const hourDiv = createDiv(dayDiv, divhourClass);
        hourDiv.dataset.hour = i;
        hourDiv.dataset.night = isNight ? "true" : "false";
        hourDiv.dataset.weathericon = ".";
        const timeSpan = createSpan(hourDiv, "weatherTime", `${i}:00`);
        const tempSpan = createSpan(hourDiv, "weatherTemp");
        const precipSpan = createSpan(hourDiv, "weatherPrecip");
        const iconSpan = createSpan(hourDiv, "weatherIcon");
        //const windSpan = createSpan(hourDiv, "weatherWind");
        let windwidgetId = `wind-widget-${day}-${i}`;
        renderWindWidget(hourDiv, wind_widget_size, windwidgetId);
      }
      currentDay = day;
    }
  });

  forcast_data.forEach((data, index) => {
    let day = getDayOfYearUTC(data.time);
    let hour = data.time.getUTCHours();
    let weatherDayId = `weatherDay-${day}`;
    const dayDiv = document.getElementById(weatherDayId);
    const hourDiv = dayDiv.querySelector(
      `.weatherHourDiv[data-hour="${hour}"]`,
    );
    const isNight = hourDiv.dataset.night === "true";
    const tempSpan = hourDiv.querySelector(".weatherTemp");
    const precipSpan = hourDiv.querySelector(".weatherPrecip");
    const iconSpan = hourDiv.querySelector(".weatherIcon");
    const windSpan = hourDiv.querySelector(".weatherWind");
    const weatherInfo = getWeatherImageAndLabel(data.weather_code, isNight);
    hourDiv.dataset.weathericon = data.weather_code;
    const weatherimage = weatherInfo.image;
    const weatherlabel = weatherInfo.label;
    if (!isNight) {
      hourDiv.style.backgroundColor = tempToColor(data.temperature);
    }
    let dir = (data.wind_direction_10m + 180) % 360;
    tempSpan.textContent = `${data.temperature}°C`;
    precipSpan.innerHTML = `<i class="fa-solid fa-cloud-rain"></i> ${data.precipitation_probability}%`;
    iconSpan.innerHTML = `<img src="${weatherimage}" alt="${weatherlabel}"  title="${weatherlabel}"  class="weather-image" />`;
    let windwidgetId = `wind-widget-${day}-${hour}`;
    let wind_widget = setWind(dir, data.wind_speed_10m, windwidgetId);
    /*if(dir < 45 || dir > (360-45)) {      
      wind_widget.style.setProperty("margin-top", `-${wind_widget_size/6}px`);
    }else if(dir < 90 || dir >= (360-90)) {
      wind_widget.style.setProperty("margin-top", `-${wind_widget_size/3}px`);
    }*/
  });

  let current_day = getDayOfYearUTC(new Date());
  for (let day = current_day; day < current_day + 7; day++) {
    scrollToHourCentered(day, 12);
  }
}

function renderWeatherForecast_Wind(parent) {
  console.log("Rendering wind weather forcast with data:", forcast_data);
  let max_wind_speed = 0;
  let currentDay = getDayOfYearUTC(forcast_data[0].time);
  forcast_data.forEach((data, index) => {
    if (data.wind_speed_10m > max_wind_speed)
      max_wind_speed = data.wind_speed_10m;
    if (data.wind_speed_80m > max_wind_speed)
      max_wind_speed = data.wind_speed_80m;
    //if (data.wind_speed_120m > max_wind_speed)
    //  max_wind_speed = data.wind_speed_120m;

    let day = getDayOfYearUTC(data.time);
    if (day !== currentDay || index === 0) {
      let dayName = data.time.toLocaleDateString("en-GB", { weekday: "long" });

      if (getDayOfYearUTC(data.time) === getDayOfYearUTC(new Date())) {
        dayName = "Today";
      }
      if (
        getDayOfYearUTC(data.time) ===
        getDayOfYearUTC(new Date().setDate(new Date().getDate() + 1))
      ) {
        dayName = "Tomorrow";
      }
      let dayOfYear = getDayOfYearUTC(data.time);
      let daylightInfo = daylight_data[dayOfYear];
      console.log(`Daylight info for day ${dayOfYear}:`, daylightInfo);

      const h2 = createH3(parent, `${dayName}`);
      let weatherDayId = `weatherDay-${day}`;
      let weatherWindDayId = `weatherWindDay-${day}`;
      let weatherViewpostId = `weatherViewport-${day}`;
      const viewportDiv = createDiv(
        parent,
        "weatherViewport",
        weatherViewpostId,
      );
      const dayDiv = createDiv(viewportDiv, "weatherWindDayDiv", weatherDayId);
      dayDiv.dataset.day = day;
      createCanvas(dayDiv, "windSpeedChartCanvas", weatherWindDayId);
      currentDay = day;
    }
  });
  renderWindCharts(max_wind_speed);
}

async function renderWindCharts(max_wind_speed) {
  max_wind_speed = nextWindBand(max_wind_speed);

  await injectScript("https://cdn.jsdelivr.net/npm/chart.js");

  let currentDay = getDayOfYearUTC(forcast_data[0].time);
  forcast_data.forEach((data, index) => {
    let day = getDayOfYearUTC(data.time);
    if (day !== currentDay || index === 0) {
      let weatherWindDayId = `weatherWindDay-${day}`;
      const ctx = document.getElementById(weatherWindDayId);
      const next24 = forcast_data.slice(index, index + 24);
      renderWindDay(ctx, next24, max_wind_speed);
      currentDay = day;
    }
  });
}

function renderWindDay(ctx, next24, max_wind_speed) {
  console.log(`renderWindDay ${max_wind_speed}`);
  let wind_speed_10m = [];
  let wind_speed_80m = [];
  next24.forEach((data, index) => {
    wind_speed_10m.push(data.wind_speed_10m);
    wind_speed_80m.push(data.wind_speed_80m);
  });

  new Chart(ctx, {
    type: "line",
    options: {
      responsive: true,
      plugins: {
        title: {
          display: false,
          text: "",
        },
      },
      scales: {
        y: {
          min: 0,
          max: max_wind_speed,
        },
      },
      interaction: {
        mode: "index", // shows value for the vertical slice
        intersect: false, // don't require exact point hit
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} mph`,
          },
        },
      },
    },
    data: {
      labels: [
        "00",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
      ],
      datasets: [
        {
          label: "Wind speed 10m",
          data: wind_speed_10m,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 20,
        },
        {
          label: "Wind speed 80m",
          data: wind_speed_80m,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 20,
        },
      ],
    },
  });
}

function nextWindBand(value, step = 5) {
  const min = 0;
  const max = 100;

  if (value >= max) return max;

  return Math.min(max, Math.ceil(value / step) * step);
}
