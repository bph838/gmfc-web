const path = require("path");
const fs = require("fs").promises;

let drivers = [];
let driverLookup = new Map();
let driverLaps = new Map();

async function loadDrivers() {
  const driverFile = path.join(__dirname, "src\\lapmonitor\\drivers\\drivers.json");

  console.log("Loading drivers:", driverFile);

  const data = await fs.readFile(driverFile, "utf8");
  drivers = JSON.parse(data);

  for (const d of drivers) {
    driverLookup.set(d.transponderId, d.name);

    driverLaps.set(d.name, {
      transponderId: d.transponderId,
      laps: [],
    });

    console.log(`Driver loaded: ${d.name} (${d.transponderId})`);
  }
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

    for (const race of data.races) {
      const raceStart = new Date(race.date);

      for (const driver of race.drivers) {
        const driverName = driverLookup.get(driver.transponderId);

        if (!driverName) {
          console.log(`Unknown transponder ${driver.transponderId} - skipping`);
          continue;
        }

        console.log(`Processing laps for ${driverName}`);

        for (const lap of driver.laps) {
          if (lap.kind === "initial") {
            continue;
          }

          const lapTime = new Date(raceStart.getTime() + lap.endTimestamp);

          const record = {
            d: lap.duration,
            t: lapTime.toISOString(),
          };

          driverLaps.get(driverName).laps.push(record);
        }
      }
    }
  }
}

async function saveResults() {
  console.log("Sorting results");

  const output = {};

  for (const [driver, data] of driverLaps.entries()) {
    data.laps.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    output[driver] = data;

    console.log(`${driver}: ${data.laps.length} laps`);
  }

  const outFile = path.join(__dirname, "src\\lapmonitor\\driver_laps.json");

  await fs.writeFile(outFile, JSON.stringify(output, null, 2));

  console.log("Results written to", outFile);
}

async function run() {
  console.log("LapMonitor starting...");

  await loadDrivers();
  await processLapFiles();
  await saveResults();

  console.log("Processing complete");
}

run().catch(console.error);
