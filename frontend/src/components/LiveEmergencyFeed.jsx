import React from 'react';
import { 
  FaFire, 
  FaHospital, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle, 
  FaHandsHelping,
  FaShareAlt,
  FaArrowRight
} from 'react-icons/fa';

export default function LiveEmergencyFeed({ broadcasts = [], onRespond, onOpenSosModal }) {
  const handleShareSos = (req) => {
    const text = `🚨 *URGENT BLOOD REQUIRED — ${req.bloodGroup}* 🚨
🏥 *Hospital:* ${req.hospital} (${req.area})
🩸 *Units Needed:* ${req.unitsNeeded || 2} Units (${req.urgency})
⏱ *Needed:* ${req.timeAgo || 'Immediately'}
📍 *City:* Chhatrapati Sambhajinagar
Please help save a life or share in your groups: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: `Urgent Blood Needed: ${req.bloodGroup}`, text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="emergency-feed-section" aria-label="Active emergency blood requests">
      <div className="section-header-row">
        <div>
          <div className="section-eyebrow">
            <FaFire style={{ color: '#ef233c' }} /> LIVE EMERGENCY DISPATCH BOARD
          </div>
          <h2 className="section-title">Critical Blood Requests in Chhatrapati Sambhajinagar</h2>
          <p className="section-subtitle">
            Directly verified emergency cases requiring immediate transfusions. Donors in nearby areas can respond with real-time ETA.
          </p>
        </div>

        <button type="button" className="btn-header-sos" onClick={onOpenSosModal}>
          <FaFire /> Post Urgent Request
        </button>
      </div>

      <div className="emergency-cards-grid">
        {broadcasts.slice(0, 4).map((req) => {
          const isCritical = req.urgency?.includes('CRITICAL');
          const isResponded = req.status === 'Donor Responded' || (req.donorResponses && req.donorResponses.length > 0);

          return (
            <article key={req.id || req._id} className={`emergency-card ${isCritical ? 'critical' : 'urgent'}`}>
              <div className="emergency-card-top">
                <div className="emergency-blood-badge">
                  <span className="blood-type">{req.bloodGroup}</span>
                  <span className="blood-units">{req.unitsNeeded || 2} Units</span>
                </div>

                <div className="emergency-urgency-pill">
                  <span className="pulsing-dot" />
                  {req.urgency || 'URGENT (< 4h)'}
                </div>
              </div>

              <div className="emergency-card-body">
                <h3 className="hospital-name">
                  <FaHospital style={{ color: '#ef233c', flexShrink: 0 }} />
                  <span>{req.hospital}</span>
                </h3>

                <div className="emergency-meta-row">
                  <span>
                    <FaMapMarkerAlt style={{ color: '#38bdf8' }} /> {req.area || 'Chhatrapati Sambhajinagar'}
                  </span>
                  <span>
                    <FaClock style={{ color: '#f59e0b' }} /> {req.timeAgo || 'Recently'}
                  </span>
                </div>

                {req.patientName && (
                  <div className="patient-condition-badge">
                    Patient: <strong>{req.patientName}</strong>
                  </div>
                )}

                {req.notes && (
                  <p className="emergency-notes-snippet">
                    &ldquo;{req.notes}&rdquo;
                  </p>
                )}

                <div className="emergency-status-bar">
                  <div className="status-indicator">
                    {isResponded ? (
                      <span className="status-text responded">
                        <FaCheckCircle /> Donor Responded &bull; En Route
                      </span>
                    ) : (
                      <span className="status-text searching">
                        <span className="radar-mini-pulse" /> Matching Available Donors
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="emergency-card-actions">
                <button
                  type="button"
                  className="btn-respond-sos"
                  onClick={() => onRespond(req)}
                >
                  <FaHandsHelping /> I Can Donate (Send ETA)
                </button>

                <button
                  type="button"
                  className="btn-share-sos"
                  onClick={() => handleShareSos(req)}
                  title="Share alert on WhatsApp"
                >
                  <FaShareAlt />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="emergency-feed-footer">
        <span>⚡ Are you a blood seeker or hospital attendant?</span>
        <button type="button" className="inline-link-action" onClick={onOpenSosModal}>
          Broadcast an Emergency Request Now <FaArrowRight />
        </button>
      </div>
    </section>
  );
}
