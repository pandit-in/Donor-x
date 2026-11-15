import React from 'react';
import { FaTimes, FaPrint, FaAward, FaMedal, FaCheckCircle, FaHeart } from 'react-icons/fa';

export default function CertificateModal({ isOpen, onClose, donor, currentDonor, user }) {
  if (!isOpen) return null;

  const activeDonor = donor || currentDonor || {
    name: user?.name || 'Tejashree Rathod',
    bloodGroup: 'O+',
    donorId: 'DX-2026-VOLUNTEER',
    donationsCount: 4,
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="certificate-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="certificate-modal-top-bar no-print">
          <span className="cert-bar-title">
            <FaAward style={{ color: '#fbbf24', marginRight: 8 }} />
            Official Life Saver Certificate of Honor
          </span>
          <div className="cert-top-actions">
            <button type="button" className="btn-print-cert" onClick={handlePrint}>
              <FaPrint /> Print / Save as PDF
            </button>
            <button type="button" className="btn-close-cert" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div className="printable-certificate-sheet" id="donorx-certificate">
          <div className="cert-outer-border">
            <div className="cert-inner-border">
              {/* Header */}
              <div className="cert-header">
                <div className="cert-emblem">🩸</div>
                <div className="cert-org-details">
                  <span className="cert-super-title">DONORX REGIONAL BLOOD TRANSFUSION NETWORK</span>
                  <span className="cert-sub-location">CHHATRAPATI SAMBHAJINAGAR, MAHARASHTRA</span>
                </div>
                <div className="cert-seal-stamp">
                  <div className="seal-ring">
                    <span>OFFICIAL</span>
                    <strong>SEAL</strong>
                    <span>LIFE SAVER</span>
                  </div>
                </div>
              </div>

              <div className="cert-divider-line" />

              {/* Main Title */}
              <div className="cert-body-center">
                <h1 className="cert-main-headline">CERTIFICATE OF HONOR</h1>
                <p className="cert-sub-headline">LIFE SAVER CITATION FOR VOLUNTARY BLOOD DONATION</p>

                <p className="cert-presented-text">This citation is proudly conferred upon</p>
                <div className="cert-donor-name">{activeDonor.name || 'Honorable Life Saver'}</div>

                <p className="cert-citation-text">
                  in distinguished recognition of exceptional humanitarian service and exemplary voluntary blood donation in <strong>Chhatrapati Sambhajinagar</strong>. By selflessly donating blood, you have preserved precious human lives, supported critical emergency care, and brought hope to patients and their families.
                </p>

                {/* Metadata Pills */}
                <div className="cert-meta-row">
                  <div className="cert-meta-item">
                    <span className="meta-label">BLOOD GROUP</span>
                    <strong className="meta-val highlight-red">{activeDonor.bloodGroup || 'O+'}</strong>
                  </div>
                  <div className="cert-meta-item">
                    <span className="meta-label">DONOR ID</span>
                    <strong className="meta-val">{activeDonor.donorId || 'DX-2026-VOLUNTEER'}</strong>
                  </div>
                  <div className="cert-meta-item">
                    <span className="meta-label">RECORDED DONATIONS</span>
                    <strong className="meta-val">{activeDonor.donationsCount || 1} Times</strong>
                  </div>
                  <div className="cert-meta-item">
                    <span className="meta-label">LIVES SAVED</span>
                    <strong className="meta-val highlight-green">{(activeDonor.donationsCount || 1) * 3}+ Patients</strong>
                  </div>
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="cert-footer-row">
                <div className="cert-sig-block">
                  <div className="sig-line">Dr. S. K. Deshmukh, MD</div>
                  <span className="sig-role">Regional Transfusion Officer</span>
                  <span className="sig-dept">Blood Centre, Chh. Sambhajinagar</span>
                </div>

                <div className="cert-date-badge">
                  <div className="badge-shield">
                    <FaMedal className="shield-icon" />
                  </div>
                  <span className="cert-date-label">Date of Issue:</span>
                  <strong>{todayStr}</strong>
                </div>

                <div className="cert-sig-block">
                  <div className="sig-line">Director of Medical Outreach</div>
                  <span className="sig-role">DonorX Voluntary Network</span>
                  <span className="sig-dept">Govt. Registered Health Initiative</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
