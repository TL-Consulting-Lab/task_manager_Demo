# Task Manager Backend

This is the backend API for the Task Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:4000`.

3. Run tests:
```bash
npm test
```

## API Documentation

For detailed API documentation including request/response examples, see [API.md](API.md).

## API Endpoints Summary

- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `POST /tasks/complete-all` - Mark all tasks as completed

## Testing

The API is tested using Jest and Supertest. Run tests with:

```bash
npm test
```
