export const DURATION_SECOND = 1000;
export const DURATION_MINUTE = DURATION_SECOND * 60;
export const DURATION_HOUR = DURATION_MINUTE * 60;
export const DURATION_DAY = DURATION_HOUR * 24;
export const DURATION_WEEK = DURATION_DAY * 7;
export const DURATION_YEAR = DURATION_WEEK * 52;


export function loadScript(url, callback) {
  // Create a new script element
  const script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";
  script.async = true; // optional, loads asynchronously

  // Optional: call a function when script is loaded
  if (callback) {
    script.onload = callback;
    script.onerror = () => console.error("Failed to load script:", url);
  }

  // Inject into <head>
  document.head.appendChild(script);
}

export async function fetchJson(url) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url); // fetch the URL

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // parse JSON
    console.log(`Fetched data from ${url}:`, data);
    return data;
  } catch (error) {
    console.error("Failed to fetch JSON:", error);
    return null; // or throw error if you prefer
  }
}

export async function loadMergedJson(urls, sortFn) {
  // run requests in parallel
  const results = await Promise.allSettled(urls.map(fetchJson));

  // keep only successful ones
  const data = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  // flatten in case each returns an array
  const merged = data.flat();

  // sort if provided
  if (sortFn) {
    merged.sort(sortFn);
  }

  return merged;
}

/**
 * Sets or creates an Open Graph meta tag.
 * @param {string} property - The OG property, e.g., "og:title"
 * @param {string} content - The content value to set
 */
export function setMeta(property, content) {
  let meta = document.querySelector(`meta[property='${property}']`);

  if (!meta) {
    // Create meta if it doesn't exist
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  // Replace anything that is NOT a letter or number with empty string
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function setPageTitle(titleText) {
  // Update <title>
  if (document.title !== titleText) {
    document.title = titleText;
  }

  // Update or create <meta property="og:title" />
  let meta = document.querySelector(`meta[property='og:title']`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", titleText);
}

export function initMapFrame(data) {
  let latitude = data.latitude || 0;
  let longitude = data.longitude || 0;
  const mapDiv = document.getElementById("map");
  if (!mapDiv) {
    console.error("No map div to render to");
    return;
  }
  mapDiv.innerHTML = `<iframe
    width="100%"
    height="100%"
    style="border:0"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed">
  </iframe>`;
}

export function formatDate(date, longMonth = false) {
  if (!(date instanceof Date)) return "";

  const day = date.getDate();

  // Determine the ordinal
  const ordinal = (d) => {
    if (d > 3 && d < 21) return d + "th"; // 4-20 are all 'th'
    switch (d % 10) {
      case 1:
        return d + "st";
      case 2:
        return d + "nd";
      case 3:
        return d + "rd";
      default:
        return d + "th";
    }
  };

  const monthNamesLong = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let month = "";
  if (longMonth) month = monthNamesLong[date.getMonth()];
  else month = monthNamesShort[date.getMonth()];
  const year = date.getFullYear();
  const hour = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${ordinal(day)} ${month} ${year} ${hour}:${min}`;
}

export function formatLaptime(secs) {
  let seconds = secs.toFixed(2);
  let time = `${seconds} sec`;
  return time;
}

export function setSiteImage(url) {
  setMeta("og:image", url);
}

export function isAbsoluteUrl(url) {
  try {
    new URL(url);
    return true; // valid absolute URL
  } catch (e) {
    return false; // relative or invalid URL
  }
}

export function createCopy(className) {
  console.log("createCopyFunction for " + className);

  document.querySelectorAll(className).forEach((el) => {
    console.log(el.textContent);

    // Define the handler function
    const handler = () => {
      const textToCopy = el.dataset.copy;
      if (!textToCopy) return;

      // Use modern Clipboard API
      if (navigator.clipboard) {
        console.log("copy");

        // Change tooltip text
        el.dataset.tooltip = "Copied!";

        navigator.clipboard
          .writeText(textToCopy)
          .then(() => console.log(`Copied: ${textToCopy}`))
          .catch((err) => console.error("Copy failed:", err));
      }
    };

    // Add click and touch events
    el.addEventListener("click", handler);
    el.addEventListener("touchstart", handler);
  });
}

export function shakeContainer(container) {
  container.classList.add("shake");

  setTimeout(() => {
    container.classList.remove("shake");
  }, 500);
}

export function getTimeParts(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function getDayOfYearUTC(input) {
  const date = new Date(input); // always converts safely

  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return Math.floor((now - start) / 86400000);
}


