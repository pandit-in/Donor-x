import React from 'react';
import { 
  FaHome, 
  FaSearch, 
  FaFire, 
  FaHospital, 
  FaIdCard,
} from 'react-icons/fa';

export default function BottomDock({ activeTab, setActiveTab, onTriggerSos, user, onOpenAuth }) {
  return (
    <nav className="bottom-dock" aria-label="Bottom Navigation">
      <button 
        className={`dock-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <FaHome className="dock-icon" />
        <span>Home</span>
      </button>

      <button 
        className={`dock-btn ${activeTab === 'donors' ? 'active' : ''}`}
        onClick={() => setActiveTab('donors')}
      >
        <FaSearch className="dock-icon" />
        <span>Donors</span>
      </button>

      {/* Floating Center SOS Button */}
      <button 
        className="dock-sos-elevated"
        onClick={onTriggerSos}
        title="Broadcast Emergency SOS"
      >
        <FaFire />
      </button>

      <button 
        className={`dock-btn ${activeTab === 'banks' ? 'active' : ''}`}
        onClick={() => setActiveTab('banks')}
      >
        <FaHospital className="dock-icon" />
        <span>Banks</span>
      </button>

      <button 
        className={`dock-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => user ? setActiveTab('profile') : onOpenAuth('login', 'seeker')}
        aria-label={user ? 'Open my profile' : 'Log in or register'}
      >
        <FaIdCard className="dock-icon" />
        <span>{user ? 'My Profile' : 'Login / Register'}</span>
      </button>
    </nav>
  );
}
