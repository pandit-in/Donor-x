import React, { useState, useMemo } from 'react';
import { 
  FaUsers, 
  FaSearch, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaWhatsapp, 
  FaFlag,
} from 'react-icons/fa';
import { CHH_SAMBHAJINAGAR_AREAS } from '../data/mockData';

export default function DonorsView({ donors, onCallDonor, onWhatsAppDonor, onReportDonor }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All Areas');

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      // Blood Group Match
      const matchesGroup = selectedGroup === 'All' || donor.bloodGroup === selectedGroup;

      // Area Match
      const normalizeArea = (value) => value.toLowerCase().replace(/\b(parisar|midc)\b/g, '').replace(/[^a-z0-9]/g, '');
      const selectedAreaKey = normalizeArea(selectedArea);
      const donorAreaKey = normalizeArea(donor.area);
      const isCidcoSector = selectedArea.startsWith('Cidco N-1');
      const matchesArea = selectedArea === 'All Areas'
        || donorAreaKey.includes(selectedAreaKey)
        || selectedAreaKey.includes(donorAreaKey)
        || (isCidcoSector && /\bn?[- ]?\d{1,2}\b/i.test(donor.area));

      // Search Term Match (Name, Area, Bio, Phone)
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !term || 
        donor.name.toLowerCase().includes(term) ||
        donor.area.toLowerCase().includes(term) ||
        donor.bloodGroup.toLowerCase().includes(term);

      return matchesGroup && matchesArea && matchesSearch;
    });
  }, [donors, selectedGroup, selectedArea, searchTerm]);

  return (
    <div className="donors-view-container">
      {/* Count Banner */}
      <div className="donors-count-banner">
        <div className="donors-count-text">
          <FaUsers style={{ color: '#ef233c' }} /> Found {filteredDonors.length} matching potential donors
        </div>

        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          Registered donor profiles and saved availability in Chhatrapati Sambhajinagar
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="donors-toolbar">
        <div className="toolbar-input-group">
          <FaSearch className="input-icon-left" />
          <input 
            type="text"
            className="toolbar-input"
            placeholder="Search by name, area (e.g. Cidco, Kranti Chowk, Garkheda)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="toolbar-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="All">All Blood Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <select 
          className="toolbar-select"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          {CHH_SAMBHAJINAGAR_AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        {(searchTerm || selectedGroup !== 'All' || selectedArea !== 'All Areas') && (
          <button 
            className="chip"
            onClick={() => {
              setSearchTerm('');
              setSelectedGroup('All');
              setSelectedArea('All Areas');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Donors Grid (Screenshot 2 Match) */}
      <div className="donors-grid">
        {filteredDonors.map(donor => (
          <article className="donor-card-rich" key={donor.id}>
            <div className="donor-card-top">
              {/* Left blood badge */}
              <div className="donor-blood-tag">
                <span className="group-text">{donor.bloodGroup}</span>
                <span className="donor-label">DONOR</span>
              </div>

              {/* Main info */}
              <div className="donor-info-col">
                <div className="donor-name-row">
                  <h3 className="donor-name">
                    {donor.name} {donor.verificationStatus === 'Verified' && <FaCheckCircle className="verified-icon" title="Profile verified by an administrator" />}
                  </h3>
                  {donor.verificationStatus !== 'Verified' && (
                    <span className="verification-label">Profile not verified</span>
                  )}
                  <span className={`status-chip ${donor.status.toLowerCase().replace(/\s+/g, '')}`}>
                    ● {donor.status}
                  </span>
                </div>

                <div className="donor-meta-row">
                  <span>{donor.age} yrs</span>
                  <span>•</span>
                  <span>{donor.gender}</span>
                  {donor.weight && (
                    <>
                      <span>•</span>
                      <span>{donor.weight} kg</span>
                    </>
                  )}
                </div>

                <div className="donor-location-row">
                  <FaMapMarkerAlt style={{ color: '#ef233c', fontSize: '0.85rem' }} />
                  <span>{donor.area}</span>
                </div>

                <div className="donor-distance-row">
                  <span>
                    📍 Listed area; exact distance unavailable
                    {donor.availabilityIsStale ? ' · Availability not recently confirmed' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges / Honors */}
            <div className="donor-badges-row">
              {donor.badges?.map((badge, idx) => (
                <span 
                  key={idx} 
                  className={`honor-badge ${badge.includes('donations') ? 'donations' : ''}`}
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Bio quote */}
            {donor.bio && (
              <div className="donor-bio-quote">
                {donor.bio}
              </div>
            )}

            <div className="donor-actions-row">
              {donor.phone ? (
                <>
                  <button className="btn-action-call" onClick={() => onCallDonor(donor)} title={`Call ${donor.name}`}>
                    <FaPhoneAlt /> Call
                  </button>
                  <button className="btn-action-whatsapp" onClick={() => onWhatsAppDonor(donor)} title={`WhatsApp message to ${donor.name}`}>
                    <FaWhatsapp /> WhatsApp
                  </button>
                </>
              ) : <span className="contact-private-label">Contact shared only after consent</span>}
              <button className="btn-report-donor" onClick={() => onReportDonor(donor)} title={`Report ${donor.name}`}>
                <FaFlag /> Report
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredDonors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--dx-bg-card)', borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🩸</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No matching donors found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Try expanding your area filter or choosing another blood group.
          </p>
        </div>
      )}
    </div>
  );
}
