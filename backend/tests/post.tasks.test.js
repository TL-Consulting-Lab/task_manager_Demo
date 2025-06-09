const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('POST /tasks', () => {
  let app;
  let tasks;
  let idCounter;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    tasks = [];
    idCounter = 1;

    app.post('/tasks', (req, res) => {
      const { title } = req.body;
      const newTask = { id: idCounter++, title, completed: false };
      tasks.push(newTask);
      res.status(201).json(newTask);
    });
  });

  it('should create a new task and return it with status 201', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title', 'Test Task');
    expect(res.body).toHaveProperty('completed', false);
  });

  it('should add the new task to the tasks array', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    // Simulate GET /tasks endpoint for checking
    app.get('/tasks', (req, res) => res.json(tasks));
    const res = await request(app).get('/tasks');
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Task 1');
    expect(res.body[1].title).toBe('Task 2');
  });
});
