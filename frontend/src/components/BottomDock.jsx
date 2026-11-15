import React from 'react';
import { 
  FaHome, 
  FaSearch, 
  FaFire, 
  FaHospital, 
  FaIdCard, 
  FaChartBar 
} from 'react-icons/fa';

export default function BottomDock({ activeTab, setActiveTab, onTriggerSos }) {
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
        onClick={() => setActiveTab('profile')}
      >
        <FaIdCard className="dock-icon" />
        <span>My Donor ID</span>
      </button>

      <button 
        className={`dock-btn ${activeTab === 'community' ? 'active' : ''}`}
        onClick={() => setActiveTab('community')}
      >
        <FaChartBar className="dock-icon" />
        <span>Community</span>
      </button>
    </nav>
  );
}
