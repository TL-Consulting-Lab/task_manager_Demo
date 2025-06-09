const express = require('express');
const router = express.Router();
let tasks = [];
let idCounter = 1;

// GET all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// POST create a new task
router.post('/', (req, res) => {
  const { title } = req.body;
  const newTask = { id: idCounter++, title, completed: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update a task by ID
router.put('/:id', (req, res) => {
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

// DELETE a task by ID
router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const deletedTask = tasks.splice(index, 1)[0];
  res.json({ message: 'Task deleted', task: deletedTask });
});

// POST mark all as completed
router.post('/complete-all', (req, res) => {
  tasks = tasks.map(task => ({ ...task, completed: true }));
  res.json({ message: 'All tasks marked as completed' });
});

module.exports = router;
