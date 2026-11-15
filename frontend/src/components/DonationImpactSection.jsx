import React, { useState } from 'react';
import { FaHeartbeat, FaShieldAlt, FaClock, FaThermometerHalf, FaUsers, FaArrowRight } from 'react-icons/fa';

const COMPONENTS = [
  {
    id: 'prbc',
    name: 'Packed Red Blood Cells (PRBC)',
    short: 'Red Cells',
    color: '#ef233c',
    icon: '🩸',
    shelfLife: '35 to 42 Days',
    temp: '2°C to 6°C',
    targetPatients: 'Trauma accidents, acute hemorrhage, major surgical operations, severe chronic anemia, and cancer chemotherapy patients.',
    vitalFact: 'Carries essential oxygen from lungs to every organ and tissue in the human body. Restores vital hematocrit levels instantly.',
    statNumber: '1 Unit',
    statSubtitle: 'Increases Hb by ~1.0 g/dL',
  },
  {
    id: 'platelets',
    name: 'Platelets (RDP / Apheresis SDP)',
    short: 'Platelets',
    color: '#f59e0b',
    icon: '⚡',
    shelfLife: 'Only 5 Days',
    temp: '20°C to 24°C (Gentle Agitation)',
    targetPatients: 'Dengue patients with severe thrombocytopenia, leukemia, bone marrow transplant recipients, and severe clotting disorders.',
    vitalFact: 'Critical for blood clotting and stopping life-threatening internal bleeding. Because of their short 5-day shelf life, regular donors are urgently needed.',
    statNumber: '5 Days',
    statSubtitle: 'Extremely perishable',
  },
  {
    id: 'plasma',
    name: 'Fresh Frozen Plasma (FFP)',
    short: 'Plasma',
    color: '#38bdf8',
    icon: '💧',
    shelfLife: 'Up to 1 Year',
    temp: '-30°C or colder',
    targetPatients: 'Extensive burn injury victims, severe liver disease patients, shock trauma, and massive transfusion protocol cases.',
    vitalFact: 'The yellowish liquid portion (55% of blood volume) containing crucial coagulation factors, albumin, antibodies, and vital electrolytes.',
    statNumber: '55%',
    statSubtitle: 'Of total blood volume',
  },
  {
    id: 'cryo',
    name: 'Cryoprecipitate Antihemophilic Factor',
    short: 'Cryo',
    color: '#8b5cf6',
    icon: '🛡️',
    shelfLife: 'Up to 1 Year',
    temp: '-18°C or colder',
    targetPatients: 'Hemophilia A patients, Von Willebrand disease, hypofibrinogenemia, and massive obstetric hemorrhage.',
    vitalFact: 'Rich in Factor VIII, Fibrinogen, and Fibronectin. Prepared by thawing fresh frozen plasma at cold temperatures.',
    statNumber: 'Factor VIII',
    statSubtitle: 'Vital clotting agent',
  },
];

export default function DonationImpactSection({ onRegisterDonor }) {
  const [activeComponent, setActiveComponent] = useState('prbc');
  const current = COMPONENTS.find((c) => c.id === activeComponent) || COMPONENTS[0];

  return (
    <section className="impact-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaHeartbeat /> The Science of Life Saving
        </span>
        <h2 className="section-main-title">
          1 Donation Splitting Into <span className="highlight-red">3 Critical Lifelines</span>
        </h2>
        <p className="section-subtitle">
          When you donate 350ml or 450ml of whole blood, modern blood banks fractionate it into specialized components. One single donation can save up to 3 distinct patients.
        </p>
      </div>

      <div className="component-tabs-row">
        {COMPONENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`component-tab-btn ${item.id === activeComponent ? 'active' : ''}`}
            onClick={() => setActiveComponent(item.id)}
            style={{
              '--tab-color': item.color,
            }}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.short}</span>
          </button>
        ))}
      </div>

      <div className="impact-card-display">
        <div className="impact-card-header">
          <div className="impact-title-group">
            <span className="impact-avatar" style={{ background: current.color }}>
              {current.icon}
            </span>
            <div>
              <h3 className="impact-item-name">{current.name}</h3>
              <span className="impact-storage-pill">
                <FaClock /> Shelf Life: {current.shelfLife} · <FaThermometerHalf /> Temp: {current.temp}
              </span>
            </div>
          </div>

          <div className="impact-stat-badge">
            <span className="badge-huge-val" style={{ color: current.color }}>{current.statNumber}</span>
            <span className="badge-small-sub">{current.statSubtitle}</span>
          </div>
        </div>

        <div className="impact-card-body">
          <div className="impact-info-block">
            <h4 className="info-block-label">
              <FaUsers style={{ color: current.color }} /> Who Needs This Component?
            </h4>
            <p className="info-block-text">{current.targetPatients}</p>
          </div>

          <div className="impact-info-block">
            <h4 className="info-block-label">
              <FaShieldAlt style={{ color: '#10b981' }} /> Clinical Importance
            </h4>
            <p className="info-block-text">{current.vitalFact}</p>
          </div>
        </div>

        <div className="impact-card-footer">
          <div className="impact-quote">
            <em>"Blood cannot be manufactured in a laboratory. It can only come as a voluntary gift from one human being to another."</em>
          </div>

          {onRegisterDonor && (
            <button
              type="button"
              className="btn-impact-cta"
              onClick={onRegisterDonor}
            >
              Pledge as Voluntary Donor <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

