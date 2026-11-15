import React, { useState } from 'react';
import { FaFire, FaTimes, FaWhatsapp, FaCopy, FaCheck } from 'react-icons/fa';
import { CHH_SAMBHAJINAGAR_AREAS, COMPATIBILITY_MAP } from '../data/mockData';

const MIN_NEEDED_BY = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function EmergencyBroadcastModal({ isOpen, isSubmitting = false, onClose, onSubmitBroadcast }) {
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [units, setUnits] = useState('2 Units');
  const [urgency, setUrgency] = useState('URGENT (< 4 Hours)');
  const [neededBy, setNeededBy] = useState('');
  const [patientName, setPatientName] = useState('');
  const [hospital, setHospital] = useState('');
  const [area, setArea] = useState('Cidco');
  const [address, setAddress] = useState('');
  const [attendant, setAttendant] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [shareContactWithDonor, setShareContactWithDonor] = useState(true);
  const [copiedAlert, setCopiedAlert] = useState(false);

  if (!isOpen) return null;

  const compatibleGroups = COMPATIBILITY_MAP[bloodGroup] || ['O-'];

  const getWhatsAppMessage = () => {
    return `🚨 *URGENT BLOOD REQUIREMENT — DONORX* 🚨
🩸 *Blood Group:* ${bloodGroup}
📦 *Units Needed:* ${units}
⏱ *Urgency:* ${urgency}
🏥 *Hospital:* ${hospital || 'Hospital in Chh. Sambhajinagar'} (${area})
👤 *Patient:* ${patientName || 'Emergency Patient'}
📞 *Attendant Phone:* ${phone || 'Available via DonorX'}
📍 *Area:* ${area}, Chhatrapati Sambhajinagar
💬 *Notes:* ${notes || 'Immediate transfusion requirement.'}
⚡ Please share this urgent alert in local family & donor groups!`;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBroadcast = {
      bloodGroup,
      unitsNeeded: parseInt(units) || 2,
      urgency,
      neededBy: neededBy || undefined,
      patientName,
      hospital,
      area,
      address,
      attendant,
      phone,
      shareContactWithDonor,
      notes: notes || 'Immediate transfusion requirement',
      timeAgo: 'Just now',
      compatibleGroups,
    };
    onSubmitBroadcast(newBroadcast);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-sos">
          <div>
            <div className="modal-title-sos">
              <FaFire /> Emergency Blood Request
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: 2 }}>
              An administrator reviews each request before compatible donors are notified. Track review status and replies in My Profile.
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body Form */}
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Compatible Donor Groups Line */}
          <div className="compatibility-preview-line">
            Compatible blood groups for this request:{' '}
            <b>{compatibleGroups.join(', ')}</b>
          </div>

          <div className="modal-form-grid">
            {/* Blood Group */}
            <div>
              <label className="modal-label">Blood Group Needed *</label>
              <select 
                className="modal-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Units Needed */}
            <div>
              <label className="modal-label">Units Needed (Bags) *</label>
              <select 
                className="modal-select"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              >
                <option value="1 Unit">1 Unit</option>
                <option value="2 Units">2 Units</option>
                <option value="3 Units">3 Units</option>
                <option value="4 Units">4 Units</option>
                <option value="5+ Units">5+ Units</option>
              </select>
            </div>

            {/* Urgency Level */}
            <div className="form-group-full">
              <label className="modal-label">Urgency Level *</label>
              <select 
                className="modal-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="CRITICAL (< 1 Hour)">CRITICAL (&lt; 1 Hour)</option>
                <option value="URGENT (< 4 Hours)">URGENT (&lt; 4 Hours)</option>
                <option value="SAME DAY">SAME DAY</option>
              </select>
            </div>

            <div className="form-group-full">
              <label className="modal-label">Blood needed by (optional)</label>
              <input
                type="datetime-local"
                className="modal-input"
                min={MIN_NEEDED_BY}
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
              />
            </div>

            {/* Patient Name & Condition */}
            <div className="form-group-full">
              <label className="modal-label">Patient Full Name &amp; Condition *</label>
              <input 
                type="text"
                required
                className="modal-input"
                placeholder="e.g. Ramesh Patil (Post Road Accident / ICU Bed 4)"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            {/* Hospital Name */}
            <div>
              <label className="modal-label">Hospital Name *</label>
              <input 
                type="text"
                required
                className="modal-input"
                placeholder="e.g. Ghati Hospital GMCH / MGM Medical College"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              />
            </div>

            {/* City / District */}
            <div>
              <label className="modal-label">Area / Locality *</label>
              <input 
                type="text"
                required
                className="modal-input"
                list="request-area-options"
                maxLength={100}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <datalist id="request-area-options">
                {CHH_SAMBHAJINAGAR_AREAS.filter((locality) => locality !== 'All Areas').map((locality) => (
                  <option key={locality} value={locality} />
                ))}
              </datalist>
            </div>

            {/* Hospital Address & Ward/Bed */}
            <div className="form-group-full">
              <label className="modal-label">Hospital Address &amp; Ward/Bed No.</label>
              <input 
                type="text"
                className="modal-input"
                placeholder="e.g. Panchakki Road, Jubilee Park Area, 2nd Floor ICU Counter"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Attendant / Coordinator Name */}
            <div>
              <label className="modal-label">Attendant / Coordinator Name</label>
              <input 
                type="text"
                className="modal-input"
                placeholder="e.g. Rahul Sharma (Brother)"
                value={attendant}
                onChange={(e) => setAttendant(e.target.value)}
              />
            </div>

            {/* Emergency Phone Number */}
            <div>
              <label className="modal-label">Emergency Phone Number *</label>
              <input 
                type="tel"
                required
                className="modal-input"
                placeholder="e.g. +91 98201 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Clinical Notes */}
            <div className="form-group-full">
              <label className="modal-label">Clinical Requirement Notes</label>
              <textarea 
                className="modal-textarea"
                rows="2"
                placeholder="e.g. Emergency surgery scheduled. Cross matching sample already drawn at hospital blood bank."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <label className="form-group-full consent-row">
              <input
                type="checkbox"
                checked={shareContactWithDonor}
                onChange={(event) => setShareContactWithDonor(event.target.checked)}
              />
              <span>Share my phone number and hospital address only with the donor who accepts this request.</span>
            </label>
          </div>

          {/* WhatsApp Emergency Alert Share Toolkit */}
          <div className="whatsapp-preview-kit">
            <div className="kit-header">
              <FaWhatsapp style={{ color: '#25D366' }} />
              <span>1-Click Emergency WhatsApp Broadcast Template:</span>
            </div>
            <pre className="kit-preview-text">{getWhatsAppMessage()}</pre>
            <button 
              type="button" 
              className="btn-copy-kit"
              onClick={handleCopyWhatsApp}
            >
              {copiedAlert ? <><FaCheck /> Copied to Clipboard!</> : <><FaCopy /> Copy WhatsApp SOS Message</>}
            </button>
          </div>

          {/* Trigger Broadcast Button */}
          <button type="submit" className="btn-trigger-broadcast" disabled={isSubmitting}>
            <FaFire /> {isSubmitting ? 'Submitting request…' : `Submit Blood Request (${bloodGroup})`}
          </button>
        </form>
      </div>
    </div>
  );
}
