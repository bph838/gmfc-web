import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea } from "@framework/dom";

import data from "@data/pages/index.json";

/*
setupMenuCommands("page-home");
renderIndex(data);
// wait for DOM to paint before snapshot
requestAnimationFrame(() => {
  window.dispatchEvent(new Event("render-ready"));
});
*/
async function boot() {
  setupMenuCommands("page-home");
  renderIndex(data);

  await new Promise(r => requestAnimationFrame(r));

  window.dispatchEvent(new Event("render-ready"));
}

boot();



function renderIndex(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const div = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(div, section);
    });
  }
}
