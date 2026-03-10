import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  renderFinish,
  emptyDiv,
} from "@framework/dom";

import {
  formatLapTime,
  processLeaderboard,
  loadLeaderboard,
} from "@framework/lapmonitor";

import data from "@data/pages/club/leaderboard.json";
import menu from "@data/generated/menu.json";
import driver_details from "@lapmonitor/drivers/drivers.json";

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
        loadDriverLeaderboard(sectionsdiv, section.leaderboard);
      }
    });
  }
}

async function loadDriverLeaderboard(parent, leaderboard) {
  console.log("render leaderboard");
  if (!leaderboard || !leaderboard.url)
    console.log("unable to render leaderboard");

  const drivers = await loadLeaderboard(leaderboard.url);
  console.log(`Looking for leaderboard data ${leaderboard.url}`);
  driversEntries = processLeaderboard(drivers);
  const lbdiv = createDiv(parent, "section_leaderboard");
  renderLeaderBoard(lbdiv);
}

function renderLeaderBoard(parent) {
  const lbdriverHolder = createDiv(parent, "lb_driverholder");
  const lbdrivers = createDiv(lbdriverHolder, "lb_drivers");
  driversEntries.map((driver, i) => {
    renderDriver(lbdrivers, driver, i);
  });

  //create a div for the driver laps to go in
  createDiv(lbdriverHolder, "lb_driver_laps", "lb_driver_laps");
}

function renderDriver(parent, driver, i) {
  //console.log(driver);
  const driverInformation =
    driver_details.find((d) => d.transponderId === driver.transponderId) ??
    null;
  console.log(driverInformation);

  const rankStyle = RANK_STYLES[driver.rank];
  let delay = i * 80;

  let driverHolderDiv = createDiv(parent, "lb_driver");
  driverHolderDiv.style.background =
    driver.rank === 1 ? "rgba(0,245,160,0.06)" : "rgba(255,255,255,0.03)";
  driverHolderDiv.style.border = `1px solid ${driver.rank === 1 ? "rgba(0,245,160,0.25)" : "rgba(255,255,255,0.07)"}`;
  driverHolderDiv.style.animationDelay = `${delay}ms`;

  //Rank
  let rank = createDiv(driverHolderDiv, "lb_driver_rank");
  rank.style.color = rankStyle ? rankStyle.bg : "#555";
  rank.innerHTML = rankStyle ? rankStyle.label : `#${driver.rank}`;

  // Avatar

  const initials = driver.name.slice(0, 2).toUpperCase();
  let avatar = createDiv(driverHolderDiv, "lb_driver_avatar");
  avatar.style.background = rankStyle ? rankStyle.bg : "#2a2a3a";
  avatar.style.color = rankStyle ? rankStyle.color : "#a0a0c0";
  avatar.style.boxShadow = rankStyle ? `0 0 12px ${rankStyle.bg}` : "none";
  if (driverInformation && driverInformation.avatar) {
    avatar.style.backgroundImage = "url('" + driverInformation.avatar + "')";
    avatar.style.display = "block";
    avatar.style.backgroundSize="cover";
  } else avatar.innerHTML = initials;

  //name
  let driver_name = createDiv(driverHolderDiv, "lb_driver_name");
  driver_name.innerHTML = driver.name;

  let stats_holder = createDiv(driverHolderDiv, "lb_stats");

  //fastest time
  let stat_time_holder = createDiv(stats_holder, "lb_stat_right ");
  let stat_time_title = createDiv(stat_time_holder, "lb_stat_title");
  stat_time_title.innerHTML = "FASTEST";
  let stat_time_value = createDiv(stat_time_holder, "lb_stat_time");
  stat_time_value.style.color = driver.rank === 1 ? "#00f5a0" : "#e0e0e0";
  stat_time_value.innerHTML = formatLapTime(driver.fastestLap);
  let stat_time_date = createDiv(stat_time_holder, "lb_stat_time_date");
  stat_time_date.innerHTML = driver.fastestLapAtFmt;

  //average
  let stat_avg_holder = createDiv(
    stats_holder,
    "lb_stat_right lb_stats_lap_avg",
  );
  let stat_avg_title = createDiv(stat_avg_holder, "lb_stat_title ");
  stat_avg_title.innerHTML = "AVG";
  let stat_avg_value = createDiv(stat_avg_holder, "lb_stat_avg_time");
  stat_avg_value.innerHTML = driver.averageLapFmt;

  //Number of laps
  let stat_laps_holder = createDiv(
    stats_holder,
    "lb_stat_right lb_stats_lap_count",
  );
  let stat_laps_title = createDiv(stat_laps_holder, "lb_stat_title");
  stat_laps_title.innerHTML = "LAPS";
  let stat_laps_value = createDiv(stat_laps_holder, "lb_stat_laps");
  stat_laps_value.innerHTML = driver.lapCount;

  //enable he user to click on the driver
  driverHolderDiv.addEventListener("pointerup", () => {
    showDriverLaps(driver.transponderId);
  });
}

const RANK_STYLES = {
  1: { bg: "#FFD700", color: "#1a1a1a", label: "🥇" },
  2: { bg: "#C0C0C0", color: "#1a1a1a", label: "🥈" },
  3: { bg: "#CD7F32", color: "#fff", label: "🥉" },
};

function showDriverLaps(transponderId) {
  const lb_driver_laps = document.getElementById("lb_driver_laps");
  if (!lb_driver_laps) return;
  emptyDiv(lb_driver_laps);

  let driver =
    driversEntries.find((driver) => driver.transponderId === transponderId) ??
    null;
  if (!driver) return;
}
