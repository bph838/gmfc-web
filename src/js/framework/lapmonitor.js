/**
 * leaderboard.js
 * Fetches lap data from a JSON URL and computes driver rankings.
 */

// ─── Data Fetching ────────────────────────────────────────────────────────────

/**
 * Fetches the lap data JSON from a given URL.
 * @param {string} url - The URL of the JSON file.
 * @returns {Promise<Object>} Raw lap data keyed by driver name.
 */
export async function fetchLapData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch lap data: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ─── Processing ───────────────────────────────────────────────────────────────

/**
 * Formats milliseconds into a human-readable lap time string (e.g. "1:23.456").
 * @param {number} ms - Duration in milliseconds.
 * @returns {string}
 */
export function formatLapTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis  = ms % 1000;
  return minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`
    : `${seconds}.${String(millis).padStart(3, "0")}`;
}

/**
 * Processes raw lap data into a sorted leaderboard array.
 *
 * Each driver entry contains:
 *   - name          {string}  Driver name
 *   - transponderId {number}  Hardware transponder ID
 *   - lapCount      {number}  Total laps recorded
 *   - fastestLap    {number}  Fastest lap time in 100s   
 *   - averageLap    {number}  Average lap time in ms
 *   - averageLapFmt {string}  Average lap as a formatted string
 *   - laps          {Array}   Raw lap array [{ d, t }, ...]
 *   - rank          {number}  Position (1 = fastest)
 *
 * Drivers are ranked by fastest lap time (ascending).
 *
 * @param {Object} rawData - JSON object from fetchLapData().
 * @returns {Array<Object>} Sorted leaderboard entries.
 */
export function processLeaderboard(rawData) {
  const entries = Object.entries(rawData).map(([name, data]) => {
    const laps = data.laps ?? [];
    const times = laps.map((lap) => lap.d);

    const fastestLap    = times.length ? Math.min(...times) : Infinity;
    const fastestLapObj = laps.find((l) => l.d === fastestLap) ?? null;
    const fastestLapAt  = fastestLapObj?.t ? new Date(fastestLapObj.t) : null;

    const averageLap = times.length
      ? Math.round(times.reduce((sum, t) => sum + t, 0) / times.length)
      : 0;

    return {
      name,
      transponderId: data.transponderId,
      lapCount:      laps.length,
      fastestLap,
      fastestLapFmt: times.length ? formatLapTime(fastestLap) : "—",
      fastestLapAt,                          // Date object, or null
      fastestLapAtFmt: fastestLapAt
        ? fastestLapAt.toLocaleString()      // e.g. "28/02/2026, 14:12:55"
        : "—",
      averageLap,
      averageLapFmt: times.length ? formatLapTime(averageLap) : "—",
      laps,
    };
  });

  // Sort by fastest lap ascending (drivers with no laps go last)
  entries.sort((a, b) => a.fastestLap - b.fastestLap);

  // Assign rank after sorting
  entries.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return entries;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Loads lap data from a URL and returns a processed leaderboard.
 * @param {string} url - URL of the JSON lap data file.
 * @returns {Promise<Array<Object>>} Sorted leaderboard entries.
 */
export async function loadLeaderboard(url) {
  const rawData = await fetchLapData(url);
  return rawData;//  return processLeaderboard(rawData);
}
