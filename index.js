const express = require('express');
const app = express();
const port = 4000;
const cors = require('cors');

app.use(cors());
app.use(express.json());


let tasks = [];
let idCounter = 1;

// Get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  const newTask = { id: idCounter++, title, completed: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update an existing task by ID (e.g. title or completed status)
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, completed } = req.body;

  const task = tasks.find(task => task.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (title !== undefined) task.title = title;
  if (completed !== undefined) task.completed = completed;

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