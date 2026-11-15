import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTint, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-drop">🩸</span>
            <div className="logo-text">
              Rakta<span>Setu</span>
            </div>
          </Link>

          <div className="navbar-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/find-donor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Find Donor
            </NavLink>
            <NavLink to="/register-donor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Become a Donor
            </NavLink>
            <NavLink to="/request" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Request Blood
            </NavLink>
          </div>

          <div className="navbar-actions">
            {user ? (
              <>
                <div className="user-pill">
                  <FaUser size={12} />
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
                <button onClick={handleLogout} className="btn btn-primary btn-sm">
                  <FaSignOutAlt size={12} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar-mobile ${mobileOpen ? '' : 'hidden'}`}>
          <NavLink to="/" end onClick={() => setMobileOpen(false)} className="nav-link">Home</NavLink>
          <NavLink to="/find-donor" onClick={() => setMobileOpen(false)} className="nav-link">Find Donor</NavLink>
          <NavLink to="/register-donor" onClick={() => setMobileOpen(false)} className="nav-link">Become a Donor</NavLink>
          <NavLink to="/request" onClick={() => setMobileOpen(false)} className="nav-link">Request Blood</NavLink>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-secondary btn-sm">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-primary btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
