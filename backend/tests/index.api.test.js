const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('Task API', () => {
  let app;
  let tasks;
  let idCounter;

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

    // PUT update a task by ID
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
        task.isOverdue = dueDate ? isOverdue(dueDate) : false;
      }

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

  it('should create a new task with category', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', category: 'Work' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title', 'Test Task');
    expect(res.body).toHaveProperty('category', 'Work');
    expect(res.body).toHaveProperty('completed', false);
  });

  it('should default to uncategorized when no category is provided', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('category', 'uncategorized');
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

  it('should update a task category', async () => {
    // Create a task first
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'Task 1', category: 'Work' });
    
    // Update its category
    const res = await request(app)
      .put(`/tasks/${createRes.body.id}`)
      .send({ category: 'Personal' });
    
    expect(res.body.category).toBe('Personal');
    expect(res.body.title).toBe('Task 1'); // Other fields should remain unchanged
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

  it('should create a task with a due date', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', dueDate: '25-12-2025' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('dueDate', '25-12-2025');
    expect(res.body).toHaveProperty('isOverdue', false);
  });

  it('should reject invalid date format', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', dueDate: '2025-12-25' }); // Wrong format
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid date format. Use DD-MM-YYYY');
  });

  it('should update task due date', async () => {
    // Create a task first
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'Task 1', dueDate: '25-12-2025' });
    
    // Update its due date
    const res = await request(app)
      .put(`/tasks/${createRes.body.id}`)
      .send({ dueDate: '26-12-2025' });
    
    expect(res.body.dueDate).toBe('26-12-2025');
    expect(res.body.title).toBe('Task 1'); // Other fields should remain unchanged
  });

  describe('Due Date Functionality', () => {
    it('should create a task with no due date', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task' });
      expect(res.statusCode).toBe(201);
      expect(res.body.dueDate).toBeNull();
      expect(res.body.isOverdue).toBe(false);
    });

    it('should handle past due dates correctly', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task', dueDate: '01-01-2024' });
      expect(res.statusCode).toBe(201);
      expect(res.body.dueDate).toBe('01-01-2024');
      expect(res.body.isOverdue).toBe(true);
    });

    it('should handle future due dates correctly', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task', dueDate: '25-12-2025' });
      expect(res.statusCode).toBe(201);
      expect(res.body.dueDate).toBe('25-12-2025');
      expect(res.body.isOverdue).toBe(false);
    });

    it('should reject invalid day in date format', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task', dueDate: '32-12-2025' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid date format. Use DD-MM-YYYY');
    });

    it('should reject invalid month in date format', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task', dueDate: '25-13-2025' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid date format. Use DD-MM-YYYY');
    });

    it('should update task due date and maintain other properties', async () => {
      // Create a task with category and due date
      const createRes = await request(app)
        .post('/tasks')
        .send({ 
          title: 'Task 1', 
          category: 'Work',
          dueDate: '25-12-2025'
        });
      
      // Update only the due date
      const updateRes = await request(app)
        .put(`/tasks/${createRes.body.id}`)
        .send({ dueDate: '26-12-2025' });
      
      expect(updateRes.body).toEqual({
        id: createRes.body.id,
        title: 'Task 1',
        category: 'Work',
        completed: false,
        dueDate: '26-12-2025',
        isOverdue: false
      });
    });

    it('should clear due date when updating with null', async () => {
      // Create a task with a due date
      const createRes = await request(app)
        .post('/tasks')
        .send({ 
          title: 'Task 1',
          dueDate: '25-12-2025'
        });
      
      // Clear the due date
      const updateRes = await request(app)
        .put(`/tasks/${createRes.body.id}`)
        .send({ dueDate: null });
      
      expect(updateRes.body.dueDate).toBeNull();
      expect(updateRes.body.isOverdue).toBe(false);
    });

    it('should handle leap year dates correctly', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task', dueDate: '29-02-2024' }); // 2024 is a leap year
      expect(res.statusCode).toBe(201);
      expect(res.body.dueDate).toBe('29-02-2024');
    });

    it('should reject invalid leap year dates', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task', dueDate: '29-02-2025' }); // 2025 is not a leap year
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid date format. Use DD-MM-YYYY');
    });

    it('should maintain due dates when marking tasks as completed', async () => {
      // Create a task with a due date
      const createRes = await request(app)
        .post('/tasks')
        .send({ 
          title: 'Task 1',
          dueDate: '25-12-2025'
        });
      
      // Mark as completed
      const updateRes = await request(app)
        .put(`/tasks/${createRes.body.id}`)
        .send({ completed: true });
      
      expect(updateRes.body.dueDate).toBe('25-12-2025');
      expect(updateRes.body.completed).toBe(true);
    });
  });
});
