/**
 * Sets up click handlers for navbar links to:
 * 1. Mark the clicked link as active.
 * 2. Close the Bootstrap navbar collapse menu.
 * 3. Smoothly scroll to the corresponding section on the page.
 *
 * Expects each nav-link to have a `data-menu` attribute matching the ID of its target section.
 */

import { initCopyrightYear, initMenuName } from "./initpage";
import {
  createUnOrderedList,
  createListItem,
  createLink,
  emptyDiv,
} from "@framework/dom";
import { getLongMonthName, fetchJson } from "@framework/utils";
const { SITE_TITLE } = require("@components/constants");

export function setupMenuCommands(activeClass = "page-home", menujson = null) {
  //reset the content areas
  const elcontentarea = document.getElementById("contentarea");
  if (elcontentarea) emptyDiv(elcontentarea);

  console.info("setupMenuCommands");
  const navbarCollapseEl = document.querySelector(".navbar-collapse");
  if (!navbarCollapseEl) return;

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page === activeClass) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  initCopyrightYear();
  initMenuName(SITE_TITLE);
  initMenu(menujson);

  checkItemsForSale();
}

function initMenu(menujson) {
  if (!menujson) return;

  const el = document.getElementById("nav-news-menu");
  if (!el) return;
  el.classList.add("dropdown");

  let menuEl = null;
  const elOl = document.getElementById("nav-news-menu-ol");
  if (!elOl) {
    menuEl = createUnOrderedList(el, "dropdown-menu", "nav-news-menu-ol");
  } else {
    menuEl = elOl;
    emptyDiv(menuEl);
  }

  menujson.forEach((year) => {
    let yearText = year.year.toString();
    let yearUrl = `/news/${year.year}/`;

    const liYear = createListItem(menuEl, "nav-item ");
    const aYear = createLink(
      liYear,
      yearUrl,
      "dropdown-item",
      yearText,
      "_self",
    );
    /*const menuMonthsEl = createUnOrderedList(liYear, "dropdown-menu");

    year.months.forEach((month) => {
      let monthText = getLongMonthName(month.month);
      let menuUrl = `/news/${year.year}/${month.month}/`;

      const liMonth = createListItem(menuMonthsEl,"nav-item");
      const aMonth = createLink(liMonth, yearUrl, "dropdown-item", yearText);
    });*/
  });
}

function checkItemsForSale() {
  let saleUrl = "/data/pages/club/selling/generated/_index.json";
  fetchJson(saleUrl).then((selling_items) => {
    if (!selling_items || selling_items.length === 0) {
      document.getElementById("clubsellingitemsmenu").remove();
      document.getElementById("clubsellingitemsdiv").remove();
    }
    let found = 0;
    selling_items.forEach((element) => {
      const expires = new Date(element.expires);
      const now = new Date();
      if (expires > now) found++;
    });
    if (found === 0) {
      document.getElementById("clubsellingitemsmenu").remove();
      document.getElementById("clubsellingitemsdiv").remove();
    }
  });
}
