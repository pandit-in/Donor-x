import React from 'react';
import { 
  FaFire, 
  FaHeartbeat, 
  FaFileAlt, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaMobileAlt, 
  FaDesktop, 
  FaBell 
} from 'react-icons/fa';

export default function Header({ 
  onGoHome, 
  onOpenSosModal, 
  onOpenFirstAid, 
  onOpenDocs, 
  soundEnabled, 
  setSoundEnabled, 
  isMobilePreview, 
  setIsMobilePreview,
  notificationsCount,
  onOpenNotifications,
  onOpenAdmin,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="top-header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand-section" onClick={onGoHome}>
          <div className="brand-badge">DX</div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-name">DonorX</span>
              <span className="sos-pill">24X7 SOS</span>
            </div>
            <span className="brand-subtext">Rapid Community Blood Assistance</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="header-actions">
          <button className="btn-header-sos" onClick={onOpenSosModal}>
            <FaFire /> SOS Call
          </button>

          <button className="btn-header-pill" onClick={onOpenFirstAid}>
            <FaHeartbeat style={{ color: '#ef233c' }} /> First Aid
          </button>

          <button className="btn-header-pill" onClick={onOpenDocs}>
            <FaFileAlt style={{ color: '#10b981' }} /> Docs & Approval
          </button>

          <button 
            className="icon-btn" 
            title={soundEnabled ? "Mute alert audio" : "Enable alert audio"}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>

          {user?.role === 'admin' && (
            <button className="btn-header-pill btn-auth-action" onClick={onOpenAdmin}>Admin</button>
          )}

          {/* Mobile | Full Switcher */}
          <div className="view-switch">
            <button 
              className={isMobilePreview ? "active" : ""} 
              onClick={() => setIsMobilePreview(true)}
              title="Mobile Device Preview"
            >
              <FaMobileAlt style={{ marginRight: 4 }} /> Mobile
            </button>
            <button 
              className={!isMobilePreview ? "active" : ""} 
              onClick={() => setIsMobilePreview(false)}
              title="Desktop Full Screen"
            >
              <FaDesktop style={{ marginRight: 4 }} /> Full
            </button>
          </div>

          {/* Notifications */}
          <button 
            className="icon-btn" 
            title="Active Alerts"
            onClick={onOpenNotifications}
          >
            <FaBell />
            {notificationsCount > 0 && (
              <span className="badge-count">{notificationsCount}</span>
            )}
          </button>

          {user ? (
            <>
              <span className="header-account-name">{user.name}</span>
              <button className="btn-header-pill btn-auth-action" onClick={onLogout}>Sign out</button>
            </>
          ) : (
            <button className="btn-header-pill btn-auth-action" onClick={onOpenAuth}>Sign in / Join</button>
          )}
        </div>
      </div>
    </header>
  );
}
