import React, { useState } from 'react';
import { 
  FaCompass, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaWhatsapp,
  FaHospital
} from 'react-icons/fa';
import { playSonarPing } from '../utils/sound';

const BLOOD_FILTERS = ['All', 'O+', 'O-', 'B+', 'A+', 'AB+', 'A-', 'B-', 'AB-'];

export default function RadarSection({ 
  donors, 
  onCallDonor, 
  onWhatsAppDonor, 
  soundEnabled 
}) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [activeBlipId, setActiveBlipId] = useState('donor-1');

  // Filter donors by blood group
  const filteredDonors = donors.filter(d => 
    selectedGroup === 'All' ? true : d.bloodGroup === selectedGroup
  );

  // Currently selected spotlight donor (fallback to first available or donor-1)
  const spotlightDonor = donors.find(d => d.id === activeBlipId) || filteredDonors[0] || donors[0];

  const handleBlipClick = (donor) => {
    setActiveBlipId(donor.id);
    playSonarPing(soundEnabled);
  };

  return (
    <section className="radar-section-card">
      <div className="radar-header-row">
        <div className="radar-title-group">
          <div className="radar-icon-box">
            <FaCompass />
          </div>
          <div>
            <div className="radar-heading">
              Registered Donor Profiles
            </div>
            <div className="radar-subtext">
              Network positions are illustrative; exact distances are unavailable
            </div>
          </div>
        </div>

        {/* Blood group chips */}
        <div className="filter-chips">
          {BLOOD_FILTERS.map(group => (
            <button
              key={group}
              className={`chip ${selectedGroup === group ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="radar-main-layout">
        {/* Radar Circular Display */}
        <div className="radar-canvas-container">
          {/* Concentric Sonar Distance Rings */}
          <div className="sonar-ring ring-1">
            <span className="ring-label">Not to scale</span>
          </div>
          <div className="sonar-ring ring-2">
            <span className="ring-label">Not to scale</span>
          </div>
          <div className="sonar-ring ring-3">
            <span className="ring-label">Not to scale</span>
          </div>

          {/* Crosshairs */}
          <div className="radar-crosshair-h"></div>
          <div className="radar-crosshair-v"></div>

          {/* Center Hospital Beacon */}
          <div className="center-beacon" title="Emergency Transfusion Center">
            <FaHospital />
          </div>

          {/* Continuous Rotating Sonar Sweep Beam */}
          <div className="radar-sweep"></div>

          {/* Donor Blips */}
          {filteredDonors.map((donor) => {
            // Calculate X and Y coordinates inside circle (max radius = 45%)
            // Distance mapped from 0 km to 5.0 km
            const normalizedDist = Math.min(donor.radarDist / 5.0, 0.95);
            const radiusPercent = normalizedDist * 42; // distance from center %
            const angleRad = (donor.radarAngle * Math.PI) / 180;
            const left = 50 + radiusPercent * Math.cos(angleRad);
            const top = 50 + radiusPercent * Math.sin(angleRad);

            // Determine badge color class based on blood group
            let colorClass = 'green';
            if (donor.bloodGroup.includes('O')) colorClass = 'red';
            else if (donor.bloodGroup.includes('A')) colorClass = 'orange';
            else if (donor.bloodGroup.includes('AB')) colorClass = 'cyan';

            const isCurrent = donor.id === spotlightDonor?.id;

            return (
              <div
                key={donor.id}
                className="radar-blip"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: isCurrent ? 'translate(-50%, -50%) scale(1.25)' : 'translate(-50%, -50%)',
                  zIndex: isCurrent ? 25 : 15
                }}
                onClick={() => handleBlipClick(donor)}
                title={`${donor.name} (${donor.bloodGroup}) • ${donor.distance}`}
              >
                <span className={`blip-badge ${colorClass}`}>
                  {donor.bloodGroup}
                </span>
              </div>
            );
          })}
        </div>

        {/* Nearest Donor Spotlight Card (Matching Screenshot 1) */}
        {spotlightDonor && (
          <div className="spotlight-donor-card">
            <div className="spotlight-top">
              <div className="spotlight-left-group">
                <div className="badge-blood-big">
                  {spotlightDonor.bloodGroup}
                </div>
                <div>
                  <div className="spotlight-name">
                    {spotlightDonor.name} {spotlightDonor.isVerified && <FaCheckCircle className="verified-icon" />}
                  </div>
                  <div className="spotlight-loc">
                    <FaMapMarkerAlt style={{ color: '#ef233c' }} />
                    {spotlightDonor.area}
                  </div>
                </div>
              </div>

              <span className={`status-chip ${spotlightDonor.status.toLowerCase().replace(/\s+/g, '')}`}>
                {spotlightDonor.status}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              📍 {spotlightDonor.area} • {spotlightDonor.age} yrs • {spotlightDonor.gender}
            </div>

            <div className="donor-badges-row">
              {spotlightDonor.badges?.map((badge, idx) => (
                <span key={idx} className="honor-badge">
                  {badge}
                </span>
              ))}
            </div>

            <div className="spotlight-actions">
              <button 
                className="btn-action-call"
                onClick={() => onCallDonor(spotlightDonor)}
              >
                <FaPhoneAlt /> Call
              </button>

              <button 
                className="btn-action-whatsapp"
                onClick={() => onWhatsAppDonor(spotlightDonor)}
              >
                <FaWhatsapp /> WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
