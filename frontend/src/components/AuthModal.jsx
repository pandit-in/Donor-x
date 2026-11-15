import { useState } from 'react';
import { FaTimes, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import axiosInstance from '../api/axios';

export default function AuthModal({ isOpen, initialMode = 'login', initialRole = 'seeker', onClose, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = mode === 'signup'
        ? await axiosInstance.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          role,
        })
        : await axiosInstance.post('/auth/login', {
          email: form.email,
          password: form.password,
        });
      onAuthenticated(data, mode);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header-sos">
          <div className="modal-title-sos" id="auth-title">
            {mode === 'signup' ? <FaUserPlus /> : <FaSignInAlt />}
            {mode === 'signup' ? 'Create your DonorX account' : 'Sign in to DonorX'}
          </div>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div role="alert" className="auth-error">{error}</div>}
          {mode === 'signup' && (
            <>
              <label className="modal-label" htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                className="modal-input"
                autoComplete="name"
                required
                maxLength={100}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <label className="modal-label" htmlFor="auth-role">Account type</label>
              <select id="auth-role" className="modal-select" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="donor">Blood donor</option>
                <option value="seeker">Find a donor</option>
              </select>
            </>
          )}

          <label className="modal-label" htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            className="modal-input"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <label className="modal-label" htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            className="modal-input"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={mode === 'signup' ? 12 : undefined}
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {mode === 'signup' && (
            <>
              <label className="modal-label" htmlFor="auth-confirm-password">Confirm password</label>
              <input
                id="auth-confirm-password"
                className="modal-input"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              />
            </>
          )}
          <button className="btn-trigger-broadcast" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          <button
            className="auth-mode-toggle"
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
            }}
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </form>
      </div>
    </div>
  );
}
