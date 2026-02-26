import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea } from "@framework/dom";

import data from "@data/pages/404.json";

setupMenuCommands("page-404");
render404(data);

function render404(data) {
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
