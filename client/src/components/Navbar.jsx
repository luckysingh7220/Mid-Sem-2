import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">🔍</span>
          <span className="brand-text">Lost<span className="brand-accent">&amp;Found</span></span>
        </Link>
      </div>

      <div className="navbar-links">
        {token ? (
          <>
            <span className="nav-user">
              <span className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              <span className="user-name">{user?.name}</span>
            </span>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} id="logout-btn" className="btn btn-ghost btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
