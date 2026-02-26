import { getDayOfYearUTC,DURATION_YEAR,DURATION_HOUR } from "@framework/utils";
import { createDiv } from "@framework/dom";

const SHOW_WEATHER_KEY = "showWeather";
const CACHE_KEY = "weatherCache";
const CACHE_DURATION = DURATION_HOUR;

const CACHE_DAYLIGHT_KEY = "daylightCache";
const CACHE_DAYLIGHT_DURATION = DURATION_YEAR;

export function renderWeatherInfo(parent, latitude, longitude, daylight) {
  let isNight = fetchIsNight(daylight);
  //render the weather info
  const weather_widgetdiv = createDiv(
    parent,
    "weather-widget",
    "weather-widget",
  );

  const weather_icondiv = createDiv(
    weather_widgetdiv,
    "weather-icon",
    "weather-icon",
  );
  const weather_infodiv = createDiv(weather_widgetdiv, "weather-info");
  const weather_descdiv = createDiv(
    weather_infodiv,
    "weather-description",
    "weather-description",
  );
  const weather_tempdiv = createDiv(weather_infodiv, "temp", "temp");
  weather_tempdiv.innerHTML = "--°C";
  renderWindWidget(weather_infodiv);

  getWeather(latitude, longitude).then((data) => {
    const temp = data.current_weather.temperature;
    const wind = getMPH(data.current_weather.windspeed);
    const windDir = (data.current_weather.winddirection + 180) % 360; // Adjust to point in the direction the wind is coming from
    const weatherCode = data.current_weather.weathercode;
    const weatherInfo = getWeatherImageAndLabel(weatherCode, isNight); //getWeatherIconAndLabel(weatherCode);
    const weatherimage = weatherInfo.image;
    const weatherlabel = weatherInfo.label;

    weather_descdiv.innerHTML = weatherlabel;
    weather_tempdiv.innerHTML = `${temp}°C`;
    let wind_widget = setWind(windDir, wind);

    let wind_widget_size = 120; // default size used in renderWindWidget
    if (windDir > 90 && windDir < 270) {
      wind_widget.style.setProperty("margin-top", `-${wind_widget_size / 6}px`);
    }

    let weatherImgInner = `<img src="${weatherimage}" alt="${weatherlabel}" class="weather-image" />`;
    weather_icondiv.innerHTML = weatherImgInner;

    let weatherShowHide = document.getElementById("weatherchange-container");
    if (weatherShowHide) weatherShowHide.style.display = "block";

    const toshow = localStorage.getItem(SHOW_WEATHER_KEY);
    if (toshow === "true") {
      showhideWeather();
    }

    weather_widgetdiv.addEventListener("click", (event) => {
      window.location.href = "/club/weather#sections-clubweather";
    });
  });
}

