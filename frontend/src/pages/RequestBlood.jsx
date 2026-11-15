import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CSN_HOSPITALS = [
  'Government Medical College & Hospital (GMCH)', 'Kamalnayan Bajaj Hospital',
  'Birla Hospital', 'Aurangabad Civil Hospital', 'MGM Hospital',
  'Yashwantrao Chavan Memorial Hospital', 'Smt. Jawaharbai Hospital',
  'Al-Ameen Hospital', 'Kulkarni Hospital', 'Other'
];

export default function RequestBlood() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    requesterName: user?.name || '',
    requesterPhone: '',
    requesterEmail: user?.email || '',
    bloodGroup: '',
    unitsNeeded: 1,
    urgency: 'Normal',
    hospital: '',
    area: '',
    patientName: '',
    reason: '',
    neededBy: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bloodGroup || !form.hospital || !form.requesterPhone) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/requests', form);
      setSubmitted(true);
      toast.success('🩸 Blood request submitted! Available donors will be notified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ marginBottom: '12px' }}>Request Submitted!</h2>
          <p style={{ color: 'var(--white-60)', marginBottom: '8px' }}>
            Your blood request for <strong style={{ color: 'var(--red-light)' }}>{form.bloodGroup}</strong> has been submitted.
          </p>
          <p style={{ color: 'var(--white-60)', marginBottom: '28px' }}>
            Available donors in Chhatrapati Sambhaji Nagar will be notified. 
            Please keep your phone accessible.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/find-donor'}>Find Donor Now</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>🚨 Request Blood</h1>
          <p>Submit a blood requirement and reach all available donors instantly</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          {/* Urgency Banner */}
          <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'rgba(192,57,43,0.15)', borderRadius: '12px', border: '1px solid rgba(192,57,43,0.4)', fontSize: '0.9rem', color: 'var(--white-80)' }}>
            🚑 <strong>Emergency?</strong> Call <strong style={{ color: 'var(--red-light)' }}>108</strong> immediately. This form helps connect with voluntary donors.
          </div>

          <div className="glass-card" style={{ padding: '40px' }}>
            <h2 style={{ marginBottom: '28px', fontWeight: 800 }}>Blood Request Form</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input name="requesterName" value={form.requesterName} onChange={handleChange}
                    className="form-control" placeholder="Contact person name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
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
                  <label className="form-label">Blood Group Required *</label>
                  <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="form-control" required>
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hospital / Location *</label>
                <select name="hospital" value={form.hospital} onChange={handleChange} className="form-control" required>
                  <option value="">Select Hospital</option>
                  {CSN_HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Units Required</label>
                  <input name="unitsNeeded" type="number" min="1" max="10" value={form.unitsNeeded}
                    onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Needed By</label>
                  <input name="neededBy" type="date" value={form.neededBy}
                    onChange={handleChange} className="form-control" />
                </div>
              </div>

              {/* Urgency */}
              <div className="form-group">
                <label className="form-label">Urgency Level *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Normal', 'Urgent', 'Critical'].map((u) => (
                    <label key={u} style={{ cursor: 'pointer', flex: 1 }}>
                      <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={handleChange} hidden />
                      <div style={{
                        padding: '14px 10px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${form.urgency === u ? (u === 'Critical' ? 'var(--red-primary)' : u === 'Urgent' ? 'var(--gold)' : '#27AE60') : 'var(--glass-border)'}`,
                        background: form.urgency === u ? (u === 'Critical' ? 'rgba(192,57,43,0.15)' : u === 'Urgent' ? 'rgba(243,156,18,0.1)' : 'rgba(39,174,96,0.1)') : 'transparent',
                        fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                        color: form.urgency === u ? 'white' : 'var(--white-60)',
                      }}>
                        {u === 'Critical' ? '🚨' : u === 'Urgent' ? '⚠️' : '✅'}<br />{u}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea name="reason" value={form.reason} onChange={handleChange}
                  className="form-control" rows={3} placeholder="Describe the situation, surgery type, diagnosis, etc." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '16px' }} disabled={loading}>
                {loading ? '⏳ Submitting Request...' : '🩸 Submit Blood Request'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
