import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { FaUser, FaTint, FaClipboardList, FaToggleOn, FaSignOutAlt, FaEdit } from 'react-icons/fa';

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [donor, setDonor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setDonor(null);
    setRequests([]);
    try {
      if (user.role === 'donor') {
        const { data } = await axiosInstance.get('/donors/me');
        setDonor(data);
        setEditForm(data);
        updateUser({ name: data.name, email: data.email || user.email });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load your donor profile');
      }
    }

    try {
      const { data: reqs } = await axiosInstance.get('/requests/my');
      setRequests(reqs);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await axiosInstance.patch('/donors/me/availability');
      setDonor({ ...donor, isAvailable: data.isAvailable });
      toast.success(data.isAvailable ? '✅ You are now available to donate!' : '⏸️ You are marked as unavailable');
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.put('/donors/me', editForm);
      setDonor(data);
      updateUser({ name: data.name, email: data.email || user.email });
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div className="dashboard-name">{user.name}</div>
            <div className="dashboard-role">
              {user.role === 'donor' ? '🩸 Blood Donor' : '🔍 Blood Seeker'} · Chhatrapati Sambhaji Nagar
            </div>
            {donor && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="blood-badge" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>{donor.bloodGroup}</span>
                <span style={{ color: 'var(--white-60)', fontSize: '0.9rem' }}>{donor.area}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {donor && (
              <button onClick={toggleAvailability} className={`btn btn-sm ${donor.isAvailable ? 'btn-secondary' : 'btn-primary'}`}>
                <FaToggleOn /> {donor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            )}
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary btn-sm">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {donor && (
          <div className="dashboard-grid">
            <div className="stat-mini">
              <div className="num">{donor.totalDonations || 0}</div>
              <div className="lbl">Total Donations</div>
            </div>
            <div className="stat-mini">
              <div className="num" style={{ fontSize: '1.4rem', color: donor.isAvailable ? '#27AE60' : 'var(--red-light)' }}>
                {donor.isAvailable ? '✅ Active' : '⏸️ Paused'}
              </div>
              <div className="lbl">Availability Status</div>
            </div>
            <div className="stat-mini">
              <div className="num">{requests.length}</div>
              <div className="lbl">Blood Requests</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button className={`dashboard-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            <FaUser style={{ marginRight: 6 }} /> Profile
          </button>
          <button className={`dashboard-tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
            <FaClipboardList style={{ marginRight: 6 }} /> My Requests ({requests.length})
          </button>
          {!donor && user.role === 'donor' && (
            <button className={`dashboard-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => navigate('/register-donor')}>
              🩸 Complete Donor Profile
            </button>
          )}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : tab === 'profile' ? (
          <div className="glass-card" style={{ padding: '36px' }}>
            {!donor && user.role === 'donor' ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>No Donor Profile Yet</h3>
                <p>Register as a donor to appear in search results and save lives!</p>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/register-donor')}>
                  🩸 Register as Donor
                </button>
              </div>
            ) : !donor ? (
              <div>
                <h3 style={{ marginBottom: '24px', fontWeight: 800 }}>Account Profile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {[
                    { label: 'Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Account Type', value: 'Blood Seeker' },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: '16px', background: 'var(--white-10)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--white-60)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/find-donor')}>
                  <FaTint /> Find a Donor
                </button>
              </div>
            ) : editing ? (
              <form onSubmit={handleEditSave}>
                <h3 style={{ marginBottom: '24px', fontWeight: 800 }}>Edit Profile</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input name="name" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="form-control" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input type="number" value={editForm.weight || ''} onChange={(e) => setEditForm({...editForm, weight: e.target.value})} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Donations</label>
                    <input type="number" value={editForm.totalDonations || 0} onChange={(e) => setEditForm({...editForm, totalDonations: e.target.value})} className="form-control" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Conditions</label>
                  <textarea value={editForm.medicalConditions || ''} onChange={(e) => setEditForm({...editForm, medicalConditions: e.target.value})} className="form-control" rows={2} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <h3 style={{ fontWeight: 800 }}>Donor Profile</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                    <FaEdit /> Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {[
                    { label: 'Name', value: donor.name },
                    { label: 'Blood Group', value: donor.bloodGroup, highlight: true },
                    { label: 'Age', value: `${donor.age} years` },
                    { label: 'Gender', value: donor.gender },
                    { label: 'Phone', value: donor.phone },
                    { label: 'Area', value: donor.area },
                    { label: 'Weight', value: donor.weight ? `${donor.weight} kg` : 'N/A' },
                    { label: 'Total Donations', value: donor.totalDonations || 0 },
                    { label: 'Last Donation', value: donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString('en-IN') : 'N/A' },
                    { label: 'Medical Conditions', value: donor.medicalConditions || 'None' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--white-10)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--white-60)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontWeight: 600, color: item.highlight ? 'var(--red-light)' : 'white', fontSize: '1rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>No requests yet</h3>
                <p>Your blood requests will appear here</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="request-card">
                  <div className="request-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="blood-badge" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }}>{req.bloodGroup}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{req.patientName || req.requesterName}</div>
                        <div style={{ color: 'var(--white-60)', fontSize: '0.8rem' }}>{req.hospital}</div>
                      </div>
                    </div>
                    <span className={`urgency-badge urgency-${req.urgency}`}>{req.urgency}</span>
                  </div>
                  <div className="request-info">
                    <div className="request-info-item"><strong>Units:</strong> {req.unitsNeeded}</div>
                    <div className="request-info-item"><strong>Area:</strong> {req.area}</div>
                    <div className="request-info-item"><strong>Status:</strong> {req.status}</div>
                    <div className="request-info-item"><strong>Date:</strong> {new Date(req.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
