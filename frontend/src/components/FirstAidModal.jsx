import React from 'react';
import { FaTimes, FaHeartbeat, FaAmbulance } from 'react-icons/fa';

export default function FirstAidModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="modal-title-sos">
            <FaHeartbeat style={{ color: '#ef233c' }} /> Emergency First Aid &amp; Hemorrhage Guide
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ background: 'rgba(239, 35, 60, 0.1)', border: '1px solid rgba(239, 35, 60, 0.3)', padding: 14, borderRadius: 10 }}>
            <h4 style={{ color: '#ff6b7e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaAmbulance /> Golden Hour Rule (Chhatrapati Sambhajinagar)
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
              The first 60 minutes after severe trauma or acute blood loss are decisive. Immediately call <b>108</b> (State Ambulance) or <b>104</b> (Blood Bank Desk) and apply direct pressure.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <b style={{ color: '#fff', fontSize: '0.9rem' }}>1. Direct Pressure &amp; Elevation</b>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Place a sterile cloth or clean bandage firmly over the bleeding wound. Maintain uninterrupted pressure for at least 10 minutes without lifting to check.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <b style={{ color: '#fff', fontSize: '0.9rem' }}>2. Tourniquet Usage (Limb Arterial Bleed)</b>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                If bleeding from an arm or leg does not stop with direct pressure, apply a commercial tourniquet 2-3 inches above the wound (never directly over a joint). Note down the application time.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <b style={{ color: '#fff', fontSize: '0.9rem' }}>3. Prevent Hypothermia &amp; Shock</b>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Keep the patient warm with blankets. Lay them flat and elevate legs slightly unless spinal or head injury is suspected. Do not give food or oral liquids prior to emergency surgery.
              </p>
            </div>
          </div>

          <button 
            className="btn-header-sos" 
            style={{ width: '100%', justifyContent: 'center', padding: 12 }}
            onClick={onClose}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
