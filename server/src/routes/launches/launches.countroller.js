const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  findLaunch,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const launches = await getAllLaunches(getPagination(req.query));
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const { mission, rocket, launchDate, target } = req.body;

  if (!mission || !rocket || !launchDate || !target) {
    return res.status(400).json({
      error: "Missing data",
    });
  }

  const launchDateObj = new Date(launchDate);

  if (isNaN(launchDateObj)) {
    return res.status(400).json({
      error: "Incorrect date",
    });
  }

  const data = {
    ...req.body,
    launchDate: launchDateObj,
  };
  await scheduleNewLaunch(data);
  return res.status(201).json(data);
}

async function httpAbortNewLaunch(req, res) {
  const id = +req.params.id;

  if (!(await findLaunch({ flightNumber: id }))) {
    return res.status(400).json({
      error: "Launch not exists",
    });
  } else {
    const aborted = await abortLaunchById(id);
    console.log(aborted);
    if (!aborted) {
      return res.status(400).json({
        error: "Launch not aborted",
      });
    }
    return res.status(200).json({ ok: true });
  }
}

module.exports = {
  httpAbortNewLaunch,
  httpAddNewLaunch,
  httpGetAllLaunches,
};
