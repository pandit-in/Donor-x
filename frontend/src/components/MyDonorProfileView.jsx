import React from 'react';
import { 
  FaTint, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaUserPlus,
  FaHeartbeat
} from 'react-icons/fa';

export default function MyDonorProfileView({ 
  currentDonor, 
  user,
  requests = [],
  onUpdateStatus, 
  onOpenRegisterForm,
  onUpdateRequest,
  onCallDonor,
  onUpdateEmailNotifications,
}) {
  const requestHistory = (
    <section className="availability-control-card">
      <h3 className="availability-heading">My Emergency Requests</h3>
      {requests.length ? requests.map((request) => (
        <div key={request._id} className="request-history-row">
          <div className="request-history-main">
            <strong>{request.bloodGroup} · {request.hospital}</strong>
            <span>{request.area} · {request.unitsNeeded} unit(s) · {request.status}</span>
            {request.respondedDonor && (
              <span>
                Donor response: {request.respondedDonor.name} ({request.responseEta || 'ETA not provided'})
                {request.respondedDonor.phone && onCallDonor && (
                  <button className="request-contact-link" onClick={() => onCallDonor(request.respondedDonor)}>
                    Call responding donor
                  </button>
                )}
              </span>
            )}
          </div>
          {request.status === 'Pending' && (
            <div className="request-history-actions">
              <button onClick={() => onUpdateRequest(request._id, 'Fulfilled')}>Mark fulfilled</button>
              <button onClick={() => onUpdateRequest(request._id, 'Cancelled')}>Cancel</button>
            </div>
          )}
        </div>
      )) : <p className="availability-desc">No emergency requests submitted yet.</p>}
    </section>
  );

  if (!currentDonor) {
    return (
      <div className="profile-view-container">
        <div className="profile-view-header">
          <div>
            <h2 className="banks-heading">My Account</h2>
            <span className="banks-subtext">Your saved account and blood request details</span>
          </div>
          {user && (
            <button className="btn-header-sos" onClick={onOpenRegisterForm}>
              <FaUserPlus /> Register as donor
            </button>
          )}
        </div>
        {user ? (
          <section className="digital-pass-card">
            <h2 className="pass-title">Account Profile</h2>
            <div className="pass-user-name">{user.name}</div>
            <div className="pass-user-meta">{user.email}</div>
            <div className="pass-user-meta">Account type: {user.role === 'donor' ? 'Blood donor' : 'Find a donor'}</div>
            <label className="consent-row email-notification-preference">
              <input type="checkbox" checked={user.emailNotifications === true} onChange={(event) => onUpdateEmailNotifications(event.target.checked)} />
              <span>Send me request updates by email when email delivery is configured.</span>
            </label>
          </section>
        ) : (
          <section className="digital-pass-card">
            <h2 className="pass-title">Sign in to view your account</h2>
            <p className="pass-user-meta">Create an account to register as a donor, respond to emergencies, and keep track of your requests.</p>
            <button className="btn-header-sos" onClick={onOpenRegisterForm}>Sign in or create account</button>
          </section>
        )}
        {user && requestHistory}
      </div>
    );
  }

  return (
    <div className="profile-view-container">
      {/* View Header */}
      <div className="profile-view-header">
        <div>
          <h2 className="banks-heading">My Donor Profile</h2>
          <span className="banks-subtext">Donor profile and self-reported availability. DonorX does not determine medical eligibility.</span>
        </div>

        <button 
          className="btn-header-pill"
          onClick={onOpenRegisterForm}
          style={{ background: 'rgba(239, 35, 60, 0.15)', borderColor: 'rgba(239, 35, 60, 0.4)', color: '#fff' }}
        >
          <FaUserPlus /> Edit Donor Profile
        </button>
      </div>

      {/* DONORX VOLUNTARY DONOR PASS (Screenshot 5 Match) */}
      <div className="digital-pass-card">
        <div className="pass-header">
          <div className="pass-title-row">
            <FaTint className="pass-drop-icon" />
            <div>
              <div className="pass-title">DONORX VOLUNTARY DONOR PASS</div>
              <div className="pass-id">ID: {currentDonor.donorId}</div>
            </div>
          </div>

          <span className={`verified-pill-green ${currentDonor.verificationStatus === 'Verified' ? '' : 'not-verified-pill'}`}>
            <FaCheckCircle /> {currentDonor.verificationStatus === 'Verified' ? 'Profile verified' : currentDonor.verificationStatus === 'Rejected' ? 'Verification needs attention' : 'Not verified'}
          </span>
        </div>

        <div className="pass-body">
          <div className="pass-user-info">
            <h1 className="pass-user-name">{currentDonor.name}</h1>
            <div className="pass-user-meta">
              {currentDonor.age} yrs • {currentDonor.gender} • {currentDonor.weight || 60} kg
            </div>
            <div className="pass-user-location">
              <FaMapMarkerAlt style={{ color: '#ef233c' }} />
              {currentDonor.area}
            </div>
            <div className="pass-user-phone">
              <FaPhoneAlt />
              {currentDonor.phone}
            </div>
            <div className="pass-user-meta">{user?.email}</div>
            {user && (
              <label className="consent-row email-notification-preference">
                <input type="checkbox" checked={user.emailNotifications === true} onChange={(event) => onUpdateEmailNotifications(event.target.checked)} />
                <span>Send me request updates by email when email delivery is configured.</span>
              </label>
            )}
          </div>

          {/* Red Blood Group Box */}
          <div className="pass-blood-box">
            <div className="blood-huge">{currentDonor.bloodGroup}</div>
            <div className="group-lbl">GROUP</div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="pass-footer-stats">
          <div className="pass-stat-item">
            <span className="pass-stat-lbl">Total Donations:</span>
            <span className="pass-stat-val">{currentDonor.donationsCount} Times</span>
          </div>

          <div className="pass-stat-item">
            <span className="pass-stat-lbl">Status:</span>
            <span className="pass-stat-val" style={{ color: currentDonor.status === 'Available' ? '#10b981' : currentDonor.status === 'On Call' ? '#f59e0b' : '#8b5cf6' }}>
              {currentDonor.status}
            </span>
          </div>
        </div>
      </div>

      {/* Update Availability Status Controls (Screenshot 5 Match) */}
      <div className="availability-control-card">
        <h3 className="availability-heading">
          <FaHeartbeat style={{ color: '#ef233c' }} /> Update Your Availability Status (Emergency Calls)
        </h3>
        <p className="availability-desc">
          Available donor profiles can be found by signed-in users and can respond to open requests.
        </p>

        <div className="availability-options-row">
          <button
            className={`btn-status-option available ${currentDonor.status === 'Available' ? 'active' : ''}`}
            onClick={() => onUpdateStatus('Available')}
          >
            <span className="option-title">
              <span style={{ color: '#10b981' }}>●</span> Available
            </span>
            <span className="option-sub">Ready &lt; 30m</span>
          </button>

          <button
            className={`btn-status-option oncall ${currentDonor.status === 'On Call' ? 'active' : ''}`}
            onClick={() => onUpdateStatus('On Call')}
          >
            <span className="option-title">
              <span style={{ color: '#f59e0b' }}>●</span> On Call
            </span>
            <span className="option-sub">1-2 hr notice</span>
          </button>

          <button
            className={`btn-status-option resting ${currentDonor.status === 'Resting' ? 'active' : ''}`}
            onClick={() => onUpdateStatus('Resting')}
          >
            <span className="option-title">
              <span style={{ color: '#8b5cf6' }}>●</span> Resting
            </span>
            <span className="option-sub">Cooldown</span>
          </button>
        </div>
        {requestHistory}
      </div>
    </div>
  );
}
