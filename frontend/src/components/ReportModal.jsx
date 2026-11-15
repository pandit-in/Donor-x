import { useState } from 'react';
import { FaFlag, FaTimes } from 'react-icons/fa';
import axiosInstance from '../api/axios';

const reasons = [
  ['incorrect_contact', 'Incorrect contact information'],
  ['misleading_profile', 'Misleading donor profile'],
  ['inappropriate_content', 'Inappropriate content'],
  ['safety_concern', 'Safety concern'],
  ['other', 'Other'],
];

export default function ReportModal({ target, onClose, onSubmitted }) {
  const [reason, setReason] = useState('incorrect_contact');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!target) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/reports', {
        targetType: target.type,
        targetId: target.id,
        reason,
        details: details.trim(),
      });
      onSubmitted();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header-sos">
          <div className="modal-title-sos" id="report-title"><FaFlag /> Report {target.type}</div>
          <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="report-reason">Reason</label>
          <select id="report-reason" className="modal-select" value={reason} onChange={(event) => setReason(event.target.value)}>
            {reasons.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <label className="modal-label" htmlFor="report-details">Additional details (optional)</label>
          <textarea
            id="report-details"
            className="modal-textarea"
            maxLength={1000}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
          {error && <div role="alert" className="auth-error">{error}</div>}
          <button className="btn-trigger-broadcast" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit report for review'}
          </button>
        </form>
      </div>
    </div>
  );
}