async function getWeather(latitude, longitude) {
  // Check if cached data exists
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log("Using cached weather:", data);
      return data;
    }
  }

  // Fetch fresh data
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  console.log(`Fetching weather: ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  // Save to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    }),
  );

  console.log("Fetched new weather:", data);
  return data;
}

export async function getDaylight() {
  // Check if cached data exists
  const cached = localStorage.getItem(CACHE_DAYLIGHT_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DAYLIGHT_DURATION) {
      console.log("Using cached daylight data:", data);
      return data;
    }
  }

  // Fetch fresh data
  const url = `/data/daylight/daylight.json`;
  console.log(`Fetching day light data: ${url}`);

  const response = await fetch(url);
  const data = await response.json();

  // Save to cache
  localStorage.setItem(
    CACHE_DAYLIGHT_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    }),
  );

  console.log("Fetched new daylight data:", data);
  return data;
}

export function getWeatherIconAndLabel(weatherCode) {
  const map = {
    0: { icon: "fa-solid fa-sun", label: "Clear sky" },
    1: { icon: "fa-solid fa-cloud-sun", label: "Mainly clear" },
    2: { icon: "fa-solid fa-cloud-sun", label: "Partly cloudy" },
    3: { icon: "fa-solid fa-cloud", label: "Overcast" },
    45: { icon: "fa-solid fa-smog", label: "Fog" },
    48: { icon: "fa-solid fa-smog", label: "Depositing rime fog" },
    51: { icon: "fa-solid fa-cloud-rain", label: "Light drizzle" },
    53: { icon: "fa-solid fa-cloud-rain", label: "Moderate drizzle" },
    55: { icon: "fa-solid fa-cloud-rain", label: "Dense drizzle" },
    56: { icon: "fa-solid fa-cloud-rain", label: "Light freezing drizzle" },
    57: { icon: "fa-solid fa-cloud-rain", label: "Dense freezing drizzle" },
    61: { icon: "fa-solid fa-cloud-rain", label: "Light rain" },
    63: { icon: "fa-solid fa-cloud-rain", label: "Moderate rain" },
    65: { icon: "fa-solid fa-cloud-rain", label: "Heavy rain" },
    66: { icon: "fa-solid fa-cloud-rain", label: "Light freezing rain" },
    67: { icon: "fa-solid fa-cloud-rain", label: "Heavy freezing rain" },
    71: { icon: "fa-solid fa-snowflake", label: "Light snow" },
    73: { icon: "fa-solid fa-snowflake", label: "Moderate snow" },
    75: { icon: "fa-solid fa-snowflake", label: "Heavy snow" },
    77: { icon: "fa-solid fa-snowflake", label: "Snow grains" },
    80: { icon: "fa-solid fa-cloud-rain", label: "Rain showers" },
    81: { icon: "fa-solid fa-cloud-rain", label: "Moderate showers" },
    82: { icon: "fa-solid fa-cloud-rain", label: "Violent showers" },
    85: { icon: "fa-solid fa-snowflake", label: "Snow showers light" },
    86: { icon: "fa-solid fa-snowflake", label: "Snow showers heavy" },
    95: { icon: "fa-solid fa-cloud-bolt", label: "Thunderstorm" },
    96: { icon: "fa-solid fa-cloud-bolt", label: "Thunderstorm with hail" },
    99: {
      icon: "fa-solid fa-cloud-bolt",
      label: "Thunderstorm with heavy hail",
    },
  };

  return map[weatherCode] || { icon: "fa-question", label: "Unknown" };
}

export function showhideWeather() {
  let weather_widget = document.getElementById("weather-widget");
  if (weather_widget) {
    if (weather_widget.style.display === "block") {
      weather_widget.style.display = "none";
      localStorage.removeItem(SHOW_WEATHER_KEY);
    } else {
      weather_widget.style.display = "block";
      localStorage.setItem(SHOW_WEATHER_KEY, "true");
    }
  }
}

export function hideWeather() {
  let weather_widget = document.getElementById("weather-widget");
  if (weather_widget) {
    weather_widget.style.display = "none";
    localStorage.removeItem(SHOW_WEATHER_KEY);
  }
}

function getMPH(kmh) {
  return Math.round(kmh * 0.621371);
}

export function getWeatherImageAndLabel(weatherCode, night = false) {
  let source = "https://siteimages.gmfc.uk/weather/";

  console.log("Feching getWeatherImageAndLabel");

  if (night) {
    const map = {
      0: {
        image: `${source}wsymbol_0008_clear_sky_night.png`,
        label: "Clear sky",
      },
      1: {
        image: `${source}wsymbol_0041_partly_cloudy_night.png`,
        label: "Mainly clear",
      },
      2: {
        image: `${source}wsymbol_0044_mostly_cloudy_night.png`,
        label: "Partly cloudy",
      },
      3: {
        image: `${source}wsymbol_0041_partly_cloudy_night.png`,
        label: "Overcast",
      },
      45: { image: `${source}wsymbol_0064_fog_night.png`, label: "Fog" },
      48: {
        image: `${source}wsymbol_0064_fog_night.png`,
        label: "Depositing rime fog",
      },
      51: {
        image: `${source}wsymbol_0066_drizzle_night.png`,
        label: "Light drizzle",
      },
      53: {
        image: `${source}wsymbol_0066_drizzle_night.png`,
        label: "Moderate drizzle",
      },
      55: {
        image: `${source}wsymbol_0066_drizzle_night.png`,
        label: "Dense drizzle",
      },
      56: {
        image: `${source}wsymbol_0033_cloudy_with_light_rain_night.png`,
        label: "Light freezing drizzle",
      },
      57: {
        image: `${source}wsymbol_0033_cloudy_with_light_rain_night.png`,
        label: "Dense freezing drizzle",
      },
      61: {
        image: `${source}wsymbol_0033_cloudy_with_light_rain_night.png`,
        label: "Light rain",
      },
      63: {
        image: `${source}wsymbol_0033_cloudy_with_light_rain_night.png`,
        label: "Moderate rain",
      },
      65: {
        image: `${source}wsymbol_0026_heavy_rain_showers_night.png`,
        label: "Heavy rain",
      },
      66: {
        image: `${source}wsymbol_0026_heavy_rain_showers_night.png`,
        label: "Light freezing rain",
      },
      67: {
        image: `${source}wsymbol_0026_heavy_rain_showers_night.png`,
        label: "Heavy freezing rain",
      },
      71: {
        image: `${source}swsymbol_0027_light_snow_showers_night.png`,
        label: "Light snow",
      },
      73: {
        image: `${source}wsymbol_0027_light_snow_showers_night.png`,
        label: "Moderate snow",
      },
      75: {
        image: `${source}wsymbol_0028_heavy_snow_showers_night.png`,
        label: "Heavy snow",
      },
      77: {
        image: `${source}wsymbol_0027_light_snow_showers_night.png`,
        label: "Snow grains",
      },
      80: {
        image: `${source}wsymbol_0033_cloudy_with_light_rain_night.png`,
        label: "Rain showers",
      },
      81: {
        image: `${source}wsymbol_0033_cloudy_with_light_rain_night.png`,
        label: "Moderate showers",
      },
      82: {
        image: `${source}wsymbol_0034_cloudy_with_heavy_rain_night.png`,
        label: "Violent showers",
      },
      85: {
        image: `${source}wsymbol_0029_sleet_showers_night.png`,
        label: "Snow showers light",
      },
      86: {
        image: `${source}wsymbol_0029_sleet_showers_night.png`,
        label: "Snow showers heavy",
      },
      95: {
        image: `${source}wsymbol_0032_thundery_showers_night.png`,
        label: "Thunderstorm",
      },
      96: {
        image: `${source}wsymbol_0032_thundery_showers_night.png`,
        label: "Thunderstorm with hail",
      },
      99: {
        image: `${source}wsymbol_0039_cloudy_with_heavy_hail_night.png`,
        label: "Thunderstorm with heavy hail",
      },
    };

    return (
      map[weatherCode] || {
        image: `${source}wsymbol_0042_cloudy_night.png`,
        label: "Unknown",
      }
    );
  } else {
    const map = {
      0: { image: `${source}wsymbol_0001_sunny.png`, label: "Clear sky" },
      1: {
        image: `${source}wsymbol_0002_sunny_intervals.png`,
        label: "Mainly clear",
      },
      2: {
        image: `${source}wsymbol_0002_sunny_intervals.png`,
        label: "Partly cloudy",
      },
      3: { image: `${source}wsymbol_0003_white_cloud.png`, label: "Overcast" },
      45: { image: `${source}wsymbol_0007_fog.png`, label: "Fog" },
      48: {
        image: `${source}wsymbol_0007_fog.png`,
        label: "Depositing rime fog",
      },
      51: {
        image: `${source}wsymbol_0048_drizzle.png`,
        label: "Light drizzle",
      },
      53: {
        image: `${source}wsymbol_0048_drizzle.png`,
        label: "Moderate drizzle",
      },
      55: {
        image: `${source}wsymbol_0081_heavy_drizzle.png`,
        label: "Dense drizzle",
      },
      56: {
        image: `${source}wsymbol_0048_drizzle.png`,
        label: "Light freezing drizzle",
      },
      57: {
        image: `${source}wsymbol_0049_freezing_drizzle.png`,
        label: "Dense freezing drizzle",
      },
      61: {
        image: `${source}wsymbol_0017_cloudy_with_light_rain.png`,
        label: "Light rain",
      },
      63: {
        image: `${source}wsymbol_0018_cloudy_with_heavy_rain.png`,
        label: "Moderate rain",
      },
      65: {
        image: `${source}wsymbol_0018_cloudy_with_heavy_rain.png`,
        label: "Heavy rain",
      },
      66: {
        image: `${source}wsymbol_0050_freezing_rain.png`,
        label: "Light freezing rain",
      },
      67: {
        image: `${source}wsymbol_0050_freezing_rain.png`,
        label: "Heavy freezing rain",
      },
      71: {
        image: `${source}wsymbol_0019_cloudy_with_light_snow.png`,
        label: "Light snow",
      },
      73: {
        image: `${source}wsymbol_0019_cloudy_with_light_snow.png`,
        label: "Moderate snow",
      },
      75: {
        image: `${source}wsymbol_0020_cloudy_with_heavy_snow.png`,
        label: "Heavy snow",
      },
      77: {
        image: `${source}wsymbol_0020_cloudy_with_heavy_snow.png`,
        label: "Snow grains",
      },
      80: {
        image: `${source}wsymbol_0009_light_rain_showers.png`,
        label: "Rain showers",
      },
      81: {
        image: `${source}wsymbol_0009_light_rain_showers.png`,
        label: "Moderate showers",
      },
      82: {
        image: `${source}wsymbol_0010_heavy_rain_showers.png`,
        label: "Violent showers",
      },
      85: {
        image: `${source}wsymbol_0019_cloudy_with_light_snow.png`,
        label: "Snow showers light",
      },
      86: {
        image: `${source}wsymbol_0020_cloudy_with_heavy_snow.png`,
        label: "Snow showers heavy",
      },
      95: {
        image: `${source}wsymbol_0024_thunderstorms.png`,
        label: "Thunderstorm",
      },
      96: {
        image: `${source}wsymbol_0024_thunderstorms.png`,
        label: "Thunderstorm with hail",
      },
      99: {
        image: `${source}wsymbol_0039_cloudy_with_heavy_hail_night.png`,
        label: "Thunderstorm with heavy hail",
      },
    };

    return (
      map[weatherCode] || { image: `${source}cloud-sun.png`, label: "Unknown" }
    );
  }
}

export function renderWindWidget(parent, size = 120, id = "wind-widget") {
  const NS = "http://www.w3.org/2000/svg";

  const center = 50;
  const edge = 2; // tiny margin so stroke isn't clipped
  const circleRadius = 18;
  const arrowWidth = 20; // arrow width
  const arrowHeight = 20; // arrow length

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("id", id);

  const title = document.createElementNS(NS, "title");
  title.classList.add("windTitle");
  svg.appendChild(title);

  const group = document.createElementNS(NS, "g");
  group.setAttribute("class", "windDirGroup");

  // shaft → reaches near top edge
  const shaft = document.createElementNS(NS, "line");
  shaft.setAttribute("x1", center);
  shaft.setAttribute("y1", center);
  shaft.setAttribute("x2", center);
  shaft.setAttribute("y2", edge + arrowHeight); // leave space for arrow
  shaft.setAttribute("class", "shaft");

  // arrowhead at the tip
  const arrow = document.createElementNS(NS, "polygon");
  const tipX = center;
  const tipY = edge;
  // triangle points: tip, left base, right base
  const points = [
    `${tipX},${tipY}`, // tip
    `${tipX - arrowWidth / 2},${tipY + arrowHeight}`, // bottom-left
    `${tipX + arrowWidth / 2},${tipY + arrowHeight}`, // bottom-right
  ].join(" ");
  arrow.setAttribute("points", points);
  arrow.setAttribute("class", "head");

  const circle = document.createElementNS(NS, "circle");
  circle.setAttribute("cx", center);
  circle.setAttribute("cy", center);
  circle.setAttribute("r", circleRadius);
  circle.setAttribute("class", "circle");

  group.appendChild(shaft);
  group.appendChild(arrow);
  group.appendChild(circle);

  const text = document.createElementNS(NS, "text");
  text.setAttribute("class", "windSpeed");
  text.setAttribute("x", center);
  text.setAttribute("y", center);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  //text.textContent = "19"

  svg.appendChild(group);
  svg.appendChild(text);

  parent.appendChild(svg);

  return { svg, group, text };
}

export function setWind(directionDeg, speed, parentId = "wind-widget") {
  let dir = directionDeg % 360;
  const windDiv = document.getElementById(parentId);
  if (windDiv) {
    const arrow = windDiv.querySelector(".windDirGroup");
    const text = windDiv.querySelector(".windSpeed");
    const windTitle = windDiv.querySelector(".windTitle");

    if (windTitle)
      windTitle.textContent = `Wind: ${Math.round(speed)} mph, ${dirctionToCompass(Math.round(dir))}`;
    if (arrow) arrow.setAttribute("transform", `rotate(${dir} 50 50)`);
    if (text) text.textContent = `${Math.round(speed)}`;
  }
  return windDiv;
}

function dirctionToCompass(deg) {
  const directions = [
    "North",
    "North East",
    "East",
    "South East",
    "South",
    "South West",
    "West",
    "North West",
  ];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function fetchIsNight(daylightData) {
  if (!daylightData) return;
  let date = new Date();
  let dayOfYear = getDayOfYearUTC(date);
  let daylightInfo = daylightData[dayOfYear];
  console.log(`Daylight info for day ${dayOfYear}:`, daylightInfo);

  let isNight = true;
  let hour = new Date().getHours();
  let x = Math.pow(2, hour);
  if ((daylightInfo & x) === x) isNight = false;
  return isNight;
}
