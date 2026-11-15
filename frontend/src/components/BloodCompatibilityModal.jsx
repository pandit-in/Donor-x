import React, { useState } from 'react';
import { 
  FaTimes, 
  FaHeartbeat, 
  FaExchangeAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle
} from 'react-icons/fa';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// Red Blood Cells Compatibility Matrix
const RBC_COMPATIBILITY = {
  'O-': {
    give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receive: ['O-'],
    rarity: '7% (Universal Red Cell Donor)',
    note: 'O- red cells have neither A, B, nor Rh antigens. Crucial for trauma ICU emergencies.',
  },
  'O+': {
    give: ['O+', 'A+', 'B+', 'AB+'],
    receive: ['O+', 'O-'],
    rarity: '37% (Most Common)',
    note: 'Most requested blood type. Can give to any Rh-positive patient.',
  },
  'A-': {
    give: ['A-', 'A+', 'AB-', 'AB+'],
    receive: ['A-', 'O-'],
    rarity: '6%',
    note: 'Important for platelet and red cell matching for A and AB patients.',
  },
  'A+': {
    give: ['A+', 'AB+'],
    receive: ['A+', 'A-', 'O+', 'O-'],
    rarity: '34%',
    note: 'Second most common group. Extremely valuable for cancer and surgery wards.',
  },
  'B-': {
    give: ['B-', 'B+', 'AB-', 'AB+'],
    receive: ['B-', 'O-'],
    rarity: '2% (Very Rare)',
    note: 'Critical reserve group. Often in high demand in emergency trauma units.',
  },
  'B+': {
    give: ['B+', 'AB+'],
    receive: ['B+', 'B-', 'O+', 'O-'],
    rarity: '9% (High in India/Maharashtra)',
    note: 'Common in Maharashtra. Frequent requirement in maternity and cardiac surgery.',
  },
  'AB-': {
    give: ['AB-', 'AB+'],
    receive: ['AB-', 'A-', 'B-', 'O-'],
    rarity: '1% (Rarest Blood Group)',
    note: 'The rarest blood type in the world. Precious resource for specialized clinics.',
  },
  'AB+': {
    give: ['AB+'],
    receive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    rarity: '4% (Universal Red Cell Recipient)',
    note: 'Can receive red cells from ANY group. Also the Universal Plasma Donor!',
  },
};

export default function BloodCompatibilityModal({ isOpen, onClose }) {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [testDonor, setTestDonor] = useState('O-');
  const [testRecipient, setTestRecipient] = useState('B+');

  if (!isOpen) return null;

  const currentInfo = RBC_COMPATIBILITY[selectedGroup];

  // Test match calculation
  const isMatch = RBC_COMPATIBILITY[testDonor]?.give.includes(testRecipient);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div className="modal-title-sos">
              <FaExchangeAlt style={{ color: '#ef233c' }} /> Interactive Blood Compatibility Guide
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
              Explore transfusion rules, antigens, and check donor-patient compatibility instantly
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Match Tool */}
          <div className="compat-tester-card">
            <h4 className="compat-section-title">
              <FaHeartbeat style={{ color: '#ef233c' }} /> Instant Transfusion Match Checker
            </h4>
            <div className="compat-tester-grid">
              <div className="compat-select-box">
                <label className="modal-label">Donor Blood Group</label>
                <select 
                  className="modal-select"
                  value={testDonor}
                  onChange={(e) => setTestDonor(e.target.value)}
                >
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="compat-arrow-divider">
                <FaExchangeAlt />
              </div>

              <div className="compat-select-box">
                <label className="modal-label">Patient (Recipient) Blood Group</label>
                <select 
                  className="modal-select"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                >
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className={`compat-verdict ${isMatch ? 'compat-verdict--safe' : 'compat-verdict--danger'}`}>
              {isMatch ? (
                <>
                  <FaCheckCircle className="verdict-icon" />
                  <div>
                    <strong>COMPATIBLE TRANSFUSION MATCH</strong>
                    <span>A donor with {testDonor} can safely donate red blood cells to a patient with {testRecipient}.</span>
                  </div>
                </>
              ) : (
                <>
                  <FaTimesCircle className="verdict-icon" />
                  <div>
                    <strong>INCOMPATIBLE BLOOD MATCH</strong>
                    <span>{testDonor} cannot be safely given to {testRecipient}. Antibodies will attack foreign antigens.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Group Explorer */}
          <div className="compat-explorer">
            <h4 className="compat-section-title" style={{ marginTop: 20 }}>
              Select Blood Group to Explore Antigens &amp; Rules
            </h4>
            <div className="compat-group-selector">
              {BLOOD_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  className={`compat-group-pill ${selectedGroup === group ? 'active' : ''}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  {group}
                </button>
              ))}
            </div>

            {currentInfo && (
              <div className="compat-detail-card">
                <div className="compat-detail-header">
                  <div className="compat-badge-large">{selectedGroup}</div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: 4 }}>
                      Group {selectedGroup} Profile
                    </h3>
                    <span className="compat-rarity-tag">{currentInfo.rarity}</span>
                  </div>
                </div>

                <p className="compat-note-text">
                  <FaInfoCircle style={{ marginRight: 6, color: '#38bdf8' }} />
                  {currentInfo.note}
                </p>

                <div className="compat-flow-grid">
                  <div className="compat-flow-column">
                    <span className="flow-column-header">
                      <FaCheckCircle style={{ color: '#10b981' }} /> Can Donate Red Cells To:
                    </span>
                    <div className="compat-badges-cluster">
                      {currentInfo.give.map((g) => (
                        <span key={g} className="compat-chip give">{g}</span>
                      ))}
                    </div>
                  </div>

                  <div className="compat-flow-column">
                    <span className="flow-column-header">
                      <FaHeartbeat style={{ color: '#ef233c' }} /> Can Receive Red Cells From:
                    </span>
                    <div className="compat-badges-cluster">
                      {currentInfo.receive.map((g) => (
                        <span key={g} className="compat-chip receive">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Universal Facts Quick Banner */}
          <div className="compat-facts-banner">
            <div className="fact-item">
              <span className="fact-pill red">Universal Red Cell Donor</span>
              <strong>O Negative (O-)</strong>
              <p>Has no A, B, or Rh antigens. Safe for any patient in golden hour emergencies.</p>
            </div>
            <div className="fact-item">
              <span className="fact-pill purple">Universal Red Cell Recipient</span>
              <strong>AB Positive (AB+)</strong>
              <p>Recognizes both A and B antigens and Rh+. Can receive red cells from every group.</p>
            </div>
          </div>

          <button 
            type="button"
            className="btn-header-sos" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
            onClick={onClose}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
