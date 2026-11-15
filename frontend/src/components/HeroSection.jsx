import React from 'react';
import {
  FaCheckCircle,
  FaClipboardList,
  FaFire,
  FaHandshake,
  FaLock,
  FaMapMarkerAlt,
  FaUsers,
  FaUserPlus,
  FaAward,
  FaExchangeAlt
} from 'react-icons/fa';

export default function HeroSection({ 
  onBroadcastClick, 
  onRegisterClick,
  onOpenCertificate,
  onOpenCompatibility,
  stats = { donors: '148+ Donors', activeReqs: '2 Active', avgResponse: '< 18 mins', voluntary: '100% Free' }
}) {
  return (
    <section className="hero-card">
      <div className="hero-main-grid">
        <div className="hero-copy">
          <div className="hero-pill-row">
            <span className="hero-pill"><FaMapMarkerAlt /> Chhatrapati Sambhajinagar &bull; DonorX</span>
            <span className="hero-sub-pill">24x7 Rapid Transfusion Grid</span>
          </div>

          <h1 className="hero-title">
            Every Second Counts In <span className="highlight-red">Blood Emergencies.</span>
          </h1>

          <p className="hero-desc">
            Directly connecting voluntary blood donors, trauma centers, and families in Chhatrapati Sambhajinagar. Submit an emergency SOS request, browse live donor radars, or earn your certified voluntary donor pass.
          </p>

          <div className="hero-actions">
            <button type="button" className="btn-hero-primary" onClick={onBroadcastClick}>
              <FaFire /> Submit Emergency Request
            </button>

            <button type="button" className="btn-hero-secondary" onClick={onRegisterClick}>
              <FaUserPlus /> Register as Donor
            </button>

            <button 
              type="button" 
              className="btn-hero-tertiary" 
              onClick={onOpenCertificate}
              title="Generate Official Life Saver Certificate"
            >
              <FaAward style={{ color: '#fbbf24' }} /> Get Certificate
            </button>
          </div>

          {/* Quick Group Selector Banner */}
          <div className="hero-quick-group-bar">
            <span className="quick-group-lbl">Transfusion Guide:</span>
            <div className="quick-group-chips">
              {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  className="hero-mini-chip"
                  onClick={onOpenCompatibility}
                  title={`Check compatibility for ${bg}`}
                >
                  {bg}
                </button>
              ))}
              <button 
                type="button" 
                className="hero-mini-chip matrix-btn"
                onClick={onOpenCompatibility}
              >
                <FaExchangeAlt /> Full Matrix
              </button>
            </div>
          </div>
        </div>

        <aside className="hero-journey-card" aria-label="How a blood request works">
          <div className="hero-journey-heading">
            <div>
              <span className="hero-journey-eyebrow">RAPID EMERGENCY PROTOCOL</span>
              <h2>How Help Arrives In 4 Steps</h2>
            </div>
            <span className="hero-journey-count">04 <small>steps</small></span>
          </div>

          <ol className="hero-journey-steps">
            <li>
              <span className="hero-step-icon"><FaClipboardList /></span>
              <span className="hero-step-copy">
                <strong>1. Broadcast Need</strong>
                <small>Blood group, hospital, units &amp; urgency</small>
              </span>
              <span className="hero-step-number">01</span>
            </li>
            <li>
              <span className="hero-step-icon"><FaCheckCircle /></span>
              <span className="hero-step-copy">
                <strong>2. Instant Verification</strong>
                <small>Desk reviews details &amp; matches nearby radar</small>
              </span>
              <span className="hero-step-number">02</span>
            </li>
            <li>
              <span className="hero-step-icon"><FaUsers /></span>
              <span className="hero-step-copy">
                <strong>3. Donors Respond</strong>
                <small>Available voluntary donors reply with real ETA</small>
              </span>
              <span className="hero-step-number">03</span>
            </li>
            <li>
              <span className="hero-step-icon"><FaHandshake /></span>
              <span className="hero-step-copy">
                <strong>4. Direct Connection</strong>
                <small>Coordinate securely &amp; save a life</small>
              </span>
              <span className="hero-step-number">04</span>
            </li>
          </ol>

          <div className="hero-privacy-note">
            <FaLock />
            <span>Donor phone numbers are shielded until emergency acceptance.</span>
          </div>
        </aside>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{stats.donors}</div>
          <div className="stat-label">Registered Donors in CSN</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats.activeReqs}</div>
          <div className="stat-label">Active Emergency Requests</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats.avgResponse}</div>
          <div className="stat-label">Average Response Time</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats.voluntary}</div>
          <div className="stat-label">Voluntary &amp; 100% Free</div>
        </div>
      </div>
    </section>
  );
}
