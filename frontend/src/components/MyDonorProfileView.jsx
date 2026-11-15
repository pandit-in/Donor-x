import React, { useState } from 'react';
import { 
  FaTint, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaUserPlus,
  FaHeartbeat,
  FaWhatsapp,
  FaPrint,
  FaShareAlt,
  FaAward,
  FaCheck,
  FaBolt
} from 'react-icons/fa';

export default function MyDonorProfileView({ 
  currentDonor, 
  user,
  requests = [],
  donorResponses = [],
  onUpdateStatus, 
  onOpenRegisterForm,
  onOpenCertificate,
  onUpdateRequest,
  onConnectResponse,
  onWithdrawResponse,
  onCallDonor,
  onWhatsAppDonor,
  onUpdateEmailNotifications,
  onSimulateDonorResponse,
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleSharePass = () => {
    if (!currentDonor) return;
    const text = `🩸 *DONORX VOLUNTARY BLOOD DONOR PASS* 🩸
👤 *Donor:* ${currentDonor.name}
🩸 *Blood Group:* ${currentDonor.bloodGroup}
🆔 *Donor ID:* ${currentDonor.donorId}
📍 *Location:* ${currentDonor.area}, Chhatrapati Sambhajinagar
✅ *Status:* ${currentDonor.status} (${currentDonor.verificationStatus || 'Verified'})
🏅 *Total Donations:* ${currentDonor.donationsCount || 0} times
⚡ Ready to assist in life-threatening blood emergencies.
Join the network: https://donorx.org`;

    if (navigator.share) {
      navigator.share({
        title: `DonorX Voluntary Donor Pass - ${currentDonor.name}`,
        text,
      }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  const requestHistory = (
    <section className="availability-control-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="availability-heading" style={{ margin: 0 }}>My Emergency Requests</h3>
        {requests.some((r) => r.status === 'Searching' || r.status === 'Pending') && onSimulateDonorResponse && (
          <button 
            type="button" 
            className="btn-header-pill"
            style={{ fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}
            onClick={() => onSimulateDonorResponse(requests[0]._id)}
            title="Simulate a nearby verified donor accepting this request"
          >
            <FaBolt /> Simulate Donor Response
          </button>
        )}
      </div>

      {requests.length ? requests.map((request) => (
        <div key={request._id} className="request-history-row">
          <div className="request-history-main">
            <strong>{request.bloodGroup} · {request.hospital}</strong>
            <span>{request.area} · {request.unitsNeeded} unit(s) · {request.status}{request.neededBy ? ` · Needed by ${new Date(request.neededBy).toLocaleString()}` : ''}</span>
            {request.donorResponses?.map((response) => (
              <div className="request-response-item" key={response._id}>
                <span>
                  Donor response: {response.donor?.name || 'Donor'} · {response.status}
                  {response.eta ? ` · ETA ${response.eta}` : ''}
                </span>
                {response.donor?.phone && (
                  <div className="request-history-actions">
                    <button className="request-contact-link" onClick={() => onCallDonor(response.donor)}>
                      <FaPhoneAlt /> Call donor
                    </button>
                    <button
                      className="request-contact-link"
                      onClick={() => onWhatsAppDonor({
                        ...response.donor,
                        contactMessage: `Hello ${response.donor.name}, I am following up about your response to the ${request.bloodGroup} request at ${request.hospital}. - DonorX`,
                      })}
                    >
                      <FaWhatsapp /> WhatsApp donor
                    </button>
                  </div>
                )}
                {response.status === 'Accepted' && !response.isConnected && !response.legacy
                  && !['Fulfilled', 'Cancelled', 'Expired'].includes(request.status) && (
                    <button
                      onClick={() => onConnectResponse(request._id, response._id)}
                    >Connect with this donor</button>
                  )}
                {response.isConnected && <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Connected with this donor</span>}
              </div>
            ))}
          </div>
          {!['Fulfilled', 'Cancelled', 'Expired'].includes(request.status) && (
            <div className="request-history-actions">
              {(request.status === 'Connected' || request.donorResponses?.some((r) => r.isConnected)) && (
                <button onClick={() => onUpdateRequest(request._id, 'Fulfilled')}>Mark fulfilled</button>
              )}
              <button onClick={() => onUpdateRequest(request._id, 'Cancelled')}>Cancel request</button>
            </div>
          )}
        </div>
      )) : <p className="availability-desc">No emergency requests submitted yet.</p>}
    </section>
  );

  const donorResponseHistory = (
    <section className="availability-control-card">
      <h3 className="availability-heading">Requests I Responded To</h3>
      {donorResponses.length ? donorResponses.map((request) => (
        <article key={request._id} className="request-history-row">
          <div className="request-history-main">
            <strong>{request.bloodGroup} · {request.hospital}</strong>
            <span>{request.area} · {request.unitsNeeded} unit(s) · Response: {request.responseStatus} · Request: {request.status}{request.responseEta ? ` · ETA ${request.responseEta}` : ''}{request.neededBy ? ` · Needed by ${new Date(request.neededBy).toLocaleString()}` : ''}</span>
            {request.requesterPhone ? (
              <>
                <span>Requester Phone: {request.requesterPhone}</span>
                {request.address && <span>Hospital address: {request.address}</span>}
                <div className="request-history-actions">
                  <button onClick={() => onCallDonor({ name: 'Requester', phone: request.requesterPhone })}>
                    <FaPhoneAlt /> Call requester
                  </button>
                  <button
                    onClick={() => onWhatsAppDonor({
                      name: 'Requester',
                      phone: request.requesterPhone,
                      contactMessage: `Hello, I am following up about your ${request.bloodGroup} blood request at ${request.hospital}. - DonorX`,
                    })}
                  >
                    <FaWhatsapp /> WhatsApp requester
                  </button>
                </div>
              </>
            ) : request.responseStatus === 'Accepted' && <span>Requester contact details were not shared.</span>}
            {request.responseStatus === 'Accepted' && !request.isConnected && !request.legacy
              && !['Fulfilled', 'Cancelled', 'Expired'].includes(request.status) && (
                <div className="request-history-actions">
                  <button onClick={() => onWithdrawResponse(request.requestId)}>
                    Withdraw response
                  </button>
                </div>
              )}
          </div>
        </article>
      )) : <p className="availability-desc">You have not responded to any requests yet.</p>}
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
            <div className="pass-user-meta">Account type: {user.role === 'donor' ? 'Blood donor' : 'Find a donor / Seeker'}</div>
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
        {user?.role === 'donor' && donorResponseHistory}
      </div>
    );
  }

  // Milestones & Tiers
  const donations = currentDonor.donationsCount || 0;
  let tierTitle = 'Registered Volunteer';
  let tierBadge = '🎖️ Bronze Life Saver';
  let tierColor = '#cd7f32';
  if (donations >= 10) {
    tierTitle = 'Platinum Life Guardian';
    tierBadge = '💎 Platinum Life Saver';
    tierColor = '#e2e8f0';
  } else if (donations >= 5) {
    tierTitle = 'Golden Transfusion Champion';
    tierBadge = '🌟 Gold Life Saver';
    tierColor = '#fbbf24';
  } else if (donations >= 2) {
    tierTitle = 'Silver Life Rescuer';
    tierBadge = '🛡️ Silver Life Saver';
    tierColor = '#94a3b8';
  }

  return (
    <div className="profile-view-container">
      {/* View Header */}
      <div className="profile-view-header">
        <div>
          <h2 className="banks-heading">My Donor Profile</h2>
          <span className="banks-subtext">Donor profile and self-reported availability in Chhatrapati Sambhajinagar.</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            type="button"
            className="btn-header-pill"
            onClick={handleSharePass}
            title="Share verified donor badge on WhatsApp"
            style={{ background: 'rgba(37, 211, 102, 0.15)', borderColor: 'rgba(37, 211, 102, 0.4)', color: '#25D366' }}
          >
            {copiedShare ? <><FaCheck /> Shared!</> : <><FaShareAlt /> Share Card</>}
          </button>

          <button 
            type="button"
            className="btn-header-pill"
            onClick={onOpenCertificate}
            title="Official Life Saver Certificate of Honor"
            style={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.4)', color: '#fbbf24' }}
          >
            <FaAward /> Certificate
          </button>

          <button 
            type="button"
            className="btn-header-pill"
            onClick={handlePrintPass}
            title="Print or export digital donor card"
            style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
          >
            <FaPrint /> Print Pass
          </button>

          <button 
            type="button"
            className="btn-header-pill"
            onClick={onOpenRegisterForm}
            style={{ background: 'rgba(239, 35, 60, 0.15)', borderColor: 'rgba(239, 35, 60, 0.4)', color: '#fff' }}
          >
            <FaUserPlus /> Edit Profile
          </button>
        </div>
      </div>

      {/* DONORX VOLUNTARY DONOR PASS */}
      <div className="digital-pass-card holographic-card">
        <div className="pass-header">
          <div className="pass-title-row">
            <FaTint className="pass-drop-icon" />
            <div>
              <div className="pass-title">DONORX VOLUNTARY DONOR PASS</div>
              <div className="pass-id">ID: {currentDonor.donorId || 'DX-2026-8551'}</div>
            </div>
          </div>

          <span className={`verified-pill-green ${currentDonor.verificationStatus === 'Verified' ? '' : 'not-verified-pill'}`}>
            <FaCheckCircle /> {currentDonor.verificationStatus === 'Verified' ? 'Profile Verified' : 'Pending Verification'}
          </span>
        </div>

        <div className="pass-body">
          <div className="pass-user-info">
            <h1 className="pass-user-name">{currentDonor.name}</h1>
            <div className="pass-user-meta">
              {currentDonor.age} yrs • {currentDonor.gender} • {currentDonor.weight ? `${currentDonor.weight} kg` : '60 kg'}
            </div>
            <div className="pass-user-location">
              <FaMapMarkerAlt style={{ color: '#ef233c' }} />
              {currentDonor.area}
            </div>
            <div className="pass-user-phone">
              <FaPhoneAlt />
              {currentDonor.phone || 'Phone not shared'}
            </div>
            <div className="pass-user-meta">{user?.email || currentDonor.email}</div>
            
            {/* Life Saver Badge */}
            <div className="donor-honor-tier" style={{ borderColor: tierColor }}>
              <FaAward style={{ color: tierColor, fontSize: '1.1rem' }} />
              <div>
                <strong>{tierBadge}</strong>
                <small>{tierTitle} · {(currentDonor.donationsCount || 0) * 3} Potential Lives Saved</small>
              </div>
            </div>

            {currentDonor.lastDonation && (
              <div className="pass-user-meta" style={{ marginTop: 6 }}>
                Last voluntary donation: {new Date(currentDonor.lastDonation).toLocaleDateString()}
              </div>
            )}
            {user && (
              <label className="consent-row email-notification-preference" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={user.emailNotifications === true} onChange={(event) => onUpdateEmailNotifications(event.target.checked)} />
                <span>Send me emergency blood alerts by email when near my area.</span>
              </label>
            )}
          </div>

          {/* Red Blood Group Box */}
          <div className="pass-blood-box">
            <div className="blood-huge">{currentDonor.bloodGroup}</div>
            <div className="group-lbl">BLOOD GROUP</div>
            <div className="card-micro-qr" title="Digital verification token">
              <span>DX-VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="pass-footer-stats">
          <div className="pass-stat-item">
            <span className="pass-stat-lbl">Total Donations:</span>
            <span className="pass-stat-val">{currentDonor.donationsCount || 0} Times</span>
          </div>

          <div className="pass-stat-item">
            <span className="pass-stat-lbl">Lives Impacted:</span>
            <span className="pass-stat-val" style={{ color: '#10b981' }}>{(currentDonor.donationsCount || 0) * 3 || 3} Lives</span>
          </div>

          <div className="pass-stat-item">
            <span className="pass-stat-lbl">Availability Status:</span>
            <span className="pass-stat-val" style={{ color: currentDonor.status === 'Available' ? '#10b981' : currentDonor.status === 'On Call' ? '#f59e0b' : '#8b5cf6' }}>
              ● {currentDonor.status}
            </span>
          </div>
        </div>
      </div>

      {/* Update Availability Status Controls */}
      <div className="availability-control-card">
        <h3 className="availability-heading">
          <FaHeartbeat style={{ color: '#ef233c' }} /> Update Your Real-Time Availability (Emergency Calls)
        </h3>
        <p className="availability-desc">
          Set your current readiness. Available donors appear on the hospital sonar radar and receive rapid SOS alerts.
        </p>

        <div className="availability-options-row">
          <button
            type="button"
            className={`btn-status-option available ${currentDonor.status === 'Available' ? 'active' : ''}`}
            onClick={() => onUpdateStatus('Available')}
          >
            <span className="option-title">
              <span style={{ color: '#10b981' }}>●</span> Available
            </span>
            <span className="option-sub">Ready &lt; 30m</span>
          </button>

          <button
            type="button"
            className={`btn-status-option oncall ${currentDonor.status === 'On Call' ? 'active' : ''}`}
            onClick={() => onUpdateStatus('On Call')}
          >
            <span className="option-title">
              <span style={{ color: '#f59e0b' }}>●</span> On Call
            </span>
            <span className="option-sub">1-2 hr notice</span>
          </button>

          <button
            type="button"
            className={`btn-status-option resting ${currentDonor.status === 'Resting' ? 'active' : ''}`}
            onClick={() => onUpdateStatus('Resting')}
          >
            <span className="option-title">
              <span style={{ color: '#8b5cf6' }}>●</span> Resting
            </span>
            <span className="option-sub">Cooldown period</span>
          </button>
        </div>
      </div>

      {requestHistory}
      {donorResponseHistory}
    </div>
  );
}
