/**
 * Sets up click handlers for navbar links to:
 * 1. Mark the clicked link as active.
 * 2. Close the Bootstrap navbar collapse menu.
 * 3. Smoothly scroll to the corresponding section on the page.
 *
 * Expects each nav-link to have a `data-menu` attribute matching the ID of its target section.
 */

import { initCopyrightYear, initMenuName } from "./initpage";
const { SITE_TITLE } = require("@components/constants");

export function setupMenuCommands(activeClass = "page-home") {
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
}
