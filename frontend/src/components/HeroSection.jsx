import React from 'react';
import { FaFire, FaUserPlus } from 'react-icons/fa';

export default function HeroSection({ 
  onBroadcastClick, 
  onRegisterClick,
  stats = { donors: '1,480+', activeReqs: '2 Active', avgResponse: '< 25 mins', voluntary: '100% Free' }
}) {
  return (
    <section className="hero-card">
      <span className="hero-pill">
        Rapid Community Blood Assistance
      </span>

      <h1 className="hero-title">
        Every Second Counts In <span className="highlight-red">Blood Emergencies.</span>
      </h1>

      <p className="hero-desc">
        Search registered voluntary donors by blood group and listed area, then contact a donor directly to confirm availability.
      </p>

      <div className="hero-actions">
        <button className="btn-hero-primary" onClick={onBroadcastClick}>
          <FaFire /> Submit Emergency Request
        </button>

        <button className="btn-hero-secondary" onClick={onRegisterClick}>
          <FaUserPlus style={{ color: '#06b6d4' }} /> Register as Donor
        </button>
      </div>

      {/* 4 Stat Tiles (Screenshot 1 Match) */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{stats.donors}</div>
          <div className="stat-label">Registered Donors</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats.activeReqs}</div>
          <div className="stat-label">Emergency Requests</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats.avgResponse}</div>
          <div className="stat-label">Average Response</div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats.voluntary}</div>
          <div className="stat-label">Voluntary Network</div>
        </div>
      </div>
    </section>
  );
}
