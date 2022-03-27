const axios = require("axios");
const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

let DEFAULT_FLIGHT_NUMBER = 100;

async function getAllLaunches({ skip, limit }) {
  return await launches
    .find(
      {},
      {
        __v: 0,
        _id: 0,
      }
    )
    .skip(skip)
    .limit(limit)
    .sort({ flightNumber: 1 });
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("Planet not found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customers: ["Abc", "Defgh"],
    upcoming: true,
    success: true,
  });
  await saveLaunch(newLaunch);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");

  return latestLaunch?.flightNumber || DEFAULT_FLIGHT_NUMBER;
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const {
      flight_number: flightNumber,
      name: mission,
      rocket: { name: rocket },
      date_local: launchDate,
      upcoming,
      success,
      payloads,
    } = launchDoc;

    const customers = payloads.flatMap(({ customers }) => customers);

    saveLaunch({
      flightNumber,
      mission,
      rocket,
      launchDate,
      upcoming,
      success,
      customers,
    });
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launches already loaded");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function abortLaunchById(id) {
  const aborted = await launches.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  scheduleNewLaunch,
  getAllLaunches,
  abortLaunchById,
  findLaunch,
};
