import React, { useState } from 'react';
import { FaTimes, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { CHH_SAMBHAJINAGAR_AREAS } from '../data/mockData';

export default function SurveyFormModal({ isOpen, onClose, onCompleteSurvey }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [area, setArea] = useState('Cidco N-1 to N-12');
  const [willingToOnCall, setWillingToOnCall] = useState('Yes, 24x7 emergency');
  const [hadDelayExperience, setHadDelayExperience] = useState('Yes, severe difficulty finding blood');
  const [consentToContact, setConsentToContact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const saved = await onCompleteSurvey({
      name,
      phone: consentToContact ? phone : '',
      bloodGroup,
      area,
      willingness: willingToOnCall.startsWith('Yes') ? 'anytime' : willingToOnCall.startsWith('Daytime') ? 'daytime' : 'weekends',
      delayExperience: hadDelayExperience.startsWith('Yes') ? 'severe' : hadDelayExperience.startsWith('Moderate') ? 'moderate' : 'none',
      consentToContact,
    });
    if (!saved) setError('Could not save your survey response. Please try again.');
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="modal-title-sos">
            <FaClipboardList /> Voluntary Donor Survey — Chh. Sambhajinagar
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Help our local medical task force quantify transfusion delays and expand emergency on-call volunteer coverage in Chhatrapati Sambhajinagar.
          </p>

          <div className="modal-form-grid">
            <div className="form-group-full">
              <label className="modal-label">Your Name (optional)</label>
              <input 
                type="text"
                className="modal-input"
                placeholder="e.g. Pooja Deshmukh"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="modal-label">WhatsApp Number (optional)</label>
              <input 
                type="tel"
                className="modal-input"
                placeholder="e.g. 98220 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

            <div className="form-group-full">
              <label className="modal-label">Your Area / Ward in Chh. Sambhajinagar *</label>
              <select 
                className="modal-select"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                {CHH_SAMBHAJINAGAR_AREAS.filter(a => a !== 'All Areas').map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="form-group-full">
              <label className="modal-label">Have you or family experienced emergency blood shortage?</label>
              <select 
                className="modal-select"
                value={hadDelayExperience}
                onChange={(e) => setHadDelayExperience(e.target.value)}
              >
                <option value="Yes, severe difficulty finding blood">Yes, severe delay (&gt; 4 hours)</option>
                <option value="Moderate delay during night hours">Moderate delay during night hours</option>
                <option value="No, got blood in time">No, got blood in time</option>
              </select>
            </div>

            <div className="form-group-full">
              <label className="modal-label">Are you willing to be listed on-call for emergency hospital SOS calls?</label>
              <select 
                className="modal-select"
                value={willingToOnCall}
                onChange={(e) => setWillingToOnCall(e.target.value)}
              >
                <option value="Yes, 24x7 emergency">Any time</option>
                <option value="Daytime only (8 AM - 8 PM)">Daytime only</option>
                <option value="Weekends only">Weekends only</option>
              </select>
            </div>
          </div>

          <label className="consent-row">
            <input type="checkbox" checked={consentToContact} onChange={(event) => setConsentToContact(event.target.checked)} />
            <span>Allow DonorX administrators to contact me about this survey. My name and phone number are stored only if I consent.</span>
          </label>
          {error && <div role="alert" className="auth-error">{error}</div>}
          <button type="submit" className="btn-drive-open" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            <FaCheckCircle /> {loading ? 'Saving…' : 'Submit Survey'}
          </button>
        </form>
      </div>
    </div>
  );
}
