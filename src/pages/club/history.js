import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/history.json";
import menu from "@data/generated/menu.json";

setupMenuCommands("page-clubhistory",menu);
renderClubHistory(data);
renderFinish();

function renderClubHistory(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  data.content.sections?.forEach((section) => {
    console.log(section);
    renderSection(sectionsdiv, section);
  });
}
