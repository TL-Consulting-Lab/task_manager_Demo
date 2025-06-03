const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('Task API', () => {
  let app;
  let tasks;
  let idCounter;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    tasks = [];
    idCounter = 1;

    // GET all tasks
    app.get('/tasks', (req, res) => {
      res.json(tasks);
    });

    // POST create a new task
    app.post('/tasks', (req, res) => {
      const { title } = req.body;
      const newTask = { id: idCounter++, title, completed: false };
      tasks.push(newTask);
      res.status(201).json(newTask);
    });

    // PUT update a task by ID
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

    // DELETE a task by ID
    app.delete('/tasks/:id', (req, res) => {
      const taskId = parseInt(req.params.id);
      const index = tasks.findIndex(task => task.id === taskId);
      if (index === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }
      const deletedTask = tasks.splice(index, 1)[0];
      res.json({ message: 'Task deleted', task: deletedTask });
    });

    // POST mark all as completed
    app.post('/tasks/complete-all', (req, res) => {
      tasks = tasks.map(task => ({ ...task, completed: true }));
      res.json({ message: 'All tasks marked as completed' });
    });
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title', 'Test Task');
    expect(res.body).toHaveProperty('completed', false);
  });

  it('should get all tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    const res = await request(app).get('/tasks');
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Task 1');
    expect(res.body[1].title).toBe('Task 2');
  });

  it('should update a task by ID', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app)
      .put('/tasks/1')
      .send({ title: 'Updated', completed: true });
    expect(res.body.title).toBe('Updated');
    expect(res.body.completed).toBe(true);
  });

  it('should return 404 when updating a non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/999')
      .send({ title: 'Does not exist' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Task not found');
  });

  it('should delete a task by ID', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app).delete('/tasks/1');
    expect(res.body).toHaveProperty('message', 'Task deleted');
    expect(res.body.task.title).toBe('Task 1');
    // Confirm task is deleted
    const getRes = await request(app).get('/tasks');
    expect(getRes.body.length).toBe(0);
  });

  it('should return 404 when deleting a non-existent task', async () => {
    const res = await request(app).delete('/tasks/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Task not found');
  });

  it('should mark all tasks as completed', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    await request(app).post('/tasks/complete-all');
    const res = await request(app).get('/tasks');
    expect(res.body.every(t => t.completed)).toBe(true);
  });
});
