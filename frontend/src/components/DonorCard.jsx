import { useState } from 'react';
import { FaPhone, FaMapMarkerAlt, FaTint, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';

export default function DonorCard({ donor, onRequest }) {
  const [expanded, setExpanded] = useState(false);

  const getInitials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const apiOrigin = new URL(apiBase, window.location.origin).origin;

  const timeSinceLastDonation = (date) => {
    if (!date) return 'Never donated';
    const months = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24 * 30));
    if (months === 0) return 'This month';
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="glass-card donor-card">
      <div className="donor-card-header">
        <div className="donor-avatar">
          {donor.profilePhoto ? (
            <img src={`${apiOrigin}${donor.profilePhoto}`} alt={donor.name} />
          ) : (
            <span>{getInitials(donor.name)}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="donor-name">{donor.name}</div>
          <div className="donor-area">
            <FaMapMarkerAlt size={11} style={{ color: '#E74C3C', marginRight: 4 }} />
            {donor.area}, {donor.city || 'Chh. Sambhaji Nagar'}
          </div>
        </div>
        <div className="blood-badge">{donor.bloodGroup}</div>
      </div>

      <div className="donor-info">
        <div className="donor-info-row">
          <FaCalendarAlt className="icon" size={13} />
          <span>Last Donated: {timeSinceLastDonation(donor.lastDonation)}</span>
        </div>
        <div className="donor-info-row">
          <FaTint className="icon" size={13} />
          <span>Total Donations: {donor.totalDonations || 0}</span>
        </div>
        {expanded && (
          <>
            {donor.phone && (
              <div className="donor-info-row">
                <FaPhone className="icon" size={13} />
                <span>{donor.phone}</span>
              </div>
            )}
            {donor.email && (
              <div className="donor-info-row">
                <FaEnvelope className="icon" size={13} />
                <span>{donor.email}</span>
              </div>
            )}
            <div className="donor-info-row">
              <span style={{ color: 'var(--white-60)', fontSize: '0.8rem' }}>
                Age: {donor.age} | Gender: {donor.gender} | Weight: {donor.weight || 'N/A'} kg
              </span>
            </div>
          </>
        )}
      </div>

      <div className="donor-card-footer">
        <div className={`donor-available`}>
          <div className={`dot ${donor.isAvailable ? 'dot-green' : 'dot-red'}`} />
          <span style={{ color: donor.isAvailable ? '#27AE60' : '#E74C3C', fontSize: '0.8rem' }}>
            {donor.isAvailable ? 'Available' : 'Not Available'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Less' : 'More Info'}
          </button>
          {donor.isAvailable && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onRequest && onRequest(donor)}
            >
              Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
