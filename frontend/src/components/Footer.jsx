import React, { useEffect, useState } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaHeart, 
  FaShieldAlt, 
  FaWhatsapp, 
  FaAmbulance, 
  FaExchangeAlt, 
  FaCalendarAlt, 
  FaHospital, 
  FaFileAlt,
  FaHeartbeat
} from 'react-icons/fa';
import axiosInstance, { apiBaseUrl } from '../api/axios';

export default function Footer({ 
  onNavigateTab, 
  onOpenCompatibility, 
  onOpenEligibility, 
  onOpenFirstAid, 
  onOpenDocs, 
  onTriggerSos 
}) {
  const [serviceHealth, setServiceHealth] = useState({
    backend: 'checking',
    database: 'checking',
    problem: '',
  });
  const currentYear = new Date().getFullYear();
  const shareText = "Join Chhatrapati Sambhajinagar's voluntary emergency blood network on DonorX. Save lives together!";

  useEffect(() => {
    let active = true;
    const healthUrl = new URL('/health', new URL(apiBaseUrl, window.location.origin)).toString();

    const checkHealth = async () => {
      try {
        const { data } = await axiosInstance.get(healthUrl, { timeout: 5000 });
        if (!active) return;

        setServiceHealth({
          backend: 'connected',
          database: data.database === 'connected' ? 'connected' : 'unknown',
          problem: data.database === 'connected' ? '' : 'The backend is reachable, but database status is unavailable.',
        });
      } catch (error) {
        if (!active) return;

        if (error.response) {
          const databaseDisconnected = error.response.status === 503
            || error.response.data?.database === 'disconnected';
          setServiceHealth({
            backend: 'connected',
            database: databaseDisconnected ? 'disconnected' : 'unknown',
            problem: error.response.data?.message
              || (databaseDisconnected
                ? 'The backend is running, but the database is disconnected.'
                : `Health check returned HTTP ${error.response.status}.`),
          });
          return;
        }

        setServiceHealth({
          backend: 'disconnected',
          database: 'unknown',
          problem: 'Cannot reach the backend. Check API_URL and network access.',
        });
      }
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, 30000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`, '_blank', 'noopener,noreferrer');
  };

  const healthLabel = (status) => ({
    checking: 'Checking…',
    connected: 'Connected',
    disconnected: 'Disconnected',
    unknown: 'Unknown',
  }[status] || 'Unknown');

  return (
    <footer className="footer-site">
      <div className="footer-main-container">
        <div className="footer-cols-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <span className="brand-badge-footer">DX</span>
              <div>
                <span className="footer-brand-title">DonorX Sambhajinagar</span>
                <span className="footer-brand-tagline">24x7 Rapid Community Blood Network</span>
              </div>
            </div>
            <p className="footer-mission-text">
              Dedicated to closing the golden hour emergency gap in Chhatrapati Sambhajinagar. Connecting verified voluntary donors, regional blood banks, and hospital casualty desks with zero commercialization.
            </p>
            <div className="footer-compliance-pill">
              <FaShieldAlt style={{ color: '#10b981' }} />
              <span>Complies with National Blood Transfusion Council (NBTC) &amp; CDSCO guidelines</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('home')}>
                  Home &amp; Radar
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('donors')}>
                  Verified Donors Directory
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('banks')}>
                  Hospitals &amp; Blood Centres
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('profile')}>
                  My Donor Pass &amp; Requests
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTab && onNavigateTab('community')}>
                  Community Pulse &amp; Survey
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Tools & Help */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Clinical Resources</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={onOpenCompatibility}>
                  <FaExchangeAlt style={{ color: '#38bdf8', marginRight: 6 }} /> Blood Compatibility Matrix
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenEligibility}>
                  <FaHeartbeat style={{ color: '#10b981', marginRight: 6 }} /> 60-Sec Eligibility Screener
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenFirstAid}>
                  <FaHeartbeat style={{ color: '#ef233c', marginRight: 6 }} /> CPR Metronome &amp; First Aid
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenDocs}>
                  <FaFileAlt style={{ color: '#a78bfa', marginRight: 6 }} /> Govt. Norms &amp; Leave Rules
                </button>
              </li>
              <li>
                <button type="button" onClick={onTriggerSos} style={{ color: '#ef233c', fontWeight: 700 }}>
                  🚨 Submit Emergency SOS
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Emergency Hotlines</h4>
            <div className="footer-hotlines-box">
              <a href="tel:108" className="footer-hotline-item hotline-red">
                <FaAmbulance /> Emergency Ambulance: <strong>108</strong>
              </a>
              <a href="tel:104" className="footer-hotline-item hotline-blue">
                <FaPhoneAlt /> National Blood Helpline: <strong>104</strong>
              </a>
              <a href="tel:02402402412" className="footer-hotline-item hotline-green">
                <FaHospital /> GMCH Ghati Casualty: <strong>0240-2402412</strong>
              </a>
              <button type="button" className="footer-wa-share" onClick={handleShare}>
                <FaWhatsapp /> Share DonorX on WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="footer-health" role="status" aria-live="polite">
          <strong className="footer-health-heading">System health</strong>
          {['backend', 'database'].map((service) => (
            <span className={`footer-health-item footer-health-item--${serviceHealth[service]}`} key={service}>
              <span className="footer-health-dot" aria-hidden="true" />
              {service === 'backend' ? 'Backend' : 'Database'}: {healthLabel(serviceHealth[service])}
            </span>
          ))}
          {serviceHealth.problem && (
            <span className="footer-health-problem">{serviceHealth.problem}</span>
          )}
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="footer-bottom-row">
          <div className="footer-copy">
            © {currentYear} DonorX — Chhatrapati Sambhajinagar Community Initiative. Built with <FaHeart style={{ color: '#ef233c', margin: '0 4px' }} /> for human life.
          </div>
          <div className="footer-academic-badge">
            Academic Final Submission Edition · 100% Non-Commercial Healthcare Engineering
          </div>
        </div>
      </div>
    </footer>
  );
}
