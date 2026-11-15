import React, { useState } from 'react';
import { FaHospital, FaPhoneAlt, FaSearch, FaExclamationTriangle, FaCheckCircle, FaFire, FaClock } from 'react-icons/fa';
import { BLOOD_COMPONENT_STOCKS } from '../data/mockData';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodStockTracker({ onRequestBlood, onCallHospital }) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBanks = BLOOD_COMPONENT_STOCKS.filter((bank) => {
    const matchesSearch = bank.bankName.toLowerCase().includes(searchTerm.toLowerCase())
      || bank.area.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <section className="stock-tracker-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaHospital /> Real-Time Hospital Inventory
        </span>
        <h2 className="section-main-title">
          Blood Bank &amp; Component <span className="highlight-red">Stock Live Tracker</span>
        </h2>
        <p className="section-subtitle">
          Estimated component levels across accredited blood banks in Chhatrapati Sambhajinagar. Sourced from local hospital exchange logs and e-RaktKosh integration.
        </p>
      </div>

      <div className="stock-controls-row">
        <div className="search-box-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="stock-search-input"
            placeholder="Search hospital or area (e.g. Ghati, MGM, Hedgewar, Cidco)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stock-group-filter">
          <span className="filter-label-inline">Highlight Group:</span>
          <select
            className="stock-group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g === 'All' ? 'All Groups' : `${g} Stock`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stock-cards-grid">
        {filteredBanks.map((bank, idx) => (
          <div key={idx} className="hospital-stock-card">
            <div className="stock-card-top">
              <div>
                <span className="bank-category-badge">{bank.category}</span>
                <h3 className="bank-name">{bank.bankName}</h3>
                <span className="bank-area-text">{bank.area}</span>
              </div>
              <div className="bank-update-pill">
                <FaClock /> Updated {bank.lastUpdated}
              </div>
            </div>

            <div className="stock-grid-badges">
              {Object.entries(bank.stocks).map(([group, data]) => {
                if (selectedGroup !== 'All' && selectedGroup !== group) return null;
                const isCritical = data.level === 'Critical';
                const isLow = data.level === 'Low';
                return (
                  <div
                    key={group}
                    className={`stock-badge-item ${isCritical ? 'critical-pulse' : isLow ? 'low-stock' : 'optimal-stock'}`}
                  >
                    <span className="stock-group-name">{group}</span>
                    <span className="stock-units-num">{data.units} u</span>
                    <span className="stock-status-tag">
                      {isCritical ? '🚨 Critical' : isLow ? '⚠️ Low' : '✓ Normal'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="components-summary-row">
              <span className="comp-label">Components on Standby:</span>
              <div className="comp-chips">
                <span className="comp-chip">PRBC: {bank.components.prbc}</span>
                <span className="comp-chip">Platelets: {bank.components.platelets}</span>
                <span className="comp-chip">FFP: {bank.components.ffp}</span>
              </div>
            </div>

            <div className="stock-card-footer">
              <a
                href={`tel:${bank.phone.replace(/[^0-9]/g, '')}`}
                className="btn-stock-call"
                onClick={(e) => {
                  if (onCallHospital) {
                    e.preventDefault();
                    onCallHospital({ name: bank.bankName, phone: bank.phone });
                  }
                }}
              >
                <FaPhoneAlt /> Call Desk ({bank.phone})
              </a>

              {onRequestBlood && (
                <button
                  type="button"
                  className="btn-stock-sos"
                  onClick={() => onRequestBlood(selectedGroup !== 'All' ? selectedGroup : 'O+')}
                >
                  <FaFire /> Request Blood
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

