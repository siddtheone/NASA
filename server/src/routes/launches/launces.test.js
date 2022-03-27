const request = require("supertest");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const app = require("../../app");

describe("APIs", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("GET /launches", () => {
    test("It should respond with 200 success", async () => {
      await request(app).get("/v1/launches").expect(200);
    });
  });
  describe("POST /launches", () => {
    const mockLaunch = {
      mission: "mission",
      rocket: "rocket",
      launchDate: "April 4, 2022",
      target: "Kepler-442 b",
    };
    test("It should respond with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(mockLaunch)
        .expect(201);

      const { launchDate, ...restLaunch } = mockLaunch;

      expect(new Date(response.body.launchDate).valueOf()).toBe(
        new Date(launchDate).valueOf()
      );
      expect(response.body).toMatchObject(restLaunch);
    });

    test("It should catch missing required properties", async () => {
      const { launchDate, ...incompleteLaunch } = mockLaunch;

      const response = await request(app)
        .post("/v1/launches")
        .send(incompleteLaunch)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing data",
      });
    });

    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({ ...mockLaunch, launchDate: "a" })
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Incorrect date",
      });
    });
  });
});
