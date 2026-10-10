# Betechiefied Todo API Assignment

A simple, lightweight RESTful Todo API built using Node.js and Express 5.

## Features

- In-memory storage (resets when the server restarts).
- Full CRUD operations (`GET`, `POST`, `PUT`, `DELETE`) on todos.
- Input validation for title and completion status.
- Graceful handling of unknown routes and malformed JSON payloads.
- Filtering todos by completion status.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository (if not already done):
   ```bash
   git clone <repository-url>
   cd betechiefied_todo_api_assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the production server:
```bash
npm start
```

To start the development server with automatic reloading (utilizing Node's `--watch` flag):
```bash
npm run dev
```

By default, the server runs on `http://localhost:3000`. You can override this port by setting the `PORT` environment variable.

## API Endpoints

All request and response bodies are formatted as JSON.

### 1. Get All Todos

- **Endpoint:** `GET /todos`
- **Query Parameters:**
  - `completed` (optional): Filter by completion status (`true` or `false`).
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Learn Express 5",
      "completed": false,
      "createdAt": "2023-10-27T10:00:00.000Z"
    }
  ]
  ```

### 2. Get Todo by ID

- **Endpoint:** `GET /todos/:id`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Learn Express 5",
    "completed": false,
    "createdAt": "2023-10-27T10:00:00.000Z"
  }
  ```
- **Response (404 Not Found):**
  ```json
  { "error": "Todo not found" }
  ```

### 3. Create Todo

- **Endpoint:** `POST /todos`
- **Request Body:**
  ```json
  {
    "title": "Write README file"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 2,
    "title": "Write README file",
    "completed": false,
    "createdAt": "2023-10-27T10:05:00.000Z"
  }
  ```
- **Response (400 Bad Request):** If the `title` is missing or empty.
  ```json
  { "error": "Title is required" }
  ```

### 4. Update Todo

- **Endpoint:** `PUT /todos/:id`
- **Request Body (all fields are optional):**
  ```json
  {
    "title": "Write an awesome README file",
    "completed": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 2,
    "title": "Write an awesome README file",
    "completed": true,
    "createdAt": "2023-10-27T10:05:00.000Z"
  }
  ```
- **Response (400 Bad Request):** If `title` is empty or not a string, or if `completed` is not a boolean.
- **Response (404 Not Found):** If the todo with the given ID does not exist.

### 5. Delete Todo

- **Endpoint:** `DELETE /todos/:id`
- **Response (200 OK):** Returns the deleted todo item.
  ```json
  {
    "id": 2,
    "title": "Write an awesome README file",
    "completed": true,
    "createdAt": "2023-10-27T10:05:00.000Z"
  }
  ```
- **Response (404 Not Found):** If the todo with the given ID does not exist.

## License

This project is licensed under the [ISC License](LICENSE).
smoke test 1
