import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORIES = ['Electronics', 'Bag / Backpack', 'ID / Documents', 'Keys', 'Clothing', 'Stationery', 'Wallet', 'Other'];

const emptyForm = {
  itemName: '',
  description: '',
  type: 'Lost',
  category: 'Other',
  location: '',
  date: new Date().toISOString().slice(0, 10),
  contactInfo: '',
};

const Dashboard = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/items');
      setItems(data);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const displayedItems = items.filter((item) => {
    const matchType = filterType === 'All' || item.type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.itemName.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const stats = {
    total: items.length,
    lost:  items.filter((i) => i.type === 'Lost').length,
    found: items.filter((i) => i.type === 'Found').length,
    mine:  items.filter((i) => (i.userId?._id || i.userId)?.toString() === user?._id?.toString()).length,
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      itemName: item.itemName,
      description: item.description || '',
      type: item.type,
      category: item.category || 'Other',
      location: item.location,
      date: item.date ? item.date.slice(0, 10) : '',
      contactInfo: item.contactInfo,
    });
    setShowForm(true);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { itemName, location, date, contactInfo } = form;
    if (!itemName.trim() || !location.trim() || !date || !contactInfo.trim()) {
      setFormError('Item Name, Location, Date and Contact Info are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editingId) {
        const { data } = await api.put(`/api/items/${editingId}`, form);
        setItems((prev) => prev.map((i) => (i._id === data._id ? data : i)));
      } else {
        const { data } = await api.post('/api/items', form);
        setItems((prev) => [data, ...prev]);
      }
      handleCancel();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item report?')) return;
    try {
      await api.delete(`/api/items/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const isOwner = (item) =>
    (item.userId?._id || item.userId)?.toString() === user?._id?.toString();

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 className="dashboard-title">
            Lost &amp; Found <span className="lf-accent">Hub</span>
          </h1>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user?.name?.split(' ')[0] || 'Student'}</strong> — report or browse campus lost &amp; found items.
          </p>
        </div>
        <button
          id="new-item-btn"
          className="btn btn-primary"
          onClick={() => {
            if (showForm && !editingId) { handleCancel(); }
            else { setEditingId(null); setForm(emptyForm); setShowForm(true); setFormError(''); }
          }}
        >
          {showForm && !editingId ? '✕ Cancel' : '+ Report Item'}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { icon: '📋', number: stats.total,  label: 'Total Reports', color: '' },
          { icon: '❌', number: stats.lost,   label: 'Lost Items',    color: 'lf-lost' },
          { icon: '✅', number: stats.found,  label: 'Found Items',   color: 'lf-found' },
          { icon: '👤', number: stats.mine,   label: 'My Reports',    color: '' },
        ].map(({ icon, number, label, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className={`stat-number ${color}`}>{number}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Report Form ── */}
      {showForm && (
        <div className="create-task-card glass slide-in">
          <h2 className="card-title">
            {editingId ? '✏️ Update Item Report' : '📋 Report an Item'}
          </h2>
          <form onSubmit={handleSubmit} className="task-form">
            {formError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>{formError}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-name" className="form-label">Item Name *</label>
                <input id="item-name" type="text" name="itemName" className="form-input"
                  placeholder="e.g. Blue Backpack" value={form.itemName}
                  onChange={handleChange} disabled={submitting} autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="item-type" className="form-label">Type *</label>
                <select id="item-type" name="type" className="form-input form-select"
                  value={form.type} onChange={handleChange} disabled={submitting}>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-category" className="form-label">Category</label>
                <select id="item-category" name="category" className="form-input form-select"
                  value={form.category} onChange={handleChange} disabled={submitting}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="item-date" className="form-label">Date *</label>
                <input id="item-date" type="date" name="date" className="form-input"
                  value={form.date} onChange={handleChange} disabled={submitting} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="item-location" className="form-label">Location *</label>
              <input id="item-location" type="text" name="location" className="form-input"
                placeholder="e.g. Library, Block-A Canteen" value={form.location}
                onChange={handleChange} disabled={submitting} />
            </div>

            <div className="form-group">
              <label htmlFor="item-desc" className="form-label">Description (optional)</label>
              <textarea id="item-desc" name="description" className="form-input form-textarea"
                placeholder="Colour, brand, any identifying features..."
                value={form.description} onChange={handleChange} disabled={submitting} rows={2} />
            </div>

            <div className="form-group">
              <label htmlFor="item-contact" className="form-label">Contact Info *</label>
              <input id="item-contact" type="text" name="contactInfo" className="form-input"
                placeholder="Phone number or email" value={form.contactInfo}
                onChange={handleChange} disabled={submitting} />
            </div>

            <div className="form-actions">
              <button type="submit" id="item-submit-btn" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? <span className="btn-loading"><span className="spinner-sm"></span> Saving...</span>
                  : editingId ? 'Update Report' : 'Submit Report'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div className="search-bar-row">
        <span className="search-icon">🔍</span>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search by name, category or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1rem', lineHeight:1 }}
            onClick={() => setSearch('')}
            title="Clear"
          >✕</button>
        )}
        <span className="search-divider"></span>
        <div className="filter-tabs">
          {['All', 'Lost', 'Found'].map((t) => (
            <button key={t}
              className={`filter-tab ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'Lost' ? '❌' : t === 'Found' ? '✅' : '📋'} {t}
              <span className="filter-count">
                {t === 'All' ? stats.total : t === 'Lost' ? stats.lost : stats.found}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Items List ── */}
      <div className="task-section">
        {loading ? (
          <div className="tasks-loading">
            {[1, 2, 3].map((i) => <div key={i} className="task-skeleton glass"></div>)}
          </div>
        ) : fetchError ? (
          <div className="alert alert-error">{fetchError}</div>
        ) : displayedItems.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No items found</h3>
            <p className="empty-desc">
              {search ? 'Try a different search term.' : 'No reports yet. Click "+ Report Item" to add the first one.'}
            </p>
          </div>
        ) : (
          <div className="task-list">
            {displayedItems.map((item, idx) => (
              <div
                key={item._id}
                className={`task-card item-card-${item.type === 'Lost' ? 'lost' : 'found'}`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Left: Type Badge */}
                <span className={`type-badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
                  {item.type === 'Lost' ? '❌ Lost' : '✅ Found'}
                </span>

                {/* Middle: Content */}
                <div className="task-content" style={{ flex: 1, minWidth: 0 }}>
                  <p className="item-name">{item.itemName}</p>
                  {item.description && <p className="task-desc">{item.description}</p>}
                  <div className="item-meta-grid">
                    <span className="item-meta-chip">📁 {item.category}</span>
                    <span className="item-meta-chip">📍 {item.location}</span>
                    <span className="item-meta-chip">
                      📅 {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="item-meta-chip">📞 {item.contactInfo}</span>
                    {item.userId?.name && <span className="item-meta-chip">👤 {item.userId.name}</span>}
                  </div>
                </div>

                {/* Right: Actions (owner only, appear on hover) */}
                {isOwner(item) && (
                  <div className="item-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)} title="Edit">
                      ✏️ Edit
                    </button>
                    <button
                      className="task-delete-btn delete-visible"
                      onClick={() => handleDelete(item._id)}
                      title="Delete"
                    >🗑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
