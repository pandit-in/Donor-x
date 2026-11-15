import React, { useState } from 'react';
import { 
  FaHeartbeat, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaAward, 
  FaTint,
  FaMedkit
} from 'react-icons/fa';

const CLINICAL_BENEFITS = [
  {
    icon: <FaHeartbeat style={{ color: '#ef233c' }} />,
    title: 'Enhances Cardiovascular Wellness',
    desc: 'Regular voluntary donation helps maintain healthy blood viscosity and balances iron levels, reducing arterial oxidative stress.',
  },
  {
    icon: <FaTint style={{ color: '#38bdf8' }} />,
    title: 'Stimulates Fresh RBC Generation',
    desc: 'Within 48 hours of donation, your bone marrow actively produces fresh, oxygen-rich red blood cells to replenish your system.',
  },
  {
    icon: <FaMedkit style={{ color: '#10b981' }} />,
    title: 'Free Vital Health Screening',
    desc: 'Every session includes professional measurement of hemoglobin levels, pulse, blood pressure, and screening for blood-borne pathogens.',
  },
  {
    icon: <FaAward style={{ color: '#fbbf24' }} />,
    title: 'Multiplies Life Impact (1 to 3)',
    desc: 'A single 450 ml whole blood donation is fractionated into Packed Red Cells, Platelets, and Fresh Frozen Plasma—saving up to 3 lives.',
  },
];

const MYTHS_AND_FACTS = [
  {
    myth: '“Donating blood weakens your immunity and takes weeks to recover.”',
    fact: 'FALSE. Your plasma fluid volume is restored within 24 to 48 hours with adequate hydration. White blood cells and immune antibodies replenish rapidly without any drop in resistance.',
  },
  {
    myth: '“Blood donation is painful and carries a risk of contracting infections.”',
    fact: 'FALSE. Only a brief 2-second pinch is felt during needle insertion. Sterile, single-use disposable needles and collection kits are utilized once and incinerated—zero infection risk.',
  },
  {
    myth: '“Vegetarians or people on routine medication cannot donate blood.”',
    fact: 'FALSE. Vegetarian diets provide ample iron for healthy hemoglobin (≥ 12.5 g/dL). Many standard medications (such as mild blood pressure or thyroid tablets) do not disqualify you.',
  },
  {
    myth: '“Blood banks sell voluntary blood for high commercial profits.”',
    fact: 'FALSE. In India, blood is legally a gift. The government-mandated processing charge covers strict NAT/ELISA testing, sterile component bags, cold-chain refrigeration, and staff costs.',
  },
];

export default function BloodFactsAndMythsSection() {
  const [activeTab, setActiveTab] = useState('benefits'); // 'benefits' | 'myths' | 'process'

  return (
    <section className="facts-myths-section" aria-label="Blood donation benefits and myths">
      <div className="section-header-row">
        <div>
          <div className="section-eyebrow">
            <FaInfoCircle style={{ color: '#38bdf8' }} /> EVIDENCE-BASED TRANSFUSION MEDICINE
          </div>
          <h2 className="section-title">Clinical Benefits, Myths &amp; The Donation Journey</h2>
          <p className="section-subtitle">
            Scientific facts to inspire confident, informed voluntary donations across Chhatrapati Sambhajinagar.
          </p>
        </div>

        <div className="facts-tab-switcher">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            <FaHeartbeat /> Health Benefits
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'myths' ? 'active' : ''}`}
            onClick={() => setActiveTab('myths')}
          >
            <FaShieldAlt /> Myths vs Facts
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            <FaCheckCircle /> 4-Step Process
          </button>
        </div>
      </div>

      {activeTab === 'benefits' && (
        <div className="benefits-grid">
          {CLINICAL_BENEFITS.map((item, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'myths' && (
        <div className="myths-grid">
          {MYTHS_AND_FACTS.map((item, idx) => (
            <div key={idx} className="myth-fact-card">
              <div className="myth-row">
                <FaTimesCircle className="myth-icon" />
                <div>
                  <span className="myth-label">COMMON MYTH</span>
                  <h4>{item.myth}</h4>
                </div>
              </div>
              <div className="fact-row">
                <FaCheckCircle className="fact-icon" />
                <div>
                  <span className="fact-label">VERIFIED CLINICAL FACT</span>
                  <p>{item.fact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'process' && (
        <div className="process-timeline-grid">
          <div className="process-step-card">
            <span className="step-num">01</span>
            <h4>Quick Registration</h4>
            <p>Identity verification, donor questionnaire, and contact consent in less than 3 minutes.</p>
            <small>⏱ Approx 3 mins</small>
          </div>

          <div className="process-step-card">
            <span className="step-num">02</span>
            <h4>Mini Health Screening</h4>
            <p>Trained medical officer checks blood pressure, pulse, body temperature, and hemoglobin level (≥12.5 g/dL).</p>
            <small>⏱ Approx 5 mins</small>
          </div>

          <div className="process-step-card highlight">
            <span className="step-num">03</span>
            <h4>Blood Donation</h4>
            <p>Relax on a comfortable sanitized phlebotomy recliner. 350-450 ml of blood is collected using a sterile kit.</p>
            <small>⏱ Only 8 to 10 mins</small>
          </div>

          <div className="process-step-card">
            <span className="step-num">04</span>
            <h4>Rest &amp; Refreshment</h4>
            <p>Enjoy fresh fruit juice, biscuits, and a 10-minute rest. Receive your official Life Saver Certificate!</p>
            <small>⏱ Approx 10 mins</small>
          </div>
        </div>
      )}
    </section>
  );
}
