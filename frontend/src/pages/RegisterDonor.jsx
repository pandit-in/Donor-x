import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CSN_AREAS = [
  'Cidco', 'Garkheda', 'N-1', 'N-2', 'N-3', 'N-4', 'N-5', 'N-6', 'N-7', 'N-8', 'N-9', 'N-10',
  'N-11', 'N-12', 'Pundliknagar', 'Aurangpura', 'Osmanpura', 'Padegaon', 'Waluj', 'Harsul',
  'Mukundwadi', 'Cantonment', 'Satara', 'Nirala Bazar', 'TV Center', 'Jalna Road', 'Chikalthana',
  'MIT College Road', 'Kranti Chowk', 'Usmanpura'
];

export default function RegisterDonor() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    bloodGroup: '',
    age: '',
    gender: '',
    phone: '',
    email: user?.email || '',
    area: '',
    ward: '',
    address: '',
    lastDonation: '',
    totalDonations: 0,
    weight: '',
    medicalConditions: 'None',
    isAvailable: true,
  });

  if (!user) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔐</div>
          <h2 style={{ marginBottom: '12px' }}>Login Required</h2>
          <p style={{ color: 'var(--white-60)', marginBottom: '24px' }}>
            Please sign in or create an account to register as a donor.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photo) formData.append('profilePhoto', photo);
      const { data } = await axiosInstance.post('/donors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ name: data.name, email: data.email || user.email, role: 'donor' });
      toast.success('🎉 Donor profile created! You are now a registered donor!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>🩸 Become a Donor</h1>
          <p>Join our lifesaving community in Chhatrapati Sambhaji Nagar</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          {/* Step Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: step >= s ? 'var(--red-primary)' : 'var(--glass-bg)',
                  border: `2px solid ${step >= s ? 'var(--red-primary)' : 'var(--glass-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem',
                  transition: 'all 0.3s',
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: '0.8rem', color: step >= s ? 'white' : 'var(--white-60)', display: s === 3 ? 'block' : '' }}>
                  {s === 1 ? 'Personal Info' : s === 2 ? 'Medical Info' : 'Profile Photo'}
                </span>
                {s < 3 && <div style={{ width: '40px', height: '2px', background: step > s ? 'var(--red-primary)' : 'var(--glass-border)' }} />}
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '40px' }}>
            <form onSubmit={handleSubmit}>
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <h2 style={{ marginBottom: '28px', fontWeight: 800 }}>Personal Information</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input name="name" value={form.name} onChange={handleChange}
                        className="form-control" placeholder="Your full name" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Blood Group *</label>
                      <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="form-control" required>
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Age *</label>
                      <input name="age" type="number" min="18" max="65" value={form.age}
                        onChange={handleChange} className="form-control" placeholder="18-65" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender *</label>
                      <select name="gender" value={form.gender} onChange={handleChange} className="form-control" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        className="form-control" placeholder="+91 XXXXX XXXXX" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className="form-control" placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Area / Locality *</label>
                      <select name="area" value={form.area} onChange={handleChange} className="form-control" required>
                        <option value="">Select Area</option>
                        {CSN_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ward / Sector</label>
                      <input name="ward" value={form.ward} onChange={handleChange}
                        className="form-control" placeholder="e.g. Ward 12" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Address</label>
                    <input name="address" value={form.address} onChange={handleChange}
                      className="form-control" placeholder="House no, Street, Landmark..." />
                  </div>

                  <button type="button" className="btn btn-primary" style={{ width: '100%' }}
                    onClick={() => {
                      if (!form.name || !form.bloodGroup || !form.age || !form.gender || !form.phone || !form.area) {
                        toast.error('Please fill all required fields');
                        return;
                      }
                      setStep(2);
                    }}>
                    Next: Medical Info →
                  </button>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <h2 style={{ marginBottom: '28px', fontWeight: 800 }}>Medical Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input name="weight" type="number" min="45" value={form.weight}
                        onChange={handleChange} className="form-control" placeholder="Min 45 kg" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Donation Date</label>
                      <input name="lastDonation" type="date" value={form.lastDonation}
                        onChange={handleChange} className="form-control" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Donations So Far</label>
                    <input name="totalDonations" type="number" min="0" value={form.totalDonations}
                      onChange={handleChange} className="form-control" placeholder="0" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Medical Conditions (if any)</label>
                    <textarea name="medicalConditions" value={form.medicalConditions}
                      onChange={handleChange} className="form-control" rows={3}
                      placeholder="None / List any relevant conditions" />
                  </div>

                  <div className="form-group">
                    <label className="toggle-wrapper" style={{ cursor: 'pointer' }}>
                      <label className="toggle">
                        <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
                        <span className="toggle-slider" />
                      </label>
                      <div>
                        <div style={{ fontWeight: 600 }}>Available to donate now?</div>
                        <div style={{ color: 'var(--white-60)', fontSize: '0.8rem' }}>
                          You can change this anytime from your dashboard
                        </div>
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                      ← Back
                    </button>
                    <button type="button" className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>
                      Next: Profile Photo →
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <h2 style={{ marginBottom: '28px', fontWeight: 800 }}>Profile Photo</h2>

                  <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                      width: '120px', height: '120px', borderRadius: '50%',
                      background: 'var(--glass-bg)', border: '3px dashed var(--glass-border)',
                      margin: '0 auto 16px', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '3rem',
                    }}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : '📷'}
                    </div>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Choose Photo
                      <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                    </label>
                    <p style={{ color: 'var(--white-60)', fontSize: '0.8rem', marginTop: '8px' }}>
                      Optional — Max 5MB, JPEG/PNG/GIF
                    </p>
                  </div>

                  <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid #27AE60', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', color: '#2ecc71' }}>✅ Ready to Submit!</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--white-60)' }}>
                      <div>Name: <strong style={{ color: 'white' }}>{form.name}</strong></div>
                      <div>Blood Group: <strong style={{ color: 'var(--red-light)' }}>{form.bloodGroup}</strong></div>
                      <div>Area: <strong style={{ color: 'white' }}>{form.area}</strong>, Chh. Sambhaji Nagar</div>
                      <div>Available: <strong style={{ color: form.isAvailable ? '#27AE60' : 'var(--red-light)' }}>{form.isAvailable ? 'Yes' : 'No'}</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                      ← Back
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                      {loading ? '⏳ Registering...' : '🩸 Complete Registration'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
