import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea } from "@framework/dom";
import { initMapFrame,createCopy } from "@framework/utils";
import data from "@data/pages/aboutus.json";

setupMenuCommands("page-aboutus");
renderAboutUs(data);

function renderAboutUs(data) {
  console.log("Rendering About Us Page");
  //If there is a hero image render it
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  //Render other sections
  if (data.content.sections && data.content.sections.length > 0) {
    data.content.sections.forEach((section) => {
      renderSection(sectionsdiv, section);
    });
  }

  //Render Find Us section
  if (data.content.findus) {
    const findusdiv = createDiv(sectionsdiv, "findus", "findus");
    renderSection(findusdiv, data.content.findus);

    const map = createDiv(contentarea, "map", "map");
    initMapFrame(data.content.findus.mapCoordinates);
  }

  //allow copy functionlaity 
  createCopy(".copydata");
}
