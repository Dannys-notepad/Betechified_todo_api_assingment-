const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, "todos.json");

// Load todos from file or initialize
const todosMap = new Map();
let nextId = 1;

function loadTodos() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(data);
      todosMap.clear();
      if (Array.isArray(parsed)) {
        for (const todo of parsed) {
          if (todo && typeof todo.id === "number") {
            todosMap.set(todo.id, todo);
          }
        }
      }
      if (todosMap.size > 0) {
        nextId = Math.max(...Array.from(todosMap.keys())) + 1;
      } else {
        nextId = 1;
      }
    } else {
      todosMap.clear();
      nextId = 1;
    }
  } catch (error) {
    console.error("Error reading or parsing todos file, starting fresh:", error);
    todosMap.clear();
    nextId = 1;
  }
}

// Reset in-memory state (for testing)
function resetTodos() {
  todosMap.clear();
  nextId = 1;
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
}

// Serialized, non-blocking asynchronous save
let isWriting = false;
let pendingWrite = false;

function saveTodos() {
  if (isWriting) {
    pendingWrite = true;
    return;
  }

  isWriting = true;
  pendingWrite = false;

  const data = JSON.stringify(Array.from(todosMap.values()));
  fs.writeFile(DATA_FILE, data, "utf8", (error) => {
    isWriting = false;
    if (error) {
      console.error("Error saving todos to file:", error);
    }
    if (pendingWrite) {
      saveTodos();
    }
  });
}

// Initial load
loadTodos();

// GET all todos (optional filter: /todos?completed=true)
app.get("/todos", (req, res) => {
  const list = Array.from(todosMap.values());
  if (req.query.completed !== undefined) {
    const completed = req.query.completed === "true";
    return res.json(list.filter((t) => t.completed === completed));
  }
  res.json(list);
});

// GET todos stats
app.get("/todos/stats", (req, res) => {
  const list = Array.from(todosMap.values());
  const total = list.length;
  const completed = list.filter((t) => t.completed === true).length;
  res.json({ total, completed });
});

// GET one todo
app.get("/todos/:id", (req, res) => {
  const todo = todosMap.get(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
});

// POST create a todo
app.post("/todos", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: "Title must be 200 characters or fewer" });
  }
  const todo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todosMap.set(todo.id, todo);
  saveTodos();
  res.status(201).json(todo);
});

// PUT update a todo
app.put("/todos/:id", (req, res) => {
  const todo = todosMap.get(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  const { title, completed } = req.body;
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title must be a non-empty string" });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: "Title must be 200 characters or fewer" });
    }
    todo.title = title.trim();
  }
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed must be a boolean" });
    }
    todo.completed = completed;
  }
  saveTodos();
  res.json(todo);
});

// DELETE a todo
app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todosMap.get(id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  todosMap.delete(id);
  saveTodos();
  res.json(todo);
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler (also catches malformed JSON bodies)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API running on http://localhost:${PORT}`);
  });
}

// Attach resetTodos for testing
app.resetTodos = resetTodos;

module.exports = app;
