import { Link, useNavigate } from 'react-router-dom';
import { FaTint, FaArrowRight, FaUserPlus, FaSearch, FaHeartbeat } from 'react-icons/fa';
import StatsCounter from '../components/StatsCounter';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const CSN_AREAS = [
  'Cidco', 'Garkheda', 'N-1', 'N-2', 'N-3', 'N-4', 'N-5', 'N-6', 'N-7', 'N-8', 'N-9', 'N-10', 'N-11', 'N-12',
  'Pundliknagar', 'Aurangpura', 'Osmanpura', 'Padegaon', 'Waluj', 'Harsul', 'Mukundwadi', 'Cantonment'
];

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 6}s`,
  size: `${4 + Math.random() * 8}px`,
}));

export default function Home() {
  const navigate = useNavigate();

  const handleBloodGroupSearch = (bg) => {
    navigate(`/find-donor?bloodGroup=${encodeURIComponent(bg)}`);
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-bg-image" />
        <div className="hero-particles">
          {PARTICLES.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                width: p.size,
                height: p.size,
              }}
            />
          ))}
        </div>

        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <FaHeartbeat /> Chhatrapati Sambhaji Nagar Blood Network
              </div>

              <h1 className="hero-title">
                Donate Blood,<br />
                <span className="accent">Save a Life</span>
              </h1>

              <p className="hero-desc">
                RaktaSetu connects voluntary blood donors with people in need across
                Chhatrapati Sambhaji Nagar. Find donors or register yourself — every drop matters.
              </p>

              <div className="hero-buttons">
                <Link to="/find-donor" className="btn btn-primary btn-lg">
                  <FaSearch /> Find Donor
                </Link>
                <Link to="/register-donor" className="btn btn-secondary btn-lg">
                  <FaUserPlus /> Become a Donor
                </Link>
              </div>

              <div className="hero-stats">
                <div className="hero-stat-item">
                  <div className="hero-stat-num">1,200+</div>
                  <div className="hero-stat-label">Active Donors</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-num">3,800+</div>
                  <div className="hero-stat-label">Lives Saved</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-num">24/7</div>
                  <div className="hero-stat-label">Emergency Help</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="blood-drop-anim">🩸</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BLOOD GROUP SEARCH */}
      <section className="blood-search-section">
        <div className="container">
          <h2 className="section-title">Search by Blood Group</h2>
          <p className="section-subtitle">Select your required blood type to find available donors instantly</p>
          
          <div className="blood-groups-grid">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                className="blood-group-btn"
                onClick={() => handleBloodGroupSearch(bg)}
              >
                <div className="blood-badge blood-badge-lg">{bg}</div>
                <span className="small">Find Donors</span>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/find-donor" className="btn btn-secondary">
              View All Donors <FaArrowRight style={{ marginLeft: 8 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsCounter />

      <div className="container" style={{ paddingBottom: '40px' }}>
        <div className="emergency-banner" style={{ marginTop: '0' }}>
          <div>
            <h2>🚨 Emergency Blood Required?</h2>
            <p>Submit an emergency blood request and we will notify available donors.</p>
          </div>
          <Link to="/request" className="btn btn-gold btn-lg" style={{ flexShrink: 0 }}>
            Request Now <FaArrowRight style={{ marginLeft: 8 }} />
          </Link>
        </div>
      </div>
    </>
  );
}
