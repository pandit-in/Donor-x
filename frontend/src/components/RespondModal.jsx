import React, { useState } from 'react';
import { FaTimes, FaHeart, FaCheckCircle } from 'react-icons/fa';

export default function RespondModal({ isOpen, onClose, sosRequest, currentDonor, onConfirmResponse }) {
  const [eta, setEta] = useState('10-15 mins');

  if (!isOpen || !sosRequest) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirmResponse({
      sosId: sosRequest.id,
      eta,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #b8001f 0%, #ef233c 100%)' }}>
          <div className="modal-title-sos">
            <FaHeart /> Respond to Emergency Blood Request
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleConfirm}>
          <div style={{ background: 'rgba(239,35,60,0.12)', border: '1px solid rgba(239,35,60,0.3)', padding: 14, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                Required: [{sosRequest.bloodGroup}] Blood
              </span>
              <span style={{ color: '#ff6b7e', fontWeight: 700, fontSize: '0.8rem' }}>
                {sosRequest.urgency}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600 }}>
              📍 {sosRequest.hospital}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
              Listed area: {sosRequest.area}
            </div>
          </div>

          <div className="modal-form-grid">
            <div className="form-group-full">
              <label className="modal-label">Responding Donor</label>
              <input 
                type="text" 
                disabled 
                className="modal-input" 
                value={`${currentDonor.name} (${currentDonor.bloodGroup}) — ID: ${currentDonor.donorId}`} 
                style={{ opacity: 0.85 }}
              />
            </div>

            <div>
              <label className="modal-label">Your Estimated Arrival Time (ETA) *</label>
              <select 
                className="modal-select" 
                value={eta} 
                onChange={(e) => setEta(e.target.value)}
              >
                <option value="10-15 mins">&lt; 15 mins (Immediate)</option>
                <option value="20-30 mins">20 - 30 mins</option>
                <option value="45 mins">45 mins</option>
                <option value="1 hour">Within 1 hour</option>
              </select>
            </div>

          </div>

          <button type="submit" className="btn-trigger-broadcast">
            <FaCheckCircle /> Submit Donor Response
          </button>
        </form>
      </div>
    </div>
  );
}
