import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import DonorCard from '../components/DonorCard';
import RequestModal from '../components/RequestModal';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CSN_AREAS = [
  '', 'Cidco', 'Garkheda', 'N-1', 'N-2', 'N-3', 'N-4', 'N-5', 'N-6', 'N-7', 'N-8', 'N-9', 'N-10',
  'N-11', 'N-12', 'Pundliknagar', 'Aurangpura', 'Osmanpura', 'Padegaon', 'Waluj', 'Harsul',
  'Mukundwadi', 'Cantonment', 'Satara', 'Nirala Bazar', 'TV Center', 'Jalna Road'
];

export default function FindDonor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState(searchParams.get('bloodGroup') || '');
  const [area, setArea] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (area) params.area = area;
      if (availableOnly) params.isAvailable = 'true';
      const { data } = await axiosInstance.get('/donors', { params });
      setDonors(data);
    } catch {
      toast.error('Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonors(); }, [bloodGroup, area, availableOnly]);

  const clearFilters = () => {
    setBloodGroup('');
    setArea('');
    setAvailableOnly(false);
    setSearchParams({});
  };

  const handleRequest = (donor) => {
    setSelectedDonor(donor);
    setShowModal(true);
  };

  const hasFilters = bloodGroup || area || availableOnly;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>🔍 Find a Blood Donor</h1>
          <p>Search from {donors.length}+ donors across Chhatrapati Sambhaji Nagar</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container">
          {/* Search Filters */}
          <div className="search-container">
            <div className="search-row">
              <div className="search-field">
                <label>Blood Group</label>
                <select
                  className="form-control"
                  value={bloodGroup}
                  onChange={(e) => { setBloodGroup(e.target.value); setSearchParams(e.target.value ? { bloodGroup: e.target.value } : {}); }}
                >
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.slice(1).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label>Area / Ward</label>
                <select
                  className="form-control"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  {CSN_AREAS.map((a, i) => (
                    <option key={i} value={a}>{a || 'All Areas'}</option>
                  ))}
                </select>
              </div>

              <div className="search-field" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <label className="toggle-wrapper" style={{ cursor: 'pointer', marginBottom: 0, alignItems: 'center' }}>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ color: 'var(--white-80)', fontSize: '0.9rem' }}>Available Only</span>
                </label>
              </div>

              {hasFilters && (
                <div className="search-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                    <FaTimes /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ color: 'var(--white-60)' }}>
              {loading ? 'Searching...' : `${donors.length} donor${donors.length !== 1 ? 's' : ''} found`}
              {bloodGroup && <> for <span className="badge badge-red">{bloodGroup}</span></>}
              {area && <> in <strong>{area}</strong></>}
            </p>
          </div>

          {/* Donors Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--white-60)' }}>Finding donors...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🩸</div>
              <h3>No donors found</h3>
              <p>Try a different blood group or area, or encourage someone to register!</p>
            </div>
          ) : (
            <div className="donors-grid">
              {donors.map((donor) => (
                <DonorCard key={donor._id} donor={donor} onRequest={handleRequest} />
              ))}
            </div>
          )}
        </div>
      </section>

      {showModal && selectedDonor && (
        <RequestModal
          donor={selectedDonor}
          onClose={() => { setShowModal(false); setSelectedDonor(null); }}
        />
      )}
    </>
  );
}
