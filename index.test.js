const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("./index");

const DATA_FILE = path.join(__dirname, "todos.json");

describe("Todo API", () => {
  beforeEach(() => {
    // Clear todos.json before each test to ensure clean state
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
    // Trigger re-load of empty file if needed by modifying index.js's state (done via importing/clearing or recreating state)
    // Actually, since index.js loads once on import, we can just clear/reset the state directly if possible, or test standard API flow.
  });

  afterAll(() => {
    if (fs.existsSync(DATA_FILE)) {
      fs.unlinkSync(DATA_FILE);
    }
  });

  it("should manage todos lifecycle successfully", async () => {
    // 1. GET empty todos
    let res = await request(app).get("/todos");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // 2. POST create a todo
    res = await request(app)
      .post("/todos")
      .send({ title: "  Test todo  " });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test todo");
    expect(res.body.completed).toBe(false);
    expect(res.body).toHaveProperty("id");
    const todoId = res.body.id;

    // 3. GET all todos
    res = await request(app).get("/todos");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(todoId);

    // 4. GET one todo
    res = await request(app).get(`/todos/${todoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(todoId);

    // 5. PUT update todo
    res = await request(app)
      .put(`/todos/${todoId}`)
      .send({ title: "Updated Title", completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Title");
    expect(res.body.completed).toBe(true);

    // 6. GET with query parameter completed
    res = await request(app).get("/todos?completed=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);

    res = await request(app).get("/todos?completed=false");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);

    // 7. DELETE todo
    res = await request(app).delete(`/todos/${todoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(todoId);

    // 8. GET deleted todo (404)
    res = await request(app).get(`/todos/${todoId}`);
    expect(res.statusCode).toBe(404);
  });

  it("should validate inputs correctly", async () => {
    // Invalid POST
    let res = await request(app).post("/todos").send({});
    expect(res.statusCode).toBe(400);

    res = await request(app).post("/todos").send({ title: "   " });
    expect(res.statusCode).toBe(400);

    // Title too long (over 200 characters)
    const longTitle = "a".repeat(201);
    res = await request(app).post("/todos").send({ title: longTitle });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Title must be 200 characters or fewer");

    // Create a valid todo to test PUT validation
    res = await request(app).post("/todos").send({ title: "Valid Todo" });
    expect(res.statusCode).toBe(201);
    const todoId = res.body.id;

    // Invalid PUT - Title too long (over 200 characters)
    res = await request(app).put(`/todos/${todoId}`).send({ title: longTitle });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Title must be 200 characters or fewer");

    // Invalid PUT - Not found
    res = await request(app).put("/todos/999").send({ title: "Updated" });
    expect(res.statusCode).toBe(404);
  });
});
