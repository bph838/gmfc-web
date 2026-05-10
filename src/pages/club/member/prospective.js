import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  createOrderedList,
  createListItem,
} from "@framework/dom";

import data from "@data/pages/club/member/prospective.json";
import menu from "@data/generated/menu.json";

setupMenuCommands("page-clubmemberprospective", menu);
renderMemberProspective(data);
renderFinish();

function renderMemberProspective(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  renderMemberProspectiveBreadcrumb(contentarea);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  data.content.sections?.forEach((section) => {
    console.log(section);
    renderSection(sectionsdiv, section);
  });
}

export function renderMemberProspectiveBreadcrumb(parent) {
  let elNav = document.createElement("nav");
  elNav.setAttribute("aria-label", "breadcrumb");
  parent.appendChild(elNav);

  let homeUrl = "/";
  let memberUrl = homeUrl + "club/member/";

  let ol = createOrderedList(elNav, "breadcrumb section");
  createListItem(ol, "breadcrumb-item", `<a href="${homeUrl}">Home</a>`);
  createListItem(
    ol,
    "breadcrumb-item",
    `<a href="${memberUrl}">Member Options</a>`,
  );
}
