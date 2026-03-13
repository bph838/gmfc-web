const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

let drivers = [];
let driverLookup = new Map();
let driverLaps = new Map();

const LAP_HUNDREDS = 100;
const MAX_LAP = 100 * LAP_HUNDREDS;

async function loadDrivers() {
  const driverFile = path.join(
    __dirname,
    "src\\lapmonitor\\drivers\\drivers.json",
  );

  console.log("Loading drivers:", driverFile);

  const data = await fs.readFile(driverFile, "utf8");
  drivers = JSON.parse(data);

  let dirty = false;

  for (const d of drivers) {
    if (!d.uuid) {
      d.uuid = crypto
        .createHash("md5")
        .update(`${d.name}:${d.transponderId}`)
        .digest("hex");
      dirty = true;
      console.log(
        `Generated uuid for: ${d.name} (${d.transponderId}) [${d.uuid}]`,
      );
    }

    driverLookup.set(d.uuid, d);

    driverLaps.set(d.uuid, {
      uuid: d.uuid,
      name: d.name,
      transponderId: d.transponderId,
      laps: [],
    });

    console.log(`Driver loaded: ${d.name} (${d.transponderId}) [${d.uuid}]`);
  }

  if (dirty) {
    await fs.writeFile(driverFile, JSON.stringify(drivers, null, 2), "utf8");
    console.log("Drivers file updated with new uuids");
  }
}

function getDriversByTransponderId(transponderId) {
  return [...driverLookup.values()].filter(
    (d) => d.transponderId === transponderId,
  );
}

async function processLapFiles() {
  const dir = path.join(__dirname, "src\\lapmonitor\\rawfiles");

  console.log("Scanning directory:", dir);

  const files = await fs.readdir(dir);
  const jsonFiles = files.filter((f) => f.toLowerCase().endsWith(".json"));

  console.log(`Found ${jsonFiles.length} session files`);

  for (const file of jsonFiles) {
    const fullPath = path.join(dir, file);
    console.log("Processing:", file);

    const raw = await fs.readFile(fullPath, "utf8");
    const data = JSON.parse(raw);

    if (!data.races) {
      console.log("No races in file");
      continue;
    }

    const tooOLdDate = new Date();
    tooOLdDate.setFullYear(tooOLdDate.getFullYear() - 1);
    for (const race of data.races) {
      const raceStart = new Date(race.date);
      if (raceStart < tooOLdDate) continue;

      for (const driver of race.drivers) {
        const driverDetails = fetchDriver(driver); //driverLookup.get(driver.transponderId);
        if (!driverDetails) {
          console.log(`Unknown transponder ${driver.transponderId} - skipping`);
          continue;
        }
        console.log(`Processing lap for driver ${driver.name}`);

        console.log(
          `Processing laps for ${driverDetails.name} transponderId: ${driverDetails.transponderId} uuid:${driverDetails.uuid}`,
        );

        for (const lap of driver.laps) {
          if (lap.kind === "initial") {
            continue;
          }
          if (lap.duration > MAX_LAP) {
            continue;
          }

          let endTS = (lap.endTimestamp / 100) * 1000;

          const lapTime = new Date(raceStart.getTime() + endTS);

          console.log(lapTime);

          const record = {
            d: lap.duration,
            t: lapTime.getTime(),
          };

          driverLaps.get(driverDetails.uuid).laps.push(record);
        }
      }
    }
  }
}

function fetchDriver(d) {
  const drivers = getDriversByTransponderId(d.transponderId);
  if (drivers.length === 0) {
    console.log("No drivers found");
    return null;
  }

  if (drivers.length === 1) return drivers[0];

  let recordDriverName = d.name;
  recordDriverName = recordDriverName.trimStart();
  recordDriverName = recordDriverName.trimEnd();

  for (const driver of drivers) {
    let driverName = driver.name;
    driverName = driverName.trimStart();
    driverName = driverName.trimEnd();
    let transponderIdString = driver.transponderId.toString();

    /*
    if (driverName.toLowerCase() === recordDriverName.toLowerCase()) {
      console.log(`Found base driver ${driver.name}`);
      return driver;
    }

    if (driverName.toLowerCase() === transponderIdString.toLowerCase()) {
      console.log(`Found base driver ${driver.name}`);
      return driver;
    }*/
  }
  return null;
}

async function saveResults() {
  console.log("Sorting results");

  const output = {};

  for (const [driver, data] of driverLaps.entries()) {
    data.laps.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    output[driver] = data;

    console.log(`${driver}: ${data.laps.length} laps`);

    const outDriverFile = path.join(
      __dirname,
      `src\\data\\drivers\\${driver}.json`,
    );
    await fs.writeFile(outDriverFile, JSON.stringify(data, null, 2));
  }

  const outFile = path.join(__dirname, "src\\data\\driver_laps.json");

  await fs.writeFile(outFile, JSON.stringify(output, null, 2));

  console.log("Results written to", outFile);
}

async function renameLapMonitorFiles(directoryPath) {
  const files = await fs.readdir(directoryPath);
  const jsonFiles = files.filter((f) => f.toLowerCase().endsWith(".json"));

  for (const file of jsonFiles) {
    const filePath = path.join(directoryPath, file);

    try {
      const content = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(content);

      const firstRace = data?.races?.[0];
      if (!firstRace?.date) {
        console.warn(`Skipping ${file}: no race date found`);
        continue;
      }

      const date = new Date(firstRace.date);
      const yyyy = date.getUTCFullYear();
      const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(date.getUTCDate()).padStart(2, "0");
      const hh = String(date.getUTCHours()).padStart(2, "0");
      const min = String(date.getUTCMinutes()).padStart(2, "0");
      const ss = String(date.getUTCSeconds()).padStart(2, "0");

      const newName = `Lapmonitor ${yyyy}-${mm}-${dd} ${hh}-${min}-${ss}.json`;
      const newPath = path.join(directoryPath, newName);

      await fs.rename(filePath, newPath);
      console.log(`Renamed: ${file} → ${newName}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
}

async function saveSummary() {
  console.log("Saving Summary");

  let driverData = [];
  let driverSummary = {};
  const inFile = path.join(__dirname, "src\\data\\driver_laps.json");

  const data = await fs.readFile(inFile, "utf8");
  driverData = JSON.parse(data);

  Object.values(driverData).forEach((driver) => {
    console.log(driver);

    let fastestLap = Infinity;
    let fastestTime = null;
    let total = 0;

    driver.laps.forEach((lap) => {
      total += lap.d;

      if (lap.d < fastestLap) {
        fastestLap = lap.d;
        fastestTime = lap.t;
      }
    });

    const averageLap = total / driver.laps.length;
    const results = {};
    results[driver.uuid] = {
      name: driver.name,
      transponderId: driver.transponderId,
      fastestLap: fastestLap,
      fastestLapTime: fastestTime,
      averageLap: averageLap,
      lapCount: driver.laps.length,
    };

    driverSummary = { ...driverSummary, ...results };
  });
  const outFile = path.join(__dirname, "src\\data\\driver_summary.json");
  await fs.writeFile(outFile, JSON.stringify(driverSummary, null, 2));
}

async function run() {
  console.log("LapMonitor starting...");

  await renameLapMonitorFiles(
    "D:\\Gordano Model Flying Club\\gmfc-web\\src\\lapmonitor\\rawfiles",
  );
  await loadDrivers();
  await processLapFiles();
  await saveResults();
  await saveSummary();

  console.log("Processing complete");
}

run().catch(console.error);
