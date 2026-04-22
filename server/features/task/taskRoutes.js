const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('./taskController');

// GET    /api/tasks     — get all tasks for current user
// POST   /api/tasks     — create a task
router.route('/').get(getTasks).post(createTask);

// PUT    /api/tasks/:id — update a task
// DELETE /api/tasks/:id — delete a task
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
