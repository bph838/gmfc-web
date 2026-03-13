import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  emptyDiv,
  createH2,
  createTable,
  createTableHead,
  createTableRow,
  createHeadItem,
  createTableBody,
  createTableItem,
  createCanvas,
  injectScript,
} from "@framework/dom";
import { fetchJson, formatDate } from "@framework/utils";
import { formatLapTime } from "@framework/lapmonitor";
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
        createDiv(sectionsdiv, "section sectionbreak hidden", "driver_laps");
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
        renderDriverLaps(driverInformation);
      });

      const el = driverEl.querySelector(".lb_stat_build");
      if (el) {
        el.addEventListener("pointerup", (event) => {
          event.stopPropagation();
          toggleDriverInfo(driverEl);
        });
      }
    }
  });
}

function renderDriverLaps(driverInformation) {
  const driver_laps = document.getElementById("driver_laps");
  if (!driver_laps) return;
  emptyDiv(driver_laps);
  driver_laps.classList.remove("hidden");
  const titlediv = createDiv(driver_laps, "section_title");
  createH2(titlediv, driverInformation.name);

  const divHolder = createDiv(driver_laps, "driver_laps_holder");

  const divDLapTimes = createDiv(divHolder, "driver_laps_times");
  const divDLapGraph = createDiv(
    divHolder,
    "driver_laps_graph",
    "driver_laps_graph",
  );
  const ctx = createCanvas(divDLapGraph, "driverlapgraph");

  let url = `/data/drivers/${driverInformation.uuid}.json`;
  fetchJson(url).then((data) => {
    console.log("Processing laps: ");
    console.log(data);

    const table = createTable(divDLapTimes, "drivers");
    const tableHead = createTableHead(table);
    const tR = createTableRow(tableHead);

    createHeadItem(tR, "Date");
    createHeadItem(tR, "Lap Time");

    const tableBody = createTableBody(table);
    data.laps.sort((a, b) => a.d - b.d);

    data.laps.forEach((lap) => {
      const tableRow = createTableRow(tableBody, "driver_lap");
      const LapDate = new Date(lap.t);
      createTableItem(tableRow, formatDate(LapDate));
      createTableItem(tableRow, formatLapTime(lap.d));
    });

    //renderLapGraph(ctx, data);
  });
}

async function renderLapGraph(parent, data) {
  if (data.laps.length <= 0) return;

  await injectScript("https://cdn.jsdelivr.net/npm/chart.js");

  //change to time order
  data.laps.sort((a, b) => a.t - b.t);
  let now = new Date().getTime();
  let oldest = data.laps[0];

  const chartData = getWeeklyAverageDataset(data);

  new Chart(parent, {
    type: "bar",
    data: chartData,
  });
}

function getWeeklyAverageDataset(driver) {
  const weeks = {};

  driver.laps.forEach((lap) => {
    const date = new Date(lap.t);

    // get ISO week key (year-week)
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / 86400000);
    const week = Math.ceil((days + firstJan.getDay() + 1) / 7);

    const key = `${date.getFullYear()}-W${week}`;

    if (!weeks[key]) {
      weeks[key] = { total: 0, count: 0 };
    }

    weeks[key].total += lap.d / 100;
    weeks[key].count++;
  });

  const labels = [];
  const data = [];

  Object.entries(weeks).forEach(([week, v]) => {
    labels.push(week);
    data.push(v.total / v.count);
  });

  return {
    labels,
    datasets: [
      {
        label: "Average Lap Time",
        data,
      },
    ],
  };
}
