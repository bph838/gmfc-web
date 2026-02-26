import { fetchJson, shakeContainer, getTimeParts } from "@framework/utils";

export function renderAlerts() {
  console.log("Rendering alerts");
  //need to load the alerts from site
  const urlalerts = "/data/alerts.json";

  fetchJson(urlalerts).then((data) => {
    if (!data || !data.alerts || data.alerts.length === 0) {
      console.log("No alerts to render");
      return;
    }

    const alertsContainer = document.getElementById("alerts-container");
    if (!alertsContainer) {
      console.error("Alerts container not found");
      return;
    }

    let alertsfound = false;
    data.alerts.forEach((alert) => {
      let now = new Date();
      let dateFrom = alert.date_from ? new Date(alert.date_from) : null;
      let dateTo = alert.date_to ? new Date(alert.date_to) : null;

      //check date range
      if ((dateFrom && now < dateFrom) || (dateTo && now > dateTo)) {
        console.log(`Skipping alert "${alert.title}" due to date range`);
        return; //skip this alert
      } else {
        alertsfound = true;
        let showalert = shouldAlertBeShown(alert.hash);
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${alert.type} show site-alerts`;
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = `
          <h4><strong>${alert.title}</strong></h4> ${alert.message}`;
        if (!showalert) alertDiv.style.display = "none";
        alertsContainer.appendChild(alertDiv);
        //need to add click handler for alert
        addClickHandler(alertDiv, alert.hash);
        shakeContainer(alertsContainer);
      }
    });

    if (alertsfound) {
      renderAnyCountdowns(alertsContainer);
      showAlertBell();
      const navbarAlertBell = document.getElementById("navbar-alert");
      if (navbarAlertBell) {
        navbarAlertBell.addEventListener("pointerup", () => {
          document.querySelectorAll(".site-alerts").forEach((el) => {
            el.style.display = "block";
          });
        });
      }
    }
  });
}

function showAlertBell() {
  const alertNav = document.getElementById("navbar-alert");
  if (alertNav) {
    alertNav.classList.remove("is-hidden");
  }
}

function shouldAlertBeShown(hash) {
  console.log("shouldAlertBeShown");
  const hashFound = localStorage.getItem(hash);
  if (hashFound) {
    return false;
  } else {
    return true;
  }
}

function addClickHandler(el, hash) {
  el.addEventListener("pointerup", (e) => {
    console.log(`activated alert click ${hash}`);
    const strNow = new Date().toISOString();
    localStorage.setItem(hash, strNow);
    el.style.display = "none";
  });
}

function renderAnyCountdowns(alertsContainer) {
  //<span class='countdown' data-cd-date='2026-12-25 12:00:00' data-cd-type='days'></span>
  const elCd = alertsContainer.querySelectorAll(".countdown");
  setInterval(() => {
    const now = new Date();
    elCd.forEach((el) => {      
      const countdownType = el.dataset.cdType ? el.dataset.cdType.toLowerCase() : undefined;
      const dateStr = el.dataset.cdDate;
      if (!dateStr || !countdownType) return;

      const date = new Date(dateStr.replace(" ", "T"));
      if (isNaN(date)) return;

      const diff = date - now;
      const t = getTimeParts(diff);
      switch (countdownType) {
        case "days":
          el.textContent = `${t.days} days`;
          break;
        case "datetimetoseconds":
          if (t.days > 0)
            el.textContent = `${t.days} days ${t.hours} hours ${t.minutes} mins ${t.seconds} secs`;
          else
            el.textContent = `${t.hours} hours ${t.minutes} mins ${t.seconds} secs`;
          break;
      }
    });
  }, 1000);
}
