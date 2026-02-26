let leaderboard_data = [];
const course = "Trophy Course";
const returnTop = 20;

export function setData(data) {
  leaderboard_data = data;
}

function excelDateToJSDate(serial) {
  // Excel stores dates as days since 1900-01-01
  const utcDays = serial - 25569; // days between 1900-01-01 and 1970-01-01
  const utcValue = utcDays * 86400 * 1000; // convert to milliseconds
  return new Date(utcValue);
}

// Get laptimes with actual dates
export function getLapsWithDate(participant) {
  return leaderboard_data
    .filter((d) => d.Participant === participant)
    .map((d) => ({
      date: excelDateToJSDate(d.Date),
      laptime: d.Laptime,
      course: d.Course,
      battery: d.Battery,
    }));
}

export function getFastestEverLap() {
  if (!leaderboard_data.length) return null; // handle empty array

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  console.log("getFastestEverLap in the last year");

  // Filter laps by course in the last year
  const recentCourseLaps = leaderboard_data.filter((lap) => {
    if (!lap.Course || lap.Course !== course) return false;
    if (!lap.Date) return false;

    const lapDate = excelDateToJSDate(lap.Date);
    return lapDate >= oneYearAgo && lapDate <= now;
  });

  if (recentCourseLaps.length === 0) {
    console.warn(`No laps in the last year for course: "${course}"`);
    return null;
  }

  // Start with the first lap
  let fastestLap = recentCourseLaps[0];

  for (let i = 1; i < recentCourseLaps.length; i++) {
    if (recentCourseLaps[i].Laptime < fastestLap.Laptime) {
      fastestLap = recentCourseLaps[i];
    }
  }

  // Optionally, include a JS Date version
  return {
    ...fastestLap,
    date: excelDateToJSDate(fastestLap.Date),
  };
}

export function getAllParticipants() {
  if (!leaderboard_data) return [];

  return [
    ...new Set(
      leaderboard_data
        .filter((lap) => lap.Course === course && lap.Participant)
        .map((lap) => lap.Participant),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export function getLapsByParticipantForCourse(participant) {
  if (!course || !participant) return [];

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  return leaderboard_data
    .filter(lap => {
      if (lap.Course !== course) return false;
      if (lap.Participant !== participant) return false;
      if (!lap.Date || !lap.Laptime) return false;

      const lapDate = excelDateToJSDate(lap.Date);
      return lapDate >= oneYearAgo && lapDate <= now;
    })
    .map(lap => {
      const jsDate = excelDateToJSDate(lap.Date);
      return {
        ...lap,
        date: jsDate       
      };
    })
    .sort((a, b) => a.Laptime - b.Laptime) //fastets first    
    .slice(0, returnTop);//top X
}

export function getTopParticipantsForCourse(limit = 10) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // 1️⃣ filter + convert date
  const laps = leaderboard_data
    .filter(lap => lap.Course === course)
    .map(lap => ({
      ...lap,
      Date: excelDateToJSDate(lap.Date)
    }))
    .filter(lap => lap.Date >= oneYearAgo);

  // 2️⃣ sort fastest first
  laps.sort((a, b) => a.Laptime - b.Laptime);

  // 3️⃣ keep fastest per participant
  const seen = new Set();
  const unique = [];

  for (const lap of laps) {
    if (!seen.has(lap.Participant)) {
      seen.add(lap.Participant);
      unique.push(lap);
    }
  }

  // 4️⃣ skip first (fastest) and return next X
  return unique.slice(1, limit + 1);
}
