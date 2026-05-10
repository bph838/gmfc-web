import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";

import data from "@data/pages/club/member.json";
import menu from "@data/generated/menu.json";

setupMenuCommands("page-clubmember",menu);
renderClubMemberOptions(data);
renderFinish();

function renderClubMemberOptions(data) {
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

