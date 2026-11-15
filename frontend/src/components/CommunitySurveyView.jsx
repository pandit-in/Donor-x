import { useEffect, useState } from 'react';
import { 
  FaChartLine, 
  FaClipboardList, 
  FaWhatsapp, 
  FaLink
} from 'react-icons/fa';
import axiosInstance from '../api/axios';

export default function CommunitySurveyView({ 
  onOpenSurveyModal, 
  onShareWhatsApp, 
  onCopyLink,
  refreshKey,
}) {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let active = true;
    axiosInstance.get('/surveys/stats')
      .then(({ data }) => {
        if (active) {
          setStats(data);
          setStatsError('');
        }
      })
      .catch(() => {
        if (active) setStatsError('Survey summaries are temporarily unavailable.');
      });
    return () => { active = false; };
  }, [refreshKey]);

  return (
    <div className="community-view-container">
      {/* Header Box */}
      <div className="community-header-box">
        <div className="community-top-row">
          <div className="community-title-group">
            <FaChartLine style={{ color: '#10b981', fontSize: '1.4rem' }} />
            <h2 className="community-heading">Community Survey & Field Insights</h2>
          </div>
          <span className="location-pill-outline">Chhatrapati Sambhajinagar</span>
        </div>

        <p className="community-desc">
          Survey summaries below are calculated from responses submitted through DonorX. No results are shown until responses are received.
        </p>

        <div className="community-stats-bar">
          <span>👥 <b>{stats?.total ?? '—'}</b> Submitted Responses</span>
          <span>•</span>
          <span>🩸 <b>{stats?.willingAnytime ?? '—'}</b> Willing to Help Anytime</span>
        </div>
        {statsError && <p className="availability-desc" role="status">{statsError}</p>}
      </div>

      {/* Sharable Donor Registration Survey Card (Screenshot 6 Match) */}
      <div className="survey-drive-card">
        <div className="drive-pill">
          COMMUNITY SURVEY • CHHATRAPATI SAMBHAJINAGAR
        </div>
        <h3 className="drive-title">Sharable Donor Registration Survey</h3>
        <p className="drive-desc">
          Share feedback about blood shortages and donor availability. This survey does not register you as a donor; create a donor profile separately if you want to volunteer.
        </p>

        <div className="drive-actions-row">
          <button className="btn-drive-open" onClick={onOpenSurveyModal}>
            <FaClipboardList /> Open & Fill Donor Survey
          </button>

          <button className="btn-drive-whatsapp" onClick={onShareWhatsApp}>
            <FaWhatsapp /> Share Survey on WhatsApp
          </button>

          <button className="btn-drive-copy" onClick={onCopyLink}>
            <FaLink /> Copy Link
          </button>
        </div>
      </div>

      {/* Field Survey Findings */}
      <div className="findings-section">
        <h3 className="findings-title">
          <FaChartLine style={{ color: '#ef233c' }} />           Submitted Survey Responses
        </h3>

        <div className="survey-question-card">
          <div className="question-text">
            Have you or family faced a severe delay finding emergency blood?
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${stats?.severeDelayPercent || 0}%` }}></div>
          </div>
          <div className="question-foot">
            <span>Reported severe delay</span>
            <b>{stats ? `${stats.severeDelayPercent}%` : '—'}</b>
          </div>
        </div>

        <div className="survey-question-card">
          <div className="question-text">
            Would you be willing to help at any time?
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${stats?.willingAnytimePercent || 0}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}></div>
          </div>
          <div className="question-foot">
            <span>Willingness recorded in submitted responses</span>
            <b>{stats ? `${stats.willingAnytimePercent}%` : '—'}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
