import { useState } from 'react';
import { FaTimes, FaTint, FaPhone, FaHospital, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function RequestModal({ donor, onClose }) {
  const [form, setForm] = useState({
    requesterName: '',
    requesterPhone: '',
    requesterEmail: '',
    bloodGroup: donor?.bloodGroup || '',
    unitsNeeded: 1,
    urgency: 'Normal',
    hospital: '',
    area: donor?.area || '',
    patientName: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.requesterName || !form.requesterPhone || !form.hospital) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/requests', form);
      toast.success('🩸 Blood request submitted successfully! Donor will contact you.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <FaTint style={{ color: 'var(--red-primary)', marginRight: 8 }} />
            Request Blood from {donor?.name}
          </div>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(192,57,43,0.1)', borderRadius: '8px', border: '1px solid rgba(192,57,43,0.3)', fontSize: '0.875rem', color: 'var(--white-80)' }}>
          <strong>Donor:</strong> {donor?.name} · Blood Group: <span className="badge badge-red">{donor?.bloodGroup}</span> · {donor?.area}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input name="requesterName" value={form.requesterName} onChange={handleChange}
                className="form-control" placeholder="Full name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input name="requesterPhone" value={form.requesterPhone} onChange={handleChange}
                className="form-control" placeholder="+91 XXXXX XXXXX" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Patient Name</label>
              <input name="patientName" value={form.patientName} onChange={handleChange}
                className="form-control" placeholder="Patient's name" />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="form-control">
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hospital / Location *</label>
              <input name="hospital" value={form.hospital} onChange={handleChange}
                className="form-control" placeholder="Hospital name & area" required />
            </div>
            <div className="form-group">
              <label className="form-label">Units Needed</label>
              <input name="unitsNeeded" type="number" min="1" max="10" value={form.unitsNeeded}
                onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Urgency Level</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Normal', 'Urgent', 'Critical'].map((u) => (
                <label key={u} style={{ cursor: 'pointer', flex: 1 }}>
                  <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={handleChange} hidden />
                  <div style={{
                    padding: '10px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: `2px solid ${form.urgency === u ? (u === 'Critical' ? 'var(--red-primary)' : u === 'Urgent' ? 'var(--gold)' : '#27AE60') : 'var(--glass-border)'}`,
                    background: form.urgency === u ? 'rgba(192,57,43,0.1)' : 'transparent',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    color: form.urgency === u ? 'white' : 'var(--white-60)',
                  }}>
                    {u === 'Critical' ? '🚨' : u === 'Urgent' ? '⚠️' : '✅'} {u}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Additional Info</label>
            <textarea name="reason" value={form.reason} onChange={handleChange}
              className="form-control" rows={3} placeholder="Brief description of the situation..." />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Submitting...' : '🩸 Submit Blood Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
