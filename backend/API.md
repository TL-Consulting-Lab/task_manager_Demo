# Task Manager API Documentation

## Base URL
```
http://localhost:4000
```

## Endpoints

### 1. Get All Tasks
Retrieves a list of all tasks.

**Request:**
```http
GET /tasks
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "category": "Work",
    "completed": false,
    "dueDate": "15-06-2025",
    "isOverdue": false
  },
  {
    "id": 2,
    "title": "Buy groceries",
    "category": "Personal",
    "completed": true,
    "dueDate": "01-06-2025",
    "isOverdue": true
  }
]
```

### 2. Create New Task
Creates a new task.

**Request:**
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "category": "Work",
  "dueDate": "15-06-2025"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "category": "Work",
  "completed": false,
  "dueDate": "15-06-2025",
  "isOverdue": false
}
```

**Validation:**
- `title` is required
- `category` is optional (defaults to "uncategorized")
- `dueDate` is optional, must be in format "DD-MM-YYYY"

**Error Response:**
```json
{
  "error": "Invalid date format. Use DD-MM-YYYY"
}
```

### 3. Update Task
Updates an existing task by ID.

**Request:**
```http
PUT /tasks/:id
Content-Type: application/json

{
  "title": "Updated task title",
  "category": "Personal",
  "completed": true,
  "dueDate": "20-06-2025"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated task title",
  "category": "Personal",
  "completed": true,
  "dueDate": "20-06-2025",
  "isOverdue": false
}
```

**Notes:**
- All fields are optional in the update request
- Only provided fields will be updated
- Updating `dueDate` will recalculate `isOverdue`

**Error Response:**
```json
{
  "error": "Task not found"
}
```

### 4. Delete Task
Deletes a task by ID.

**Request:**
```http
DELETE /tasks/:id
```

**Response:**
```json
{
  "message": "Task deleted",
  "task": {
    "id": 1,
    "title": "Deleted task",
    "category": "Work",
    "completed": false,
    "dueDate": "15-06-2025",
    "isOverdue": false
  }
}
```

**Error Response:**
```json
{
  "error": "Task not found"
}
```

### 5. Mark All Tasks as Completed
Marks all existing tasks as completed.

**Request:**
```http
POST /tasks/complete-all
```

**Response:**
```json
{
  "message": "All tasks marked as completed"
}
```

## Data Types

### Task Object
```typescript
{
  id: number;          // Unique identifier
  title: string;       // Task title
  category: string;    // Task category (defaults to "uncategorized")
  completed: boolean;  // Completion status
  dueDate: string;    // Due date in DD-MM-YYYY format (optional)
  isOverdue: boolean; // Indicates if task is past due date
}
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation error)
- `404` - Resource not found
- `500` - Server error

Error responses include an error message:
```json
{
  "error": "Error message here"
}
```
