import React, { useMemo, useState } from 'react';
import { FaHospital, FaClock, FaPhoneAlt, FaSearch } from 'react-icons/fa';

export default function BloodBanksView({ banks, onCallBank }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredBanks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return banks.filter((bank) => bank.name.toLowerCase().includes(term) || bank.address.toLowerCase().includes(term));
  }, [banks, searchTerm]);

  return (
    <div className="banks-view-container">
      <div className="banks-view-header">
        <div className="banks-heading-group">
          <h2 className="banks-heading">Blood Banks & Centres</h2>
          <span className="banks-subtext">Verified directory listings. Confirm availability directly with each centre.</span>
        </div>
        <button className="govt-helpline-badge" onClick={() => onCallBank({ name: 'National Blood Helpline', phone: '104' })}>
          <FaPhoneAlt /> National Blood Helpline: 104
        </button>
      </div>
      <div style={{ position: 'relative' }}>
        <FaSearch className="input-icon-left" style={{ top: 22 }} />
        <input
          type="text"
          className="banks-search-input"
          placeholder="Search verified centres by name or location..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>
      <div className="banks-list">
        {filteredBanks.map((bank) => (
          <article className="bank-card" key={bank._id}>
            <div className="bank-top-row">
              <div className="bank-info-left">
                <div className="bank-icon-box"><FaHospital /></div>
                <div>
                  <h3 className="bank-name">{bank.name} <span className="verification-label">Verified listing</span></h3>
                  <div className="bank-address">📍 {bank.address}</div>
                </div>
              </div>
              <span className="timing-badge"><FaClock /> {bank.hours}</span>
            </div>
            <div className="inventory-section">
              <div className="inventory-heading">
                {bank.inventoryIsCurrent
                  ? `Inventory last updated ${new Date(bank.inventoryUpdatedAt).toLocaleString()}`
                  : 'Blood inventory has not been confirmed in the last 24 hours.'}
              </div>
              {bank.inventoryIsCurrent && Object.keys(bank.inventory || {}).length > 0 ? (
                <div className="inventory-grid">
                  {Object.entries(bank.inventory).map(([group, status]) => (
                    <div key={group} className={`inventory-cell ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="cell-group">{group}</span>
                      <span className="cell-status">{status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="availability-desc">Call the centre to confirm current stock.</p>}
            </div>
            <div className="bank-bottom-row">
              <div>Phone: <b>{bank.phone}</b></div>
              <button className="btn-call-desk" onClick={() => onCallBank(bank)}><FaPhoneAlt /> Call Desk</button>
            </div>
          </article>
        ))}
        {filteredBanks.length === 0 && (
          <p className="availability-desc">
            {banks.length ? 'No verified centres match this search.' : 'No blood-bank listings are verified yet. Call the national helpline or check with a local hospital.'}
          </p>
        )}
      </div>
    </div>
  );
}
