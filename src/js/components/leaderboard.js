import {
  createDiv,
  fetchContextArea,
  renderFinish,
  emptyDiv,
} from "@framework/dom";
import { formatLapTime } from "@framework/lapmonitor";
import { formatDate } from "@framework/utils";

const RANK_STYLES = {
  1: { bg: "#FFD700", color: "#1a1a1a", label: "🥇" },
  2: { bg: "#C0C0C0", color: "#1a1a1a", label: "🥈" },
  3: { bg: "#CD7F32", color: "#fff", label: "🥉" },
};

export function renderDriver(parent, driver, position, driverInformation) {
  //console.log(driver);

  const rankStyle = RANK_STYLES[position];
  let delay = position * 80;

  let driverHolderDiv = createDiv(parent, "lb_driver");
  driverHolderDiv.style.background =
    position === 1 ? "rgba(0,245,160,0.06)" : "rgba(255,255,255,0.03)";
  driverHolderDiv.style.border = `1px solid ${position === 1 ? "rgba(0,245,160,0.25)" : "rgba(255,255,255,0.07)"}`;
  driverHolderDiv.style.animationDelay = `${delay}ms`;

  //Rank
  let rank = createDiv(driverHolderDiv, "lb_driver_rank");
  rank.style.color = rankStyle ? rankStyle.bg : "#555";
  rank.innerHTML = rankStyle ? rankStyle.label : `#${position}`;

  // Avatar

  const initials = driver.name.slice(0, 2).toUpperCase();
  let avatar = createDiv(driverHolderDiv, "lb_driver_avatar");
  avatar.style.background = rankStyle ? rankStyle.bg : "#2a2a3a";
  avatar.style.color = rankStyle ? rankStyle.color : "#a0a0c0";
  avatar.style.boxShadow = rankStyle ? `0 0 12px ${rankStyle.bg}` : "none";
  if (driverInformation && driverInformation.avatar) {
    avatar.style.backgroundImage = "url('" + driverInformation.avatar + "')";
    avatar.style.display = "block";
    avatar.style.backgroundSize = "cover";
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
  stat_time_value.style.color = position === 1 ? "#00f5a0" : "#e0e0e0";
  stat_time_value.innerHTML = formatLapTime(driver.fastestLap);
  let stat_time_date = createDiv(stat_time_holder, "lb_stat_time_date");
  const fastestLapDate = new Date(driver.fastestLapTime);
  stat_time_date.innerHTML = formatDate(fastestLapDate);

  //average
  let stat_avg_holder = createDiv(
    stats_holder,
    "lb_stat_right lb_stats_lap_avg",
  );
  let stat_avg_title = createDiv(stat_avg_holder, "lb_stat_title ");
  stat_avg_title.innerHTML = "AVG";
  let stat_avg_value = createDiv(stat_avg_holder, "lb_stat_avg_time");
  stat_avg_value.innerHTML = (driver.averageLap/100).toFixed(2);

  //Number of laps
  let stat_laps_holder = createDiv(
    stats_holder,
    "lb_stat_right lb_stats_lap_count",
  );
  let stat_laps_title = createDiv(stat_laps_holder, "lb_stat_title");
  stat_laps_title.innerHTML = "LAPS";
  let stat_laps_value = createDiv(stat_laps_holder, "lb_stat_laps");
  stat_laps_value.innerHTML = driver.lapCount;

  return driverHolderDiv;
}
