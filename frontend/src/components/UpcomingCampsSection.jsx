import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaCheckCircle, 
  FaPhoneAlt, 
  FaPlusCircle, 
  FaTimes, 
  FaAward,
  FaFilter,
  FaFileAlt
} from 'react-icons/fa';
import { UPCOMING_CAMPS } from '../data/mockData';

export default function UpcomingCampsSection({ onRegisterDonor }) {
  const [camps, setCamps] = useState(UPCOMING_CAMPS);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCampForReg, setSelectedCampForReg] = useState(null);
  const [regForm, setRegForm] = useState({ name: '', phone: '', bloodGroup: 'O+', timeSlot: '10:00 AM - 11:00 AM' });
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCamps = camps.filter((camp) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'High Priority') return camp.status.includes('High Priority') || camp.badge.includes('Thalassemia');
    return camp.area.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  const handleOpenRegister = (camp) => {
    setSelectedCampForReg(camp);
    setRegSuccess('');
    setRegForm({
      name: '',
      phone: '',
      bloodGroup: 'O+',
      timeSlot: '10:00 AM - 11:00 AM',
    });
  };

  const handleRegisterCamp = (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.phone) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setCamps((prev) =>
        prev.map((c) =>
          c.id === selectedCampForReg.id ? { ...c, registeredCount: c.registeredCount + 1 } : c
        )
      );
      setRegSuccess(`Registration confirmed for ${regForm.name}! A reminder pass has been generated.`);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section className="camps-section" id="camps-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaCalendarAlt /> Community Outreach &amp; Drives
        </span>
        <h2 className="section-main-title">
          Upcoming Blood Donation Camps in <span className="highlight-red">Chh. Sambhajinagar</span>
        </h2>
        <p className="section-subtitle">
          Join scheduled mobile van camps and community drives organized with Red Cross, Rotary Club, and GMCH Blood Bank. Register early for fast-track donor registration.
        </p>
      </div>

      <div className="camps-filter-bar">
        <span className="filter-label">
          <FaFilter /> Filter Drives:
        </span>
        {['All', 'High Priority', 'Cidco', 'Kranti Chowk', 'Jalna Road', 'Waluj MIDC'].map((filter) => (
          <button
            key={filter}
            type="button"
            className={`camp-filter-chip ${selectedFilter === filter ? 'active' : ''}`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="camps-cards-grid">
        {filteredCamps.map((camp) => {
          const progressPercent = Math.min(100, Math.round((camp.registeredCount / camp.targetUnits) * 100));
          return (
            <article key={camp.id} className="camp-card">
              <div className="camp-card-top">
                <span className="camp-badge">{camp.badge}</span>
                <span className="camp-status-pill">{camp.status}</span>
              </div>

              <h3 className="camp-title">{camp.title}</h3>
              <div className="camp-organizer">
                <strong>Organized by: </strong> {camp.organizer}
              </div>

              <div className="camp-meta-list">
                <div className="camp-meta-row">
                  <FaCalendarAlt className="meta-icon" style={{ color: '#ef233c' }} />
                  <span><strong>Date:</strong> {camp.date}</span>
                </div>
                <div className="camp-meta-row">
                  <FaClock className="meta-icon" style={{ color: '#38bdf8' }} />
                  <span><strong>Time:</strong> {camp.time}</span>
                </div>
                <div className="camp-meta-row">
                  <FaMapMarkerAlt className="meta-icon" style={{ color: '#10b981' }} />
                  <span><strong>Venue:</strong> {camp.venue}</span>
                </div>
              </div>

              <div className="camp-facilities-box">
                <span className="facilities-title">Key Facilities:</span>
                <div className="facilities-tags">
                  {camp.facilities.map((fac, idx) => (
                    <span key={idx} className="fac-tag">
                      <FaCheckCircle className="fac-icon" /> {fac}
                    </span>
                  ))}
                </div>
              </div>

              <div className="camp-progress-wrap">
                <div className="progress-labels">
                  <span>Registered: <strong>{camp.registeredCount}</strong></span>
                  <span>Target: <strong>{camp.targetUnits} units</strong></span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="camp-card-actions">
                <button
                  type="button"
                  className="btn-camp-register"
                  onClick={() => handleOpenRegister(camp)}
                >
                  <FaPlusCircle /> Register for Camp
                </button>
                <a
                  href={`tel:${camp.contactPhone}`}
                  className="btn-camp-call"
                  title={`Call Coordinator: ${camp.contactPerson}`}
                >
                  <FaPhoneAlt /> Call Coordinator
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Camp Registration Modal */}
      {selectedCampForReg && (
        <div className="modal-overlay" onClick={() => setSelectedCampForReg(null)}>
          <div className="camp-reg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <span className="badge-subhead">Donor Slot Booking</span>
                <h3>{selectedCampForReg.title}</h3>
                <span className="modal-sub-venue">
                  <FaMapMarkerAlt /> {selectedCampForReg.venue}
                </span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setSelectedCampForReg(null)}
              >
                <FaTimes />
              </button>
            </div>

            {regSuccess ? (
              <div className="camp-reg-success-box">
                <div className="success-icon-bounce">🎉</div>
                <h4>Registration Confirmed!</h4>
                <p>{regSuccess}</p>
                <div className="success-camp-details">
                  <div><strong>Date:</strong> {selectedCampForReg.date}</div>
                  <div><strong>Time Slot:</strong> {regForm.timeSlot}</div>
                  <div><strong>Venue:</strong> {selectedCampForReg.venue}</div>
                  <div><strong>Donor Name:</strong> {regForm.name} ({regForm.bloodGroup})</div>
                </div>
                <p className="success-note">
                  ⚡ Please show this confirmation on your mobile at the reception desk to bypass the manual queue.
                </p>
                <button
                  type="button"
                  className="btn-camp-register"
                  onClick={() => setSelectedCampForReg(null)}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterCamp} className="camp-reg-form">
                <div className="form-group">
                  <label htmlFor="donor-reg-name">Full Name *</label>
                  <input
                    id="donor-reg-name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="donor-reg-phone">Mobile Number *</label>
                    <input
                      id="donor-reg-phone"
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="donor-reg-group">Blood Group *</label>
                    <select
                      id="donor-reg-group"
                      value={regForm.bloodGroup}
                      onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="donor-reg-timeslot">Preferred Time Slot</label>
                  <select
                    id="donor-reg-timeslot"
                    value={regForm.timeSlot}
                    onChange={(e) => setRegForm({ ...regForm, timeSlot: e.target.value })}
                  >
                    <option value="09:00 AM - 10:30 AM">09:00 AM – 10:30 AM (Early Morning)</option>
                    <option value="10:30 AM - 12:00 PM">10:30 AM – 12:00 PM (Mid-Morning)</option>
                    <option value="12:00 PM - 01:30 PM">12:00 PM – 01:30 PM (Afternoon)</option>
                    <option value="01:30 PM - 03:30 PM">01:30 PM – 03:30 PM (Late Afternoon)</option>
                  </select>
                </div>

                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setSelectedCampForReg(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-confirm-reg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Fast-Track Pass'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
