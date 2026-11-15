import React, { useState } from 'react';
import { FaTimes, FaUserPlus, FaCheckCircle } from 'react-icons/fa';
import { CHH_SAMBHAJINAGAR_AREAS } from '../data/mockData';
import axiosInstance from '../api/axios';

const DEFAULT_DONOR_AREA = CHH_SAMBHAJINAGAR_AREAS.find((locality) => locality !== 'All Areas');
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const MAX_LAST_DONATION = today.toISOString().slice(0, 10);

export default function RegisterDonorModal({ isOpen, user, existingDonor, onClose, onRegisterSuccess }) {
  const [name, setName] = useState(existingDonor?.name || user?.name || '');
  const [bloodGroup, setBloodGroup] = useState(existingDonor?.bloodGroup || 'O+');
  const [age, setAge] = useState(existingDonor?.age || 22);
  const [gender, setGender] = useState(existingDonor?.gender || 'Female');
  const [weight, setWeight] = useState(existingDonor?.weight || 55);
  const [area, setArea] = useState(existingDonor?.area || DEFAULT_DONOR_AREA);
  const [phone, setPhone] = useState(existingDonor?.phone || '');
  const [bio, setBio] = useState(existingDonor?.bio || '');
  const [lastDonation, setLastDonation] = useState(existingDonor?.lastDonation ? new Date(existingDonor.lastDonation).toISOString().slice(0, 10) : '');
  const [medicalConditions, setMedicalConditions] = useState(existingDonor?.medicalConditions || '');
  const [shareContact, setShareContact] = useState(existingDonor?.shareContact || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: name.trim() || user.name,
        email: user.email,
        bloodGroup,
        age: Number(age),
        gender,
        weight: Number(weight),
        area,
        phone: phone.trim(),
        bio: bio.trim(),
        lastDonation: lastDonation || null,
        medicalConditions: medicalConditions.trim() || 'None reported',
        shareContact,
        isAvailable: existingDonor?.isAvailable ?? true,
        availabilityStatus: existingDonor?.availabilityStatus || existingDonor?.status || 'Available',
      };
      const { data } = existingDonor
        ? await axiosInstance.put('/donors/me', payload)
        : await axiosInstance.post('/donors', payload);
      onRegisterSuccess(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save donor profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)' }}>
          <div className="modal-title-sos">
            <FaUserPlus style={{ color: '#ef233c' }} />
            {existingDonor ? 'Update Donor Profile — DonorX' : 'Register as Voluntary Donor — DonorX'}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            <div className="form-group-full">
              <label className="modal-label">Full Name *</label>
              <input 
                type="text"
                required
                maxLength={100}
                className="modal-input"
                placeholder="e.g. Rohini Gaikwad"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Blood Group *</label>
              <select 
                className="modal-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="modal-label">Emergency Phone Number *</label>
              <input 
                type="tel"
                required
                minLength={10}
                maxLength={16}
                className="modal-input"
                placeholder="e.g. 98220 54321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Age (18-65) *</label>
              <input 
                type="number"
                min="18"
                max="65"
                required
                className="modal-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Gender *</label>
              <select 
                className="modal-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="modal-label">Weight (kg) *</label>
              <input 
                type="number"
                min="45"
                max="150"
                required
                className="modal-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">Area / Locality in Sambhajinagar *</label>
              <select 
                className="modal-select"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                {existingDonor?.area && !CHH_SAMBHAJINAGAR_AREAS.includes(existingDonor.area) && (
                  <option value={existingDonor.area}>{existingDonor.area}</option>
                )}
                {CHH_SAMBHAJINAGAR_AREAS.filter(a => a !== 'All Areas').map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="modal-label">Last blood donation (optional)</label>
              <input
                type="date"
                className="modal-input"
                max={MAX_LAST_DONATION}
                value={lastDonation}
                onChange={(event) => setLastDonation(event.target.value)}
              />
            </div>

            <div className="form-group-full">
              <label className="modal-label">Personal Statement / Donor Bio</label>
              <textarea 
                className="modal-textarea"
                rows="2"
                maxLength={500}
                placeholder="e.g. Student near Ghati Hospital. Ready to donate in emergency hours."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="form-group-full">
              <label className="modal-label">Health notes (optional; visible only to you and administrators)</label>
              <textarea
                className="modal-textarea"
                rows="2"
                maxLength={500}
                placeholder="Share relevant information for your own records; the hospital makes all eligibility decisions."
                value={medicalConditions}
                onChange={(event) => setMedicalConditions(event.target.value)}
              />
            </div>
            <label className="form-group-full consent-row">
              <input
                type="checkbox"
                checked={shareContact}
                onChange={(event) => setShareContact(event.target.checked)}
              />
              <span>Allow signed-in users to see my phone number and email in donor search. If unchecked, contacts are shared only after I respond to a request when I choose to share them.</span>
            </label>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}
          <button type="submit" className="btn-trigger-broadcast" disabled={loading}>
            <FaCheckCircle /> {loading ? 'Saving profile…' : existingDonor ? 'Save Donor Profile' : 'Complete Registration & Get Donor ID'}
          </button>
        </form>
      </div>
    </div>
  );
}
