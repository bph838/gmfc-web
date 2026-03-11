import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/leaderboard/instructions.json";
import menu from "@data/generated/menu.json";
import drivers from "@lapmonitor/drivers/drivers.json";

setupMenuCommands("page-clubleaderboard-instructions",menu);
renderLeaderboardInstuctions(data);
renderFinish();

function renderLeaderboardInstuctions(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(sectionsdiv, section,"","",drivers);
    });
  }
}
