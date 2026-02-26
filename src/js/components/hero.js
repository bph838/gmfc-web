import { createDiv, createH1, createSpan } from "@framework/dom";
import { setSiteImage } from "@framework/utils";
import { renderAlerts } from "@components/alerts";
import {
  renderWeatherInfo,
  showhideWeather,
  getDaylight,
} from "@components/weatherinfo";

export function renderHero(data) {
  console.log("renderHero called");

  const hero = document.getElementById("hero");
  if (!hero) {
    console.error("There is no hero id to render to");
    return;
  }

  let sitepic = "";
  if (data.generatehero && data.generatehero == true) {
    //check for hero type
    const herotype = localStorage.getItem("herotype");
    if (herotype !== null) {
      let url = getImageForHero(herotype);
      hero.style.backgroundImage = "url('" + url + "')";
      sitepic = url;
    } else {
      if (data.image) {
        hero.style.backgroundImage = "url('" + data.image + "')";
        sitepic = data.image;
      }
    }
  } else {
    if (data.image) {
      hero.style.backgroundImage = "url('" + data.image + "')";
      sitepic = data.image;
    }
  }

  if (sitepic.length >= 0) {
    setSiteImage(sitepic);
  }

  hero.className = "hero";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundSize = "cover";
  hero.style.backgroundRepeat = "no-repeat";

  if (data.text) {
    const heroTextDiv = createDiv(hero, "container-hero container text-center");
    createH1(heroTextDiv, data.text);
  }

  //setup for alerts div
  createDiv(hero, "alerts-container", "alerts-container");

  //setup fonts for changing the hero image
  const herochangediv = createDiv(hero, "herochange-container");

  const planespan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-plane"></i>`,
  );
  const helicopterspan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-helicopter"></i>`,
  );
  const racecarspan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-car"></i>`,
  );
  const crawlerspan = createSpan(
    herochangediv,
    "herochange",
    `<i class="fa-solid fa-truck-pickup"></i>`,
  );

  planespan.addEventListener("pointerup", (event) => {
    changeHeroImage("plane");
  });
  helicopterspan.addEventListener("pointerup", (event) => {
    changeHeroImage("helicopter");
  });
  racecarspan.addEventListener("pointerup", (event) => {
    changeHeroImage("racecar");
  });
  crawlerspan.addEventListener("pointerup", (event) => {
    changeHeroImage("crawler");
  });

  //render any alerts
  renderAlerts();

  //render any weather if we have the coordinates
  if (
    data.weatherCoordinates &&
    data.weatherCoordinates.latitude &&
    data.weatherCoordinates.longitude
  ) {
    const watherchangediv = createDiv(
      hero,
      "weatherchange-container",
      "weatherchange-container",
    );
    const weatherspan = createSpan(
      watherchangediv,
      "weatherchange",
      `<i class="fa-solid fa-cloud-sun"></i>`,
    );

    weatherspan.addEventListener("pointerup", (event) => {
      showhideWeather();
    });

    getDaylight().then((daylight) => {
      renderWeatherInfo(
        hero,
        data.weatherCoordinates.latitude,
        data.weatherCoordinates.longitude,
        daylight
      );
    });

    /*
    renderWeatherInfo(
      hero,
      data.weatherCoordinates.latitude,
      data.weatherCoordinates.longitude,
    );*/
  }
}

function getImageForHero(herotype) {
  let imageurl = "";
  switch (herotype) {
    default:
    case "plane":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-plane.jpg";
      break;
    case "helicopter":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-helicopter.jpg";
      break;
    case "racecar":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-racecar.jpg";
      break;
    case "crawler":
      imageurl = "https://siteimages.gmfc.uk/hero/hero-crawl.jpg";
      break;
  }
  return imageurl;
}

function changeHeroImage(herotype) {
  localStorage.setItem("herotype", herotype);
  const hero = document.getElementById("hero");
  console.log("changeHeroImage");
  let imageurl = getImageForHero(herotype);

  if (imageurl.length <= 1) return;

  setSiteImage(imageurl);
  hero.style.backgroundImage = "url('" + imageurl + "')";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundSize = "cover";
  hero.style.backgroundRepeat = "no-repeat";
}
