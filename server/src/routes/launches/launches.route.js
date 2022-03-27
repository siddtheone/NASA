const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortNewLaunch,
} = require("./launches.countroller");

const launchesRouter = express.Router();

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.delete("/:id", httpAbortNewLaunch);

module.exports = launchesRouter;
