import React, { useState } from "react";
import {
  FaAward,
  FaBell,
  FaChevronDown,
  FaExchangeAlt,
  FaFire,
  FaHeartbeat,
  FaSignInAlt,
  FaUserCheck,
  FaVolumeMute,
  FaVolumeUp,
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
  notificationsCount,
  onOpenNotifications,
  onOpenAdmin,
  user,
  onOpenAuth,
  onLogout,
}) {
  const [toolsOpen, setToolsOpen] = useState(false);

  const runTool = (action) => {
    setToolsOpen(false);
    action();
  };

  return (
    <header className="top-header">
      <div className="header-container">
        <button className="brand-section" onClick={onGoHome} aria-label="DonorX home">
          <span className="brand-badge" aria-hidden="true">DX</span>
          <span className="brand-info">
            <span className="brand-title-row">
              <span className="brand-name">DonorX</span>
              <span className="sos-pill">24X7 SOS</span>
              <span className="live-radar-pill">
                <span className="pulse-dot" /> LIVE GRID
              </span>
            </span>
            <span className="brand-subtext">Chhatrapati Sambhajinagar · Blood donor network</span>
          </span>
        </button>

        <div className="header-actions">
          <button
            className="btn-header-sos"
            onClick={onOpenSosModal}
            title="Submit Emergency Blood Request"
          >
            <FaFire aria-hidden="true" /> <span>Emergency SOS</span>
          </button>

          <div className="header-tools-wrap">
            <button
              className={`btn-header-pill header-tools-trigger ${toolsOpen ? "active" : ""}`}
              onClick={() => setToolsOpen((open) => !open)}
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
            >
              Tools <FaChevronDown className="header-tools-chevron" aria-hidden="true" />
            </button>
            {toolsOpen && (
              <div className="header-tools-menu" role="menu" aria-label="DonorX tools">
                <button role="menuitem" onClick={() => runTool(onOpenCompatibility)}>
                  <FaExchangeAlt /> <span><strong>Blood compatibility</strong><small>Check compatible blood groups</small></span>
                </button>
                <button role="menuitem" onClick={() => runTool(onOpenEligibility)}>
                  <FaUserCheck /> <span><strong>Donor eligibility</strong><small>Review common donation criteria</small></span>
                </button>
                <button role="menuitem" onClick={() => runTool(onOpenFirstAid)}>
                  <FaHeartbeat /> <span><strong>First aid &amp; CPR</strong><small>Open emergency guidance</small></span>
                </button>
                <button role="menuitem" onClick={() => runTool(onOpenCertificate)}>
                  <FaAward /> <span><strong>Life saver certificate</strong><small>View or create your certificate</small></span>
                </button>
                {user?.role === "admin" && (
                  <button role="menuitem" onClick={() => runTool(onOpenAdmin)}>
                    <span className="header-tools-admin-mark">A</span><span><strong>Admin dashboard</strong><small>Manage DonorX</small></span>
                  </button>
                )}
                <button
                  className="header-tools-sound"
                  role="menuitemcheckbox"
                  aria-checked={soundEnabled}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                  <span><strong>Alert sounds</strong><small>{soundEnabled ? "On" : "Off"}</small></span>
                </button>
              </div>
            )}
          </div>

          <button
            className="icon-btn header-notifications"
            title="Active emergency notifications"
            aria-label={`Notifications${notificationsCount ? `, ${notificationsCount} unread` : ""}`}
            onClick={onOpenNotifications}
          >
            <FaBell aria-hidden="true" />
            {notificationsCount > 0 && <span className="badge-count">{notificationsCount}</span>}
          </button>

          {user ? (
            <div className="header-user-group">
              <span className="header-account-name" title={user.email}>{user.name}</span>
              <button className="btn-header-pill header-account-action" onClick={onLogout}>Sign out</button>
            </div>
          ) : (
            <div className="header-auth-buttons">
              <button className="btn-header-pill btn-auth-signin" onClick={() => onOpenAuth("login")}>
                <FaSignInAlt aria-hidden="true" /> <span>Sign in / Join</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
