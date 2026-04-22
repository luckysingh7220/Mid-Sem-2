const Task = require('./taskModel');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Protected
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Protected
const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const task = await Task.create({
      title,
      description: description || '',
      userId: req.user._id, // injected from JWT middleware
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task (ownership check)
// @route   PUT /api/tasks/:id
// @access  Protected
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Ownership check — ensure task belongs to the requesting user
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task (ownership check)
// @route   DELETE /api/tasks/:id
// @access  Protected
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Ownership check
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this task');
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
