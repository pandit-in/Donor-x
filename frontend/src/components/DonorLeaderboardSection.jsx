import React from 'react';
import { 
  FaAward, 
  FaTrophy, 
  FaHeart, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

export const TOP_DONORS = [
  {
    rank: 1,
    name: 'Aditya Patil',
    bloodGroup: 'O-',
    area: 'Samarth Nagar, Chh. Sambhajinagar',
    donations: 11,
    livesSaved: 33,
    badge: 'Legendary Life Guardian 🏆',
    rarity: 'Universal Donor O-',
    quote: 'Being O- means my blood can go to any baby or trauma victim in the city. Giving blood is my civic duty.',
  },
  {
    rank: 2,
    name: 'Virendra Chavan',
    bloodGroup: 'AB-',
    area: 'Waluj MIDC, Chh. Sambhajinagar',
    donations: 9,
    livesSaved: 27,
    badge: 'Ultra Rare Sentinel 🛡️',
    rarity: 'Rare AB- Group',
    quote: 'Only 1% of humans have AB-. Whenever Ghati or Dhoot hospital calls, I leave everything to reach there.',
  },
  {
    rank: 3,
    name: 'Prathamesh Kulkarni',
    bloodGroup: 'AB+',
    area: 'N-6 Cidco, Jalna Road',
    donations: 8,
    livesSaved: 24,
    badge: 'Plasma & Platelet Champion 🌟',
    rarity: 'Universal Plasma Donor',
    quote: 'Platelet donations take 45 mins on an apheresis machine and can stop bleeding in dengue patients.',
  },
  {
    rank: 4,
    name: 'Sanket Deshmukh',
    bloodGroup: 'A-',
    area: 'Osmanpura, Chh. Sambhajinagar',
    donations: 7,
    livesSaved: 21,
    badge: 'Golden Responder ⚡',
    rarity: 'A- Negative',
    quote: 'Volunteering with DonorX gave me a direct way to respond during emergency golden hour transfusions.',
  },
  {
    rank: 5,
    name: 'Roshni Rathod',
    bloodGroup: 'O+',
    area: 'Cidco N-4, Chh. Sambhajinagar',
    donations: 6,
    livesSaved: 18,
    badge: 'Student Volunteer Leader 🎓',
    rarity: 'Universal Rh+ Hero',
    quote: 'We organize youth blood drives across colleges in Sambhajinagar. Donating takes 15 minutes to save 3 lives.',
  },
];

export default function DonorLeaderboardSection({ onOpenRegisterDonor }) {
  return (
    <section className="leaderboard-section" aria-label="Top life savers and voluntary donors">
      <div className="section-header-row">
        <div>
          <div className="section-eyebrow">
            <FaTrophy style={{ color: '#fbbf24' }} /> HALL OF FAME &bull; TOP LIFE SAVERS
          </div>
          <h2 className="section-title">Chhatrapati Sambhajinagar Blood Donor Champions</h2>
          <p className="section-subtitle">
            Honoring exceptional citizens whose voluntary blood and platelet donations have saved hundreds of lives in local hospitals.
          </p>
        </div>

        <button 
          type="button" 
          className="btn-header-sos" 
          onClick={onOpenRegisterDonor}
        >
          <FaHeart /> Join The Hall of Fame
        </button>
      </div>

      <div className="leaderboard-grid">
        {TOP_DONORS.map((donor) => {
          return (
            <div key={donor.rank} className={`leaderboard-card rank-${donor.rank}`}>
              <div className="leaderboard-rank-badge">
                {donor.rank === 1 ? '🥇 #1' : donor.rank === 2 ? '🥈 #2' : donor.rank === 3 ? '🥉 #3' : `#${donor.rank}`}
              </div>

              <div className="leaderboard-top-row">
                <div className="donor-blood-tag">
                  {donor.bloodGroup}
                </div>

                <div className="donor-info">
                  <h3 className="donor-name">
                    {donor.name} <FaCheckCircle className="verified-check" />
                  </h3>
                  <div className="donor-location">
                    <FaMapMarkerAlt style={{ color: '#ef233c' }} /> {donor.area}
                  </div>
                </div>
              </div>

              <div className="donor-honor-pill">
                <FaAward style={{ color: '#fbbf24' }} /> {donor.badge}
              </div>

              <p className="donor-quote">
                &ldquo;{donor.quote}&rdquo;
              </p>

              <div className="donor-stats-split">
                <div className="stat-chunk">
                  <span className="stat-num">{donor.donations}</span>
                  <span className="stat-lbl">Donations</span>
                </div>
                <div className="stat-chunk highlight">
                  <span className="stat-num">{donor.livesSaved}</span>
                  <span className="stat-lbl">Lives Saved</span>
                </div>
                <div className="stat-chunk">
                  <span className="stat-num">{donor.rarity.split(' ')[0]}</span>
                  <span className="stat-lbl">Rarity</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="leaderboard-cta-banner">
        <div>
          <h3>Every donation you make earns points, badges &amp; saved lives recognition.</h3>
          <p>Register as a voluntary donor today. Receive your official Digital Donor Pass and Life Saver Certificate.</p>
        </div>
        <button type="button" className="btn-header-sos" onClick={onOpenRegisterDonor}>
          Register as Donor Now <FaArrowRight />
        </button>
      </div>
    </section>
  );
}
