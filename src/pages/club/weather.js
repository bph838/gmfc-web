import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea,createInput,createLabel } from "@framework/dom";
import data from "@data/pages/club/weather.json";
import daylight from "@data/daylight/daylight.json";

console.log("Club Weather page loaded");
setupMenuCommands("page-clubweather");
renderClubWeather(data);

function renderClubWeather(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  
  const sectionsdiv = createDiv(contentarea, "sections", "sections-clubweather");  

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log("Rendering weather section:", section.title);
      renderSection(sectionsdiv, section, "", "", daylight);
    });
  }
}

