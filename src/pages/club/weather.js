import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/weather.json";
import daylight from "@data/daylight/daylight.json";
import menu from "@data/generated/menu.json";

console.log("Club Weather page loaded");
setupMenuCommands("page-clubweather",menu);
renderClubWeather(data);
renderFinish();

function renderClubWeather(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sectionsdiv = createDiv(
    contentarea,
    "sections",
    "sections-clubweather",
  );

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log("Rendering weather section:", section.title);
      renderSection(sectionsdiv, section, "", "", daylight);
    });
  }
}
