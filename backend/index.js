const express = require('express');
const app = express();
const port = 4000;
const cors = require('cors');

app.use(cors());
app.use(express.json());


let tasks = [];
let idCounter = 1;

// Helper function to validate date format (DD-MM-YYYY)
function isValidDateFormat(dateString) {
  if (!dateString) return true; // Allow null/undefined dates
  const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  // Validate the date is real
  const [day, month, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

// Function to check if a task is overdue
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const [day, month, year] = dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  return due < new Date();
}

// Get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Create a new task
app.post('/tasks', (req, res) => {
  const { title, category, dueDate } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (dueDate && !isValidDateFormat(dueDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY' });
  }

  const newTask = {
    id: idCounter++,
    title,
    category: category || 'uncategorized',
    completed: false,
    dueDate: dueDate || null,
    isOverdue: dueDate ? isOverdue(dueDate) : false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update an existing task by ID
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, completed, category, dueDate } = req.body;

  const task = tasks.find(task => task.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (dueDate && !isValidDateFormat(dueDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY' });
  }

  if (title !== undefined) task.title = title;
  if (completed !== undefined) task.completed = completed;
  if (category !== undefined) task.category = category;
  if (dueDate !== undefined) {
    task.dueDate = dueDate;
    task.isOverdue = isOverdue(dueDate);
  }

  res.json(task);
});

// Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const deletedTask = tasks.splice(index, 1)[0];
  res.json({ message: 'Task deleted', task: deletedTask });
});

// Mark all tasks as completed
app.post('/tasks/complete-all', (req, res) => {
  tasks = tasks.map(task => ({ ...task, completed: true }));
  res.json({ message: 'All tasks marked as completed' });
});


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});