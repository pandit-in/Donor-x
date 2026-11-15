import React, { useState } from 'react';
import { 
  FaTimes, 
  FaSignInAlt, 
  FaUserPlus, 
  FaTint, 
  FaEye, 
  FaEyeSlash,
  FaMapMarkerAlt,
  FaPhoneAlt
} from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { CHH_SAMBHAJINAGAR_AREAS } from '../data/mockData';

export default function AuthModal({ 
  isOpen, 
  initialMode = 'login', 
  initialRole = 'seeker', 
  onClose, 
  onAuthenticated 
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: 'O+',
    area: 'Cidco N-1 to N-12',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!form.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }
      if (form.password.length < 12) {
        setError('Password must be at least 12 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const { data } = mode === 'signup'
        ? await axiosInstance.post('/auth/register', {
            name: form.name,
            email: form.email,
            password: form.password,
            role,
            bloodGroup: form.bloodGroup,
            area: form.area,
            phone: form.phone,
          })
        : await axiosInstance.post('/auth/login', {
            email: form.email,
            password: form.password,
          });

      onAuthenticated(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || 'Unable to reach the authentication service. Check the backend and database connection, then try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const areasList = CHH_SAMBHAJINAGAR_AREAS.filter((a) => a !== 'All Areas');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog auth-modal-dialog" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="auth-title" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-sos">
          <div className="modal-title-sos" id="auth-title">
            {mode === 'signup' ? <FaUserPlus style={{ color: '#10b981' }} /> : <FaSignInAlt style={{ color: '#ef233c' }} />}
            {mode === 'signup' ? 'Create Your Account' : 'Sign In to DonorX'}
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-switch-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            <FaSignInAlt /> Sign In
          </button>
          <button
            type="button"
            className={`auth-switch-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            <FaUserPlus /> Create Account (Sign Up)
          </button>
        </div>

        <form className="modal-body auth-modal-body" onSubmit={handleSubmit}>
          {error && <div role="alert" className="auth-error">{error}</div>}

          {mode === 'signup' && (
            <>
              <div className="form-group-auth">
                <label className="modal-label" htmlFor="auth-name">Full Name *</label>
                <input
                  id="auth-name"
                  className="modal-input"
                  autoComplete="name"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group-auth">
                <label className="modal-label" htmlFor="auth-role">Account Type *</label>
                <select 
                  id="auth-role" 
                  className="modal-select" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="donor">Voluntary Blood Donor (Ready to donate &amp; save lives)</option>
                  <option value="seeker">Blood Seeker / Patient Family (Searching for blood units)</option>
                </select>
              </div>

              {role === 'donor' && (
                <div className="donor-signup-grid">
                  <div className="form-group-auth">
                    <label className="modal-label" htmlFor="auth-bg">
                      <FaTint style={{ color: '#ef233c' }} /> Blood Group *
                    </label>
                    <select
                      id="auth-bg"
                      className="modal-select"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-auth">
                    <label className="modal-label" htmlFor="auth-phone">
                      <FaPhoneAlt style={{ color: '#10b981' }} /> Mobile Number
                    </label>
                    <input
                      id="auth-phone"
                      className="modal-input"
                      type="tel"
                      placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group-auth full-width-field">
                    <label className="modal-label" htmlFor="auth-area">
                      <FaMapMarkerAlt style={{ color: '#38bdf8' }} /> Location / Area in Chh. Sambhajinagar
                    </label>
                    <select
                      id="auth-area"
                      className="modal-select"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                    >
                      {areasList.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group-auth">
            <label className="modal-label" htmlFor="auth-email">Email Address *</label>
            <input
              id="auth-email"
              className="modal-input"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group-auth">
            <label className="modal-label" htmlFor="auth-password">Password *</label>
            <div className="password-input-wrap">
              <input
                id="auth-password"
                className="modal-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 12 : undefined}
                required
                placeholder="At least 12 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group-auth">
              <label className="modal-label" htmlFor="auth-confirm">Confirm Password *</label>
              <input
                id="auth-confirm"
                className="modal-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-trigger-broadcast" 
            disabled={loading} 
            style={{ marginTop: 14 }}
          >
            {loading ? 'Authenticating…' : (mode === 'signup' ? 'Complete Sign Up & Continue' : 'Sign In to Account')}
          </button>

          <div className="auth-footer-switch">
            {mode === 'signup' ? (
              <span>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="inline-link-btn" 
                  onClick={() => { setMode('login'); setError(''); }}
                >
                  Sign in here
                </button>
              </span>
            ) : (
              <span>
                New to DonorX?{' '}
                <button 
                  type="button" 
                  className="inline-link-btn" 
                  onClick={() => { setMode('signup'); setError(''); }}
                >
                  Create a new account
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
