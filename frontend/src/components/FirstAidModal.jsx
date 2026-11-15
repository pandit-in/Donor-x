import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaHeartbeat, 
  FaAmbulance, 
  FaPhoneAlt, 
  FaPlay, 
  FaPause, 
  FaRedo,
  FaShieldAlt
} from 'react-icons/fa';
import { playMetronomeClick } from '../utils/sound';

export default function FirstAidModal({ isOpen, onClose }) {
  const [cprActive, setCprActive] = useState(false);
  const [compressions, setCompressions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (cprActive) {
      // 105 BPM = 60000 / 105 ≈ 571 ms
      intervalRef.current = setInterval(() => {
        setCompressions((prev) => {
          const next = (prev % 30) + 1;
          if (soundEnabled) {
            playMetronomeClick(true);
          }
          return next;
        });
      }, 571);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cprActive, soundEnabled]);

  const handleClose = () => {
    setCprActive(false);
    setCompressions(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="modal-title-sos">
            <FaHeartbeat style={{ color: '#ef233c' }} /> Emergency First Aid &amp; CPR Audio Metronome
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Emergency Hotlines Row */}
          <div className="emergency-hotlines-strip">
            <a href="tel:108" className="hotline-pill hotline-pill--ambulance">
              <FaAmbulance /> 108 Emergency Ambulance (Toll-Free)
            </a>
            <a href="tel:104" className="hotline-pill hotline-pill--blood">
              <FaPhoneAlt /> 104 National Blood Helpline
            </a>
            <a href="tel:112" className="hotline-pill hotline-pill--police">
              <FaShieldAlt /> 112 National Unified Emergency
            </a>
          </div>

          {/* Golden Hour Banner */}
          <div style={{ background: 'rgba(239, 35, 60, 0.1)', border: '1px solid rgba(239, 35, 60, 0.3)', padding: 14, borderRadius: 10 }}>
            <h4 style={{ color: '#ff6b7e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaAmbulance /> Golden Hour Rule (Chhatrapati Sambhajinagar)
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
              The first 60 minutes after severe trauma or acute blood loss are decisive. Immediately call <b>108</b> (State Ambulance) or <b>104</b> (Blood Bank Desk) and apply uninterrupted direct pressure.
            </p>
          </div>

          {/* CPR Metronome Interactive Widget */}
          <div className="cpr-metronome-card">
            <div className="cpr-header">
              <div>
                <h4 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaHeartbeat className={`cpr-heart-icon ${cprActive ? 'pulsing' : ''}`} />
                  Hands-Only CPR Rhythm Trainer (105 BPM)
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  AHA standard chest compression rate: 100 to 120 compressions per minute (Rhythm of &ldquo;Stayin&rsquo; Alive&rdquo;)
                </span>
              </div>
            </div>

            <div className="cpr-display-area">
              <div className="cpr-counter-circle">
                <span className="cpr-number">{compressions || '0'}</span>
                <span className="cpr-unit">{compressions === 30 ? 'GIVE 2 BREATHS!' : 'COMPRESSION'}</span>
              </div>

              <div className="cpr-controls">
                <button
                  type="button"
                  className={`btn-cpr-toggle ${cprActive ? 'active' : ''}`}
                  onClick={() => setCprActive(!cprActive)}
                >
                  {cprActive ? <><FaPause /> Stop Metronome</> : <><FaPlay /> Start CPR Beat (105 BPM)</>}
                </button>

                <button
                  type="button"
                  className="btn-cpr-reset"
                  onClick={() => {
                    setCompressions(0);
                    setCprActive(false);
                  }}
                  title="Reset counter"
                >
                  <FaRedo /> Reset
                </button>

                <label className="cpr-sound-toggle">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                  />
                  <span>Audio Click</span>
                </label>
              </div>
            </div>
          </div>

          {/* First Aid Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <b style={{ color: '#fff', fontSize: '0.9rem' }}>1. Uncontrolled Bleeding &amp; Elevation</b>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Place a sterile cloth or clean bandage firmly over the bleeding wound. Maintain uninterrupted pressure for at least 10 minutes without lifting to check.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <b style={{ color: '#fff', fontSize: '0.9rem' }}>2. Tourniquet Usage (Arterial Limb Bleed)</b>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                If severe bleeding from an arm or leg does not stop with direct pressure, apply a commercial or improvised tourniquet 2-3 inches above the wound (never over a joint). Record the exact application time.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <b style={{ color: '#fff', fontSize: '0.9rem' }}>3. Preventing Hypothermia &amp; Traumatic Shock</b>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Keep the patient warm with blankets. Lay them flat and elevate legs 12 inches unless head/neck trauma is suspected. Never administer oral liquids before emergency surgery.
              </p>
            </div>
          </div>

          <button 
            type="button"
            className="btn-header-sos" 
            style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 14 }}
            onClick={handleClose}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
