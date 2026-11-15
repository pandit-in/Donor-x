import React, { useMemo, useState } from 'react';
import { FaHospital, FaClock, FaPhoneAlt, FaSearch } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { LOCAL_BLOOD_CENTRES } from '../data/localBloodCentres';
import { LOCAL_HOSPITALS } from '../data/localHospitals';
import BloodStockTracker from './BloodStockTracker';

const localDirectoryUrl = 'https://www.google.com/maps/search/blood+banks+in+Chhatrapati+Sambhajinagar+Maharashtra';
const eRaktKoshDirectoryUrl = 'https://eraktkosh.mohfw.gov.in/eraktkoshPortal/#/publicPages/bloodBankDirectory';
const eraktKoshUrl = 'https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/stockAvailability.cnt';
const initialSuggestion = {
  name: '',
  address: '',
  phone: '',
  hours: '',
  sourceUrl: '',
  facilityType: 'Blood centre',
  locationConfirmed: false,
};

const getMapSearchUrl = (facility) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${facility.name}, ${facility.address}`)}`;
const formatSourceDate = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function BloodBanksView({ banks, onCallBank }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestion, setSuggestion] = useState(initialSuggestion);
  const [suggestionStatus, setSuggestionStatus] = useState('');
  const [suggestionError, setSuggestionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isDemoMode = banks.some((bank) => bank.isDemo);
  const visibleBanks = useMemo(() => {
    if (isDemoMode) return banks;
    const listedNames = new Set(banks.map((bank) => bank.name.trim().toLowerCase()));
    return [
      ...banks,
      ...LOCAL_BLOOD_CENTRES.filter((centre) => !listedNames.has(centre.name.trim().toLowerCase())),
      ...LOCAL_HOSPITALS.filter((hospital) => !listedNames.has(hospital.name.trim().toLowerCase())),
    ];
  }, [banks, isDemoMode]);
  const filteredBanks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return visibleBanks.filter((bank) => {
      const isHospital = bank.facilityType === 'Hospital';
      const matchesType = isDemoMode || facilityFilter === 'All'
        || (facilityFilter === 'Hospitals' && isHospital)
        || (facilityFilter === 'Blood centres' && !isHospital);
      const searchableText = [
        bank.name,
        bank.address,
        bank.phoneDisplay,
        bank.email,
        bank.category,
        bank.bloodCentreStatus,
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesType
        && searchableText.includes(term);
    });
  }, [visibleBanks, searchTerm, facilityFilter, isDemoMode]);

  const updateSuggestion = (event) => {
    const { name, value, checked, type } = event.target;
    setSuggestion((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitSuggestion = async (event) => {
    event.preventDefault();
    setSuggestionError('');
    setSuggestionStatus('');
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/blood-banks/suggestions', suggestion);
      setSuggestionStatus(data.message);
      setSuggestion(initialSuggestion);
      setShowSuggestionForm(false);
    } catch (error) {
      setSuggestionError(error.response?.data?.message || 'Could not submit the facility suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="banks-view-container">
      <div className="banks-view-header">
        <div className="banks-heading-group">
          <h2 className="banks-heading">Hospitals, Blood Banks & Centres</h2>
          <span className="banks-subtext">
            {isDemoMode
              ? 'Sample directory preview only; these are not real facilities.'
              : 'Source-backed Chhatrapati Sambhajinagar facilities. Each listing links to its source; call to confirm current details.'}
          </span>
        </div>
        <button className="govt-helpline-badge" onClick={() => onCallBank({ name: 'National Blood Helpline', phone: '104' })}>
          <FaPhoneAlt /> National Blood Helpline: 104
        </button>
      </div>

      <BloodStockTracker onCallHospital={onCallBank} />

      <div style={{ position: 'relative', marginTop: 24 }}>
        <FaSearch className="input-icon-left" style={{ top: 22 }} />
        <input
          type="text"
          className="banks-search-input"
          aria-label="Search local facilities"
          placeholder="Search by facility, area, phone, or email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>
      {!isDemoMode && (
        <div className="bank-suggestion-actions">
          <button type="button" className="bank-directory-link" onClick={() => setShowSuggestionForm((current) => !current)}>
            {showSuggestionForm ? 'Close facility suggestion form' : 'Suggest a hospital or centre'}
          </button>
          <span>Suggestions are reviewed before they are published.</span>
        </div>
      )}
      {suggestionStatus && <p className="bank-suggestion-message" role="status">{suggestionStatus}</p>}
      {suggestionError && <p className="bank-suggestion-message bank-suggestion-error" role="alert">{suggestionError}</p>}
      {showSuggestionForm && !isDemoMode && (
        <form className="bank-suggestion-form" onSubmit={submitSuggestion}>
          <h3>Suggest a Chhatrapati Sambhajinagar hospital or centre</h3>
          <p>Provide a public source so an administrator can review the facility. Suggestions remain private until verified.</p>
          <label>
            Facility type
            <select name="facilityType" value={suggestion.facilityType} onChange={updateSuggestion}>
              <option value="Blood centre">Blood centre</option>
              <option value="Hospital">Hospital</option>
            </select>
          </label>
          <label>
            Facility name
            <input name="name" value={suggestion.name} onChange={updateSuggestion} maxLength="160" required />
          </label>
          <label>
            Full address
            <input name="address" value={suggestion.address} onChange={updateSuggestion} maxLength="300" required />
          </label>
          <label>
            Public phone number
            <input name="phone" type="tel" value={suggestion.phone} onChange={updateSuggestion} maxLength="30" required />
          </label>
          <label>
            Operating hours, or enter “Not published”
            <input name="hours" value={suggestion.hours} onChange={updateSuggestion} maxLength="100" required />
          </label>
          <label>
            Public source URL
            <input name="sourceUrl" type="url" value={suggestion.sourceUrl} onChange={updateSuggestion} maxLength="500" placeholder="Official website or e-RaktKosh listing" required />
          </label>
          <label className="bank-suggestion-confirm">
            <input name="locationConfirmed" type="checkbox" checked={suggestion.locationConfirmed} onChange={updateSuggestion} required />
            I confirm this facility is in Chhatrapati Sambhajinagar district.
          </label>
          <button className="btn-call-desk" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
        </form>
      )}
      {!isDemoMode && (
        <div className="bank-facility-filters" role="group" aria-label="Filter directory facilities">
          {['All', 'Blood centres', 'Hospitals'].map((filter) => (
            <button
              type="button"
              key={filter}
              className={facilityFilter === filter ? 'active' : ''}
              aria-pressed={facilityFilter === filter}
              onClick={() => setFacilityFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}
      <div className="banks-list">
        {filteredBanks.map((bank) => (
          <article className="bank-card" key={bank._id}>
            <div className="bank-top-row">
              <div className="bank-info-left">
                <div className="bank-icon-box"><FaHospital /></div>
                <div>
                  <h3 className="bank-name">
                    {bank.name}
                    <span className="verification-label">
                      {bank.isDemo
                        ? 'DEMO · Not a real centre'
                        : bank.isOfficialDirectory
                        ? 'e-RaktKosh listing'
                        : bank.sourceName && bank.facilityType === 'Hospital'
                        ? 'Official hospital listing'
                        : 'Verified listing'}
                    </span>
                  </h3>
                  <div className="bank-address">📍 {bank.address}</div>
                  {bank.category && <div className="bank-category-chip">{bank.category}</div>}
                </div>
              </div>
              {bank.hours && (
                <span className={`timing-badge${/not listed|call to confirm/i.test(bank.hours) ? ' timing-unknown' : ''}`}>
                  <FaClock /> {bank.hours}
                </span>
              )}
            </div>
            <div className="inventory-section">
              <div className="inventory-heading">
                {bank.facilityType === 'Hospital'
                  ? 'Hospital listing · blood stock is not provided.'
                  : bank.isDemo
                  ? 'DEMO INVENTORY · No real stock data'
                  : bank.isOfficialDirectory
                  ? 'Live stock is not provided in this directory listing.'
                  : bank.inventoryIsCurrent
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
              ) : <p className="availability-desc">
                {bank.facilityType === 'Hospital'
                  ? bank.bloodCentreStatus || 'Blood-centre availability is not confirmed for this hospital.'
                  : bank.isDemo
                  ? 'Sample inventory is intentionally not provided.'
                  : bank.isOfficialDirectory
                  ? <>Check <a href={eraktKoshUrl} target="_blank" rel="noopener noreferrer">e-RaktKosh</a> or call the centre to confirm current stock.</>
                  : 'Call the centre to confirm current stock.'}
              </p>}
            </div>
            <div className="bank-bottom-row">
              <div>
                {bank.isDemo ? 'No phone number in demo data' : <>Phone: <b>{bank.phoneDisplay || bank.phone}</b></>}
                {bank.email && <div>Email: <a href={`mailto:${bank.email}`}>{bank.email}</a></div>}
                {bank.emergencyPhone && <div>Emergency: <a href={`tel:${bank.emergencyPhone}`}>{bank.emergencyPhone}</a></div>}
                {bank.centerPhone && <div>Blood centre: <a href={`tel:${bank.centerPhone}`}>{bank.centerPhone}</a></div>}
                {bank.isOfficialDirectory && (
                  <div className="bank-source-link">
                    Source checked {formatSourceDate(bank.sourceCheckedAt)} ·{' '}
                    <a href={bank.sourceUrl} target="_blank" rel="noopener noreferrer">e-RaktKosh</a>
                    {bank.additionalSourceUrl && (
                      <> · <a href={bank.additionalSourceUrl} target="_blank" rel="noopener noreferrer">hospital website</a></>
                    )}
                  </div>
                )}
                {bank.sourceName && bank.facilityType === 'Hospital' && (
                  <div className="bank-source-link">
                    Source checked {formatSourceDate(bank.sourceCheckedAt)} ·{' '}
                    <a href={bank.sourceUrl} target="_blank" rel="noopener noreferrer">{bank.sourceName}</a>
                  </div>
                )}
              </div>
              <div className="bank-card-actions">
                <a className="bank-map-link" href={getMapSearchUrl(bank)} target="_blank" rel="noopener noreferrer">Directions</a>
                {bank.phone && <button className="btn-call-desk" onClick={() => onCallBank(bank)}><FaPhoneAlt /> Call</button>}
              </div>
            </div>
          </article>
        ))}
        {filteredBanks.length === 0 && (
          visibleBanks.length ? (
            <p className="availability-desc">No facilities match this search and filter.</p>
          ) : (
            <section className="bank-directory-empty" aria-label="Find local blood-bank services">
              <p className="availability-desc">
                No local facilities match this filter. Use the official directories below; external results may include places not reviewed by DonorX.
              </p>
              <div className="bank-directory-links">
                <a className="bank-directory-link" href={localDirectoryUrl} target="_blank" rel="noopener noreferrer">
                  Search local centres on Maps
                </a>
                <a className="bank-directory-link" href={eRaktKoshDirectoryUrl} target="_blank" rel="noopener noreferrer">
                  Browse e-RaktKosh centre directory
                </a>
                <a className="bank-directory-link" href={eraktKoshUrl} target="_blank" rel="noopener noreferrer">
                  Check e-RaktKosh blood availability
                </a>
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}
