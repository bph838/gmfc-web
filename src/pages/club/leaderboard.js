import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  emptyDiv,
} from "@framework/dom";

import { renderDriver, toggleDriverInfo } from "@components/leaderboard";

import data from "@data/pages/club/leaderboard.json";
import menu from "@data/generated/menu.json";
import driver_details from "@lapmonitor/drivers/drivers.json";
import leaderboard_details from "@data/driver_summary.json";

const sorted_leaderboard_details = Object.values(leaderboard_details).sort(
  (a, b) => a.fastestLap - b.fastestLap,
);

let driversEntries = [];
setupMenuCommands("page-leaderboard", menu);
renderClubLeaderBoard(data);
renderFinish();

function renderClubLeaderBoard(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(sectionsdiv, section);
      if (section.leaderboard) {
        renderDriverLeaderBoard(sectionsdiv);
      }
    });
  }
}

function renderDriverLeaderBoard(parent) {
  const lbdiv = createDiv(parent, "section_leaderboard");
  const lbdriverHolder = createDiv(lbdiv, "lb_driverholder");

  sorted_leaderboard_details.map((driver, i) => {
    console.log(i);
    const driverInformation =
      driver_details.find((d) => d.transponderId === driver.transponderId) ??
      null;
    if (driverInformation) {
      const driverEl = renderDriver(
        lbdriverHolder,
        driver,
        i + 1,
        driverInformation,
      );

      driverEl.addEventListener("pointerup", (event) => {
        toggleDriverInfo(driverEl);
      });
    }
  });
}
