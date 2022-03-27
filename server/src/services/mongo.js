const mongoose = require("mongoose");

require("dotenv").config();

mongoose.connection.once("open", () => {
  console.log("Conncected to DB");
});
mongoose.connection.on("error", (error) => {
  console.error(error);
});

const MONGO_URL = process.env.MONGO_URL;

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
