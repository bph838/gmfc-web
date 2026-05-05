import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
 
} from "@framework/dom";
import { renderRulesBreadcrumb } from "../rules.js";

import data from "@data/pages/club/rules/flying.json";
import menu from "@data/generated/menu.json";

setupMenuCommands("page-clubrules", menu);
renderClubRules(data);
renderFinish();

function renderClubRules(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  renderRulesBreadcrumb(contentarea);

  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(sectionsdiv, section);
    });
  }
}

