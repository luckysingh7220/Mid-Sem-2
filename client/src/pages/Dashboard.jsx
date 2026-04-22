import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();

  // ── Task State ────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskError, setTaskError] = useState('');

  // ── Create Task Form ──────────────────────────────────────────────────────
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // ── Filter ────────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // ── Fetch Tasks ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const { data } = await api.get('/api/tasks');
        setTasks(data);
      } catch (err) {
        setTaskError(err.response?.data?.message || 'Failed to load tasks');
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // ── Create Task ───────────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setCreateError('Task title is required');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const { data } = await api.post('/api/tasks', newTask);
      setTasks((prev) => [data, ...prev]);
      setNewTask({ title: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  // ── Toggle Complete ───────────────────────────────────────────────────────
  const handleToggleComplete = async (task) => {
    try {
      const { data } = await api.put(`/api/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // ── Delete Task ───────────────────────────────────────────────────────────
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // ── Filtered Tasks ────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">
            Hello, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="dashboard-subtitle">
            Here&apos;s what&apos;s on your plate today.
          </p>
        </div>
        <button
          id="new-task-btn"
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setCreateError(''); }}
        >
          {showForm ? '✕ Cancel' : '+ New Task'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-number text-success">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-number text-accent">{stats.active}</div>
          <div className="stat-label">Remaining</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-number">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </div>
          <div className="stat-label">Progress</div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {stats.total > 0 && (
        <div className="progress-container glass">
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{stats.completed}/{stats.total} tasks</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* ── Create Task Form ── */}
      {showForm && (
        <div className="create-task-card glass slide-in">
          <h2 className="card-title">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="task-form">
            {createError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {createError}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">Title *</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                disabled={creating}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="task-desc" className="form-label">Description (optional)</label>
              <textarea
                id="task-desc"
                className="form-input form-textarea"
                placeholder="Add more details..."
                value={newTask.description}
                onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                disabled={creating}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="submit" id="create-task-submit" className="btn btn-primary" disabled={creating}>
                {creating ? (
                  <span className="btn-loading"><span className="spinner-sm"></span> Creating...</span>
                ) : 'Create Task'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowForm(false); setCreateError(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Task List ── */}
      <div className="task-section">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">
                {f === 'all' ? stats.total : f === 'active' ? stats.active : stats.completed}
              </span>
            </button>
          ))}
        </div>

        {/* Task Items */}
        {tasksLoading ? (
          <div className="tasks-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="task-skeleton glass"></div>
            ))}
          </div>
        ) : taskError ? (
          <div className="alert alert-error">{taskError}</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">
              {filter === 'completed' ? '🎉' : filter === 'active' ? '✨' : '📋'}
            </div>
            <h3 className="empty-title">
              {filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'active'
                ? 'All caught up!'
                : 'No tasks yet'}
            </h3>
            <p className="empty-desc">
              {filter === 'all'
                ? 'Click "+ New Task" to create your first task.'
                : 'Change filter to see other tasks.'}
            </p>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-card glass ${task.completed ? 'task-done' : ''}`}
              >
                <button
                  className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => handleToggleComplete(task)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  title={task.completed ? 'Mark as active' : 'Mark as complete'}
                >
                  {task.completed && <span className="check-icon">✓</span>}
                </button>

                <div className="task-content">
                  <p className={`task-title ${task.completed ? 'task-strikethrough' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}
                  <p className="task-meta">
                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="task-actions">
                  {task.completed && (
                    <span className="task-badge">Done</span>
                  )}
                  <button
                    className="task-delete-btn"
                    onClick={() => handleDeleteTask(task._id)}
                    aria-label="Delete task"
                    title="Delete task"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
