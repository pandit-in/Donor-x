import React from 'react';
import { FaTimes, FaFileAlt, FaCheckCircle } from 'react-icons/fa';

export default function DocsApprovalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #064e3b 0%, #065f46 100%)' }}>
          <div className="modal-title-sos">
            <FaFileAlt /> Voluntary Blood Donor Protocol &amp; Approvals
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            DonorX operates in strict adherence with National AIDS Control Organisation (NACO) and Maharashtra State Blood Transfusion Council (SBTC) standards.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaCheckCircle /> Age &amp; Weight Standards
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Donors must be between 18–65 years of age, weigh at least 45 kg for females and 50 kg for males, with Hemoglobin &gt; 12.5 g/dL.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaCheckCircle /> Mandatory Donation Interval
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Whole blood donation interval must be at least 90 days (3 months) for male donors and 120 days (4 months) for female donors.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid var(--dx-border)' }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaCheckCircle /> Verification Required at Hospital
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                Carry a valid government ID (Aadhaar, PAN, Voter ID, or Driving License) alongside your DonorX Digital Pass to the transfusion bank.
              </p>
            </div>
          </div>

          <button 
            className="btn-drive-open" 
            style={{ width: '100%', justifyContent: 'center', padding: 12 }}
            onClick={onClose}
          >
            Acknowledge Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}
