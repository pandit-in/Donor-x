import React, { useState } from 'react';
import { FaExchangeAlt, FaHeart, FaInfoCircle, FaCheck, FaTint, FaArrowRight } from 'react-icons/fa';
import { COMPATIBILITY_MAP } from '../data/mockData';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BLOOD_DETAILS = {
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    population: '22% of population',
    fact: 'Second most common group in Maharashtra. High demand for scheduled surgical procedures.',
    isUniversal: false,
  },
  'A-': {
    canGiveTo: ['A+', 'A-', 'AB+', 'AB-'],
    population: '2% of population',
    fact: 'Rare group. Can safely give red blood cells to both Rh-positive and Rh-negative A and AB patients.',
    isUniversal: false,
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    population: '32% of population',
    fact: 'The most prevalent blood group in India! Critical for trauma cases and emergency surgeries.',
    isUniversal: false,
  },
  'B-': {
    canGiveTo: ['B+', 'B-', 'AB+', 'AB-'],
    population: '2.5% of population',
    fact: 'High-priority emergency group. Constantly needed for oncology and Thalassemia transfusions.',
    isUniversal: false,
  },
  'AB+': {
    canGiveTo: ['AB+'],
    population: '8% of population',
    fact: 'Universal Recipient for Red Blood Cells! Can receive blood from ANY blood group. Universal Plasma Donor!',
    isUniversal: 'Universal Recipient',
  },
  'AB-': {
    canGiveTo: ['AB+', 'AB-'],
    population: '1% of population',
    fact: 'The rarest blood type in India (less than 1%). Extremely valuable for platelets and emergency plasma.',
    isUniversal: false,
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    population: '37% of population',
    fact: 'Most frequently transfused blood group. Can help almost 80% of all Rh-positive patients.',
    isUniversal: 'Universal Positive',
  },
  'O-': {
    canGiveTo: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    population: '1.5% of population',
    fact: 'UNIVERSAL RED CELL DONOR! Essential in accident trauma when patient blood group is not yet known.',
    isUniversal: 'Universal Red Cell Donor',
  },
};

export default function BloodCompatibilityExplorer({ onFindDonor, onRequestBlood }) {
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const details = BLOOD_DETAILS[selectedGroup] || BLOOD_DETAILS['O+'];
  const canReceiveFrom = COMPATIBILITY_MAP[selectedGroup] || ['O-'];
  const canGiveTo = details.canGiveTo;

  return (
    <section className="compat-explorer-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaExchangeAlt /> Interactive Blood Type Matrix
        </span>
        <h2 className="section-main-title">
          Understand Your Blood Group &amp; Compatibility
        </h2>
        <p className="section-subtitle">
          Select your blood type below to discover who you can save, who can donate to you, and key clinical characteristics.
        </p>
      </div>

      <div className="group-selector-grid">
        {BLOOD_GROUPS.map((group) => {
          const isActive = group === selectedGroup;
          const isSpecial = group === 'O-' || group === 'AB+';
          return (
            <button
              key={group}
              type="button"
              className={`group-chip-btn ${isActive ? 'active' : ''} ${isSpecial ? 'special-glow' : ''}`}
              onClick={() => setSelectedGroup(group)}
              aria-pressed={isActive}
            >
              <span className="chip-symbol">{group}</span>
              <span className="chip-note">
                {group === 'O-' ? 'Universal' : group === 'AB+' ? 'Recipient' : group === 'B+' ? 'Highest in IN' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <div className="compat-result-card">
        <div className="compat-card-header">
          <div className="compat-title-block">
            <span className="group-badge-giant">{selectedGroup}</span>
            <div>
              <h3 className="compat-heading">
                Blood Group {selectedGroup} Profile
                {details.isUniversal && (
                  <span className="universal-ribbon">⭐ {details.isUniversal}</span>
                )}
              </h3>
              <p className="compat-frequency">
                <FaInfoCircle style={{ color: '#38bdf8', marginRight: 6 }} />
                Estimated prevalence: <strong>{details.population}</strong>
              </p>
            </div>
          </div>

          <div className="compat-cta-group">
            {onFindDonor && (
              <button
                type="button"
                className="btn-quick-action"
                onClick={() => onFindDonor(selectedGroup)}
              >
                <FaTint /> Find {selectedGroup} Donors
              </button>
            )}
            {onRequestBlood && (
              <button
                type="button"
                className="btn-quick-sos"
                onClick={() => onRequestBlood(selectedGroup)}
              >
                Request {selectedGroup} <FaArrowRight />
              </button>
            )}
          </div>
        </div>

        <div className="compat-two-cols">
          {/* Can Donate To */}
          <div className="compat-flow-box donate-flow">
            <div className="flow-title">
              <span className="flow-indicator give-dot"></span>
              <h4>You Can Safely DONATE Red Blood Cells To:</h4>
            </div>
            <p className="flow-desc">Patients with these blood groups can safely receive your red cells:</p>
            <div className="compat-chips-row">
              {canGiveTo.map((group) => (
                <div key={group} className="compat-pill give-pill">
                  <FaCheck className="pill-check" />
                  <strong>{group}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Can Receive From */}
          <div className="compat-flow-box receive-flow">
            <div className="flow-title">
              <span className="flow-indicator receive-dot"></span>
              <h4>You Can Safely RECEIVE Red Blood Cells From:</h4>
            </div>
            <p className="flow-desc">In an emergency, you can safely receive transfusions from:</p>
            <div className="compat-chips-row">
              {canReceiveFrom.map((group) => (
                <div key={group} className="compat-pill receive-pill">
                  <FaHeart className="pill-heart" />
                  <strong>{group}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="compat-clinical-note">
          <div className="note-icon">💡</div>
          <div className="note-text">
            <strong>Clinical Insight for {selectedGroup}: </strong>
            <span>{details.fact}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

