import React from "react";
import {
  FaFire,
  FaHeartbeat,
  FaVolumeUp,
  FaVolumeMute,
  FaMobileAlt,
  FaDesktop,
  FaBell,
  FaExchangeAlt,
  FaUserCheck,
  FaAward,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

export default function Header({
  onGoHome,
  onOpenSosModal,
  onOpenFirstAid,
  onOpenCompatibility,
  onOpenEligibility,
  onOpenCertificate,
  soundEnabled,
  setSoundEnabled,
  isMobilePreview,
  setIsMobilePreview,
  notificationsCount,
  onOpenNotifications,
  onOpenAdmin,
  user,
  onOpenAuth,
  onLogout,
}) {
  return (
    <header className="top-header">
      <div className="header-container">
        {/* Brand */}
        <div
          className="brand-section"
          onClick={onGoHome}
          role="button"
          tabIndex={0}
        >
          <div className="brand-badge">DX</div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-name">DonorX</span>
              <span className="sos-pill">24X7 SOS</span>
              <span className="live-radar-pill">
                <span className="pulse-dot"></span> LIVE GRID
              </span>
            </div>
            <span className="brand-subtext">
              Chhatrapati Sambhajinagar Rapid Community Blood Network
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="header-actions">
          <button
            className="btn-header-sos"
            onClick={onOpenSosModal}
            title="Submit Emergency Blood Request"
          >
            <FaFire /> SOS Call
          </button>

          <button
            className="btn-header-pill"
            onClick={onOpenCompatibility}
            title="Blood Compatibility Matrix"
          >
            <FaExchangeAlt style={{ color: "#38bdf8" }} /> Compatibility
          </button>

          <button
            className="btn-header-pill"
            onClick={onOpenEligibility}
            title="60-Second Donor Eligibility Self-Check"
          >
            <FaUserCheck style={{ color: "#10b981" }} /> Eligibility
          </button>

          <button
            className="btn-header-pill"
            onClick={onOpenFirstAid}
            title="First Aid & CPR Metronome"
          >
            <FaHeartbeat style={{ color: "#ef233c" }} /> First Aid &amp; CPR
          </button>

          <button
            className="btn-header-pill"
            onClick={onOpenCertificate}
            title="Generate Life Saver Certificate"
          >
            <FaAward style={{ color: "#fbbf24" }} /> Certificate
          </button>

          <button
            className="icon-btn"
            title={soundEnabled ? "Mute alert audio" : "Enable alert audio"}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>

          {user?.role === "admin" && (
            <button
              className="btn-header-pill btn-auth-action"
              onClick={onOpenAdmin}
            >
              Admin Panel
            </button>
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
            title="Active Emergency Notifications"
            onClick={onOpenNotifications}
          >
            <FaBell />
            {notificationsCount > 0 && (
              <span className="badge-count">{notificationsCount}</span>
            )}
          </button>

          {user ? (
            <div className="header-user-group">
              <span className="header-role-tag">
                {user.role === "admin"
                  ? "🛡️ Admin"
                  : user.role === "donor"
                    ? "🩸 Donor"
                    : "🔍 Seeker"}
              </span>
              <span className="header-account-name" title={user.email}>
                {user.name}
              </span>
              <button
                className="btn-header-pill btn-auth-action"
                onClick={onLogout}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="header-auth-buttons">
              <button
                className="btn-header-pill btn-auth-signin"
                onClick={() => onOpenAuth("login")}
              >
                <FaSignInAlt /> Sign in
              </button>
              <button
                className="btn-header-pill btn-auth-signup"
                onClick={() => onOpenAuth("signup")}
              >
                <FaUserPlus /> Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
