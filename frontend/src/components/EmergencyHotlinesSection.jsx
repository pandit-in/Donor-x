import React, { useState } from 'react';
import { FaPhoneAlt, FaAmbulance, FaHospital, FaCheck, FaCopy } from 'react-icons/fa';
import { EMERGENCY_HOTLINES } from '../data/mockData';

export default function EmergencyHotlinesSection({ onCallNumber }) {
  const [copiedPhone, setCopiedPhone] = useState('');

  const handleCopy = (phone) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(''), 2500);
  };

  return (
    <section className="hotlines-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaAmbulance /> 24x7 Critical Help
        </span>
        <h2 className="section-main-title">
          Emergency Helplines &amp; <span className="highlight-red">Hospital Desks</span>
        </h2>
        <p className="section-subtitle">
          In life-or-death situations, immediate communication is key. Tap to place a direct call to emergency response teams and blood bank hotlines in Chhatrapati Sambhajinagar.
        </p>
      </div>

      <div className="hotlines-grid">
        {EMERGENCY_HOTLINES.map((h, idx) => (
          <div key={idx} className="hotline-card">
            <div className="hotline-card-top">
              <span className="hotline-badge" style={{ background: `${h.color}22`, color: h.color }}>
                {h.badge}
              </span>
              <button
                type="button"
                className="btn-copy-num"
                onClick={() => handleCopy(h.phone)}
                title="Copy phone number"
              >
                {copiedPhone === h.phone ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
              </button>
            </div>

            <h3 className="hotline-title">{h.title}</h3>
            <p className="hotline-desc">{h.desc}</p>

            <div className="hotline-actions">
              <a
                href={`tel:${h.phone}`}
                className="btn-call-hotline"
                style={{ background: h.color }}
                onClick={(e) => {
                  if (onCallNumber) {
                    e.preventDefault();
                    onCallNumber({ name: h.title, phone: h.phone });
                  }
                }}
              >
                <FaPhoneAlt /> {h.label}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

