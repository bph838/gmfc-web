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
  createTableItem,createCanvas,
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

    renderLapGraph(ctx, data);
  });
}

async function renderLapGraph(parent, data) {
  if (data.laps.length <= 0) return;

  

  await injectScript("https://cdn.jsdelivr.net/npm/chart.js");

  //change to time order
  data.laps.sort((a, b) => a.t - b.t);
  let now = new Date().getTime();
  let oldest = data.laps[0];

  const DATA_COUNT = 7;
  const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

  const dataTest = {
    labels: "",
    datasets: [
      {
        label: "Dataset 1",
        data: [
          { x: "Sales", y: 20 },
          { x: "Revenue", y: 10 },
        ],
      },
    ],
  };

  const config = {
    type: "bar",
    data: {
      datasets: [
        {
          data: [
            { x: "Sales", y: 20 },
            { x: "Revenue", y: 10 },
          ],
        },
      ],
    },
  };

  new Chart(parent, config);
}
