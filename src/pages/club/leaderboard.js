import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  createH2,
  createH3,
  createSpan,
  renderFinish,
} from "@framework/dom";
import {
  fetchJson,
  formatDate,
  sanitizeString,
  formatLaptime,
} from "@framework/utils";
import {
  setData,
  getFastestEverLap,
  getAllParticipants,
  getLapsByParticipantForCourse,
  getTopParticipantsForCourse,
} from "@framework/leaderboard";

import {
  fetchLapData,
  formatLapTime,
  processLeaderboard,
  loadLeaderboard,
} from "@framework/lapmonitor";

import data from "@data/pages/club/leaderboard.json";
import menu from "@data/generated/menu.json";

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
}

function renderDriver(parent, driver, i) {
  console.log(driver);
  let position = i + 1;
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
  avatar.innerHTML = initials;

  //name
  let driver_name = createDiv(driverHolderDiv, "lb_driver_name");
  driver_name.innerHTML = driver.name;

  let stats_holder = createDiv(driverHolderDiv, "lb_stats");

  let stat_time_holder = createDiv(stats_holder, "lb_stat_right");
  let stat_time_title = createDiv(stat_time_holder, "lb_stat_title");
  stat_time_title.innerHTML = "FASTEST";
  let stat_time_value = createDiv(stat_time_holder, "lb_stat_time");
  stat_time_value.style.color = driver.rank === 1 ? "#00f5a0" : "#e0e0e0";
  stat_time_value.innerHTML = driver.fastestLapFmt;
  let stat_time_date = createDiv(stat_time_holder, "lb_stat_time_date");
  stat_time_date.innerHTML = driver.fastestLapAtFmt;

  let stat_laps_holder = createDiv(stats_holder, "lb_stat_right");
  let stat_laps_title = createDiv(stat_laps_holder, "lb_stat_title");
  stat_laps_title.innerHTML = "LAPS";
  let stat_laps_value = createDiv(stat_laps_holder, "lb_stat_laps");
  stat_laps_value.innerHTML = driver.lapCount;


}

const RANK_STYLES = {
  1: { bg: "#FFD700", color: "#1a1a1a", label: "🥇" },
  2: { bg: "#C0C0C0", color: "#1a1a1a", label: "🥈" },
  3: { bg: "#CD7F32", color: "#fff", label: "🥉" },
};

/*

function renderLeaderboard(parent, leaderboard) {
  console.log("render leaderboard");
  if (!leaderboard || !leaderboard.url)
    console.log("unable to render leaderboard");

  const url = leaderboard.url;
  console.log(`Looking for leaderboard data ${url}`);
  const lbdiv = createDiv(parent, "section_leaderboard");

  fetchJson(url).then((jsondata) => {
    console.log(jsondata);
    //need to load this json into a array
    setData(jsondata);

    //add the fasted time
    renderFastestEverLap(lbdiv);

    //add a League table
    renderLeagueTable(lbdiv);

    //get all the participants
    const participants = getAllParticipants();
    if (participants) {
      participants.forEach((participant) => {
        renderFastestLapsForParticipant(lbdiv, participant);
      });
    }
  });
}

function renderFastestEverLap(parent) {
  let fastest = getFastestEverLap();
  if (fastest) {
    console.log(fastest);
    const fastest_div = createDiv(parent, "lb_holdertimes");
    createH2(fastest_div, "🎉 Fastest Ever Lap 🎉");
    const divtimes = createDiv(fastest_div, "lb_times");
    createSpan(divtimes, "lb_participant", "🥇" + fastest.Participant);
    createSpan(divtimes, "lb_date", formatDate(fastest.date));
    let fastestTime = formatLaptime(fastest.Laptime);
    createSpan(divtimes, "lb_time", fastestTime);
  }
}

function renderLeagueTable(parent) {
  console.log("renderLeagueTable");
  const leagueTimes = getTopParticipantsForCourse();
  let place = 2;
  if (leagueTimes && leagueTimes.length > 0) {
    console.log(leagueTimes);
    const fastest_div = createDiv(parent, "lb_holdertimes");
    createH2(fastest_div, "and the rest...");
    leagueTimes.forEach((lap) => {
      let dst = formatDate(lap.Date);
      let participantText;
      switch (place) {
        case 2:
          participantText = "🥈" + lap.Participant;
          break;
        case 3:
          participantText = "🥉" + lap.Participant;
          break;
        default:
          participantText = lap.Participant;
          break;
      }
      const divtimes = createDiv(fastest_div, "lb_times");
      createSpan(divtimes, "lb_participant", participantText);
      createSpan(divtimes, "lb_date", dst);
      let time = formatLaptime(lap.Laptime);
      createSpan(divtimes, "lb_time", time);
      place++;
    });
  }
}

function renderFastestLapsForParticipant(parent, participant) {
  console.log(`renderFastestLapsForParticipant ${participant}`);
  if (!participant) return;
  const laps = getLapsByParticipantForCourse(participant);
  if (laps && laps.length > 0) {
    console.log(laps);
    const fastest_time = formatLaptime(laps[0].Laptime);
    const nospace_participant = sanitizeString(participant);
    const participant_id = `accordion_id_${nospace_participant}`;
    const participant_collapse_id = `accordion_collapse_id_${nospace_participant}`;
    const participant_div = createDiv(
      parent,
      "lb_participant_holdertimes accordion",
      participant_id,
    );
    const participant_item = createDiv(participant_div, "accordion-item");
    const participant_title_innerhtml = `<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${participant_collapse_id}" aria-expanded="true" aria-controls="${participant_collapse_id}">
       ${participant}<span class='participant_fastesttime'>${fastest_time}</span>
      </button>`;
    const participant_header = createH3(
      participant_item,
      participant_title_innerhtml,
      "accordion-header",
    );

    let participant_data_div_class = `accordion-collapse collapse show" data-bs-parent="#${participant_id}`;
    const participant_data_div = createDiv(
      participant_item,
      participant_data_div_class,
      participant_collapse_id,
    );
    const participant_body_div = createDiv(
      participant_data_div,
      "accordion-body",
    );

    //need to render all the times for the paricipant
    renderLapTimeTableForParticipant(participant_body_div, laps);
  }
}

function renderLapTimeTableForParticipant(parent, laps) {
  // Create table
  const table = document.createElement("table");
  parent.appendChild(table);
  table.className = "participantLapTimes";
  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  ["Date", "Laptime"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  laps.forEach((lap) => {
    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");

    tdDate.textContent = formatDate(lap.date);
    tr.appendChild(tdDate);

    const tdLapTime = document.createElement("td");
    tdLapTime.textContent = formatLaptime(lap.Laptime);
    tr.appendChild(tdLapTime);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}
*/
