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

export default function DonorsView({ donors, isLoading = false, onCallDonor, onWhatsAppDonor, onReportDonor }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesGroup = selectedGroup === 'All' || donor.bloodGroup === selectedGroup;
      const matchesAvailability = selectedAvailability === 'All' || donor.status === selectedAvailability;
      const matchesVerification = !verifiedOnly || donor.verificationStatus === 'Verified';

      const normalizeArea = (value) => value.toLowerCase().replace(/\b(parisar|midc)\b/g, '').replace(/[^a-z0-9]/g, '');
      const selectedAreaKey = normalizeArea(selectedArea);
      const donorAreaKey = normalizeArea(donor.area);
      const isCidcoSector = selectedArea.startsWith('Cidco N-1');
      const matchesArea = selectedArea === 'All Areas'
        || donorAreaKey.includes(selectedAreaKey)
        || selectedAreaKey.includes(donorAreaKey)
        || (isCidcoSector && /\bn?[- ]?\d{1,2}\b/i.test(donor.area));

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !term || 
        donor.name.toLowerCase().includes(term) ||
        donor.area.toLowerCase().includes(term) ||
        donor.bloodGroup.toLowerCase().includes(term) ||
        donor.bio.toLowerCase().includes(term);

      return matchesGroup && matchesAvailability && matchesVerification && matchesArea && matchesSearch;
    });
  }, [donors, selectedGroup, selectedArea, selectedAvailability, verifiedOnly, searchTerm]);
  const visibleSampleCount = filteredDonors.filter((donor) => donor.isDemo).length;

  return (
    <div className="donors-view-container">
      {/* Count Banner */}
      <div className="donors-count-banner">
        <div className="donors-count-text">
          <FaUsers style={{ color: '#ef233c' }} /> Found {filteredDonors.length} matching profiles
        </div>

        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {visibleSampleCount
            ? `${visibleSampleCount} sample-only profile${visibleSampleCount === 1 ? '' : 's'} shown; not registered or contactable.`
            : 'Registered donor profiles and saved availability in Chhatrapati Sambhajinagar'}
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
          aria-label="Filter donors by availability"
          className="toolbar-select"
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
        >
          <option value="All">All Availability</option>
          <option value="Available">Available</option>
          <option value="On Call">On Call</option>
          <option value="Resting">Resting</option>
        </select>

        <select
          aria-label="Filter donors by area"
          className="toolbar-select"
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          {CHH_SAMBHAJINAGAR_AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <select
          aria-label="Filter donors by verification"
          className="toolbar-select"
          value={verifiedOnly ? 'verified' : 'all'}
          onChange={(event) => setVerifiedOnly(event.target.value === 'verified')}
        >
          <option value="all">All profile statuses</option>
          <option value="verified">Verified profiles only</option>
        </select>

        {(searchTerm || selectedGroup !== 'All' || selectedAvailability !== 'All' || selectedArea !== 'All Areas' || verifiedOnly) && (
          <button 
            className="chip"
            onClick={() => {
              setSearchTerm('');
              setSelectedGroup('All');
              setSelectedAvailability('All');
              setSelectedArea('All Areas');
              setVerifiedOnly(false);
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
                <span className="donor-label">{donor.isDemo ? 'SAMPLE' : 'DONOR'}</span>
              </div>

              {/* Main info */}
              <div className="donor-info-col">
                <div className="donor-name-row">
                  <h3 className="donor-name">
                    {donor.name} {donor.verificationStatus === 'Verified' && !donor.isDemo && <FaCheckCircle className="verified-icon" title="Profile verified by an administrator" />}
                  </h3>
                  {donor.isDemo ? (
                    <span className="verification-label">DEMO · Not a real donor</span>
                  ) : donor.verificationStatus !== 'Verified' && (
                    <span className="verification-label">Profile not verified</span>
                  )}
                  <span className={`status-chip ${donor.status.toLowerCase().replace(/\s+/g, '')}`}>
                    ● {donor.status}
                  </span>
                </div>

                <div className="donor-meta-row">
                  {donor.age && donor.age !== '—' && <span>{donor.age} yrs</span>}
                  {donor.age && donor.age !== '—' && donor.gender && <span>•</span>}
                  {donor.gender && donor.gender !== 'Not provided' && <span>{donor.gender}</span>}
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
              {donor.isDemo ? (
                <span className="contact-private-label">Sample profile — contact actions unavailable</span>
              ) : donor.phone ? (
                <>
                  <button className="btn-action-call" onClick={() => onCallDonor(donor)} title={`Call ${donor.name}`}>
                    <FaPhoneAlt /> Call
                  </button>
                  <button className="btn-action-whatsapp" onClick={() => onWhatsAppDonor(donor)} title={`WhatsApp message to ${donor.name}`}>
                    <FaWhatsapp /> WhatsApp
                  </button>
                </>
              ) : <span className="contact-private-label">Contact shared only after consent</span>}
              {!donor.isDemo && (
                <button className="btn-report-donor" onClick={() => onReportDonor(donor)} title={`Report ${donor.name}`}>
                  <FaFlag /> Report
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {filteredDonors.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--dx-bg-card)', borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🩸</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No matching donors found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Try expanding your area filter or choosing another blood group.
          </p>
        </div>
      )}
      {filteredDonors.length === 0 && isLoading && <p className="loading-message">Loading donor profiles…</p>}
    </div>
  );
}
