const request = require("supertest");
const app = require("./index");

describe("GET /todos", () => {
  it("should respond with 200 and an empty array of todos", async () => {
    const res = await request(app).get("/todos");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});
