import { promises as fs } from "fs";
import { fileURLToPath } from "url";

export async function load2025() {
	const raw = await fs.readFile(new URL("./2025.json", import.meta.url), "utf8");
	return JSON.parse(raw);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	console.log("Loading day night data...");
	load2025()
		.then((data) => processData(data))
		.catch((err) => console.error("Failed to load 2025.json:", err));
}


export function* iterateSunTimesFromData(data) {
	const times = (data && data.daily && data.daily.time) || [];
	const sunrises = (data && data.daily && data.daily.sunrise) || [];
	const sunsets = (data && data.daily && data.daily.sunset) || [];
	for (let i = 0; i < times.length; i++) {
		yield { date: times[i], sunrise: sunrises[i] || null, sunset: sunsets[i] || null };
	}
}

export async function* iterateSunTimes() {
	const data = await load2025();
	for (const item of iterateSunTimesFromData(data)) yield item;
}

export async function getSunTimes() {
	const out = [];
	for await (const item of iterateSunTimes()) out.push(item);
	return out;
}

export function getDayOfYearUTC(input) {
  const date = new Date(input); // always converts safely

  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  return Math.floor((now - start) / 86400000);
}

function processData(data) {
    let days = [];
	for (const item of iterateSunTimesFromData(data)) {
        let dayOfYear = getDayOfYearUTC(item.date);
        let sunriseHour = item.sunrise ? new Date(item.sunrise).getUTCHours() : "N/A";
        let sunsetHour = item.sunset ? new Date(item.sunset).getUTCHours() : "N/A";
      //  console.log(`Day ${dayOfYear}: sunrise at ${sunriseHour} UTC, sunset at ${sunsetHour} UTC`);

        let daylight = 0;
        for(let hour = 1; hour <= 24; hour++) {
            if (item.sunrise && item.sunset) {
                let sunriseHour = new Date(item.sunrise).getUTCHours();
                let sunsetHour = new Date(item.sunset).getUTCHours();
                if (hour >= sunriseHour && hour < sunsetHour) {
                    daylight+=Math.pow(2, hour);
                }
            }
        }
        days.push({  d:daylight });
        //console.log(daylight.toFixed(0));
          //console.log(`Day ${dayOfYear}: Daylight ${daylight.toFixed(0)}`);

        
	}
  for (let i = 0; i < days.length; i++) {
     console.log(days[i].d +",");
  }
 
}
