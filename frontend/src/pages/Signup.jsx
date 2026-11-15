import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [role, setRole] = useState('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, role);
      toast.success('🎉 Account created! Welcome to RaktaSetu!');
      if (role === 'donor') {
        navigate('/register-donor');
      } else {
        navigate('/find-donor');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-card-header">
          <div className="icon">🩸</div>
          <h1>Join RaktaSetu</h1>
          <p>Create your account for Chhatrapati Sambhaji Nagar Blood Network</p>
        </div>

        {/* Role Selection */}
        <div className="role-select-grid">
          <button
            type="button"
            className={`role-btn ${role === 'donor' ? 'selected' : ''}`}
            onClick={() => setRole('donor')}
          >
            <div className="role-icon">🩸</div>
            <div className="role-name">Blood Donor</div>
            <div className="role-desc">I want to donate blood</div>
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'seeker' ? 'selected' : ''}`}
            onClick={() => setRole('seeker')}
          >
            <div className="role-icon">🔍</div>
            <div className="role-name">Find Donor</div>
            <div className="role-desc">I need blood for someone</div>
          </button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Min 12 characters"
                minLength={12}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                minLength={12}
                value={form.confirmPassword}
                onChange={handleChange}
                className="form-control"
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Creating account...' : (
              <><FaUserPlus /> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
