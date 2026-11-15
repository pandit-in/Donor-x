import React, { useState } from 'react';
import { 
  FaTimes, 
  FaTimesCircle, 
  FaUserCheck, 
  FaAward, 
  FaShieldAlt
} from 'react-icons/fa';
import { playCelebrationChime } from '../utils/sound';

export default function DonorEligibilityModal({ isOpen, onClose, onRegisterAsDonor, soundEnabled = true }) {
  const [answers, setAnswers] = useState({
    ageOk: true,
    weightOk: true,
    lastDonation: 'more_than_3m', // 'never', 'more_than_3m', 'less_than_3m'
    healthyToday: true,
    tattooTravelRecent: false,
    medicationIssues: false,
  });

  const [hasEvaluated, setHasEvaluated] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setAnswers((prev) => ({ ...prev, [field]: val }));
    setHasEvaluated(false);
  };

  const isEligible = 
    answers.ageOk &&
    answers.weightOk &&
    answers.lastDonation !== 'less_than_3m' &&
    answers.healthyToday &&
    !answers.tattooTravelRecent &&
    !answers.medicationIssues;

  const handleEvaluate = (e) => {
    e.preventDefault();
    setHasEvaluated(true);
    if (isEligible) {
      playCelebrationChime(soundEnabled);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div className="modal-title-sos">
              <FaUserCheck style={{ color: '#10b981' }} /> 60-Second Donor Eligibility Self-Check
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
              Quick self-assessment based on standard voluntary blood donation guidelines (NBTC / WHO)
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleEvaluate}>
            <div className="eligibility-questions-grid">
              {/* Question 1: Age */}
              <div className="eligibility-q-card">
                <div className="q-label">1. Age Requirement</div>
                <div className="q-desc">Are you between 18 and 65 years of age?</div>
                <div className="q-toggle-row">
                  <button 
                    type="button"
                    className={`q-toggle-btn ${answers.ageOk ? 'selected' : ''}`}
                    onClick={() => handleChange('ageOk', true)}
                  >
                    Yes (18 - 65)
                  </button>
                  <button 
                    type="button"
                    className={`q-toggle-btn ${!answers.ageOk ? 'selected' : ''}`}
                    onClick={() => handleChange('ageOk', false)}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Question 2: Weight */}
              <div className="eligibility-q-card">
                <div className="q-label">2. Body Weight</div>
                <div className="q-desc">Is your weight at least 45 kg (approx. 100 lbs)?</div>
                <div className="q-toggle-row">
                  <button 
                    type="button"
                    className={`q-toggle-btn ${answers.weightOk ? 'selected' : ''}`}
                    onClick={() => handleChange('weightOk', true)}
                  >
                    Yes (≥ 45 kg)
                  </button>
                  <button 
                    type="button"
                    className={`q-toggle-btn ${!answers.weightOk ? 'selected' : ''}`}
                    onClick={() => handleChange('weightOk', false)}
                  >
                    Below 45 kg
                  </button>
                </div>
              </div>

              {/* Question 3: Last Donation */}
              <div className="eligibility-q-card">
                <div className="q-label">3. Prior Donation Interval</div>
                <div className="q-desc">When was your most recent blood donation?</div>
                <select
                  className="modal-select"
                  value={answers.lastDonation}
                  onChange={(e) => handleChange('lastDonation', e.target.value)}
                >
                  <option value="never">First time donor (Never donated before)</option>
                  <option value="more_than_3m">More than 3 months ago (Eligible)</option>
                  <option value="less_than_3m">Within the last 3 months (Recovery period)</option>
                </select>
              </div>

              {/* Question 4: Health today */}
              <div className="eligibility-q-card">
                <div className="q-label">4. General Wellness Today</div>
                <div className="q-desc">Do you feel healthy today with no active fever, cold, or infection?</div>
                <div className="q-toggle-row">
                  <button 
                    type="button"
                    className={`q-toggle-btn ${answers.healthyToday ? 'selected' : ''}`}
                    onClick={() => handleChange('healthyToday', true)}
                  >
                    Yes, feeling fit
                  </button>
                  <button 
                    type="button"
                    className={`q-toggle-btn ${!answers.healthyToday ? 'selected' : ''}`}
                    onClick={() => handleChange('healthyToday', false)}
                  >
                    Unwell / Fever
                  </button>
                </div>
              </div>

              {/* Question 5: Tattoos/Piercings */}
              <div className="eligibility-q-card">
                <div className="q-label">5. Tattoos &amp; Minor Procedures</div>
                <div className="q-desc">Have you gotten a tattoo, piercing, or major dental work in the last 6 months?</div>
                <div className="q-toggle-row">
                  <button 
                    type="button"
                    className={`q-toggle-btn ${!answers.tattooTravelRecent ? 'selected' : ''}`}
                    onClick={() => handleChange('tattooTravelRecent', false)}
                  >
                    No (Clear)
                  </button>
                  <button 
                    type="button"
                    className={`q-toggle-btn ${answers.tattooTravelRecent ? 'selected' : ''}`}
                    onClick={() => handleChange('tattooTravelRecent', true)}
                  >
                    Yes (Past 6 months)
                  </button>
                </div>
              </div>

              {/* Question 6: Antibiotics */}
              <div className="eligibility-q-card">
                <div className="q-label">6. Active Medications</div>
                <div className="q-desc">Are you taking antibiotics or blood thinners right now?</div>
                <div className="q-toggle-row">
                  <button 
                    type="button"
                    className={`q-toggle-btn ${!answers.medicationIssues ? 'selected' : ''}`}
                    onClick={() => handleChange('medicationIssues', false)}
                  >
                    No medications
                  </button>
                  <button 
                    type="button"
                    className={`q-toggle-btn ${answers.medicationIssues ? 'selected' : ''}`}
                    onClick={() => handleChange('medicationIssues', true)}
                  >
                    Yes, on medication
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-header-sos" 
              style={{ width: '100%', justifyContent: 'center', marginTop: 14, padding: 12 }}
            >
              <FaShieldAlt /> Check My Eligibility Verdict
            </button>
          </form>

          {/* Verdict Box */}
          {hasEvaluated && (
            <div className={`eligibility-result-banner ${isEligible ? 'eligible' : 'deferred'}`}>
              {isEligible ? (
                <>
                  <div className="result-icon-box">
                    <FaAward />
                  </div>
                  <div className="result-copy">
                    <h3>🎉 Congratulations! You are eligible to donate!</h3>
                    <p>
                      Your preliminary answers meet the voluntary donation criteria. One single donation takes just 15 minutes and can save up to 3 lives!
                    </p>
                    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                      <button 
                        type="button" 
                        className="btn-header-sos" 
                        onClick={() => {
                          onClose();
                          if (onRegisterAsDonor) onRegisterAsDonor();
                        }}
                      >
                        Register / Update Donor Profile
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="result-icon-box" style={{ background: 'rgba(239, 35, 60, 0.2)', color: '#ef233c' }}>
                    <FaTimesCircle />
                  </div>
                  <div className="result-copy">
                    <h3 style={{ color: '#ff6b7e' }}>Temporary Deferral Advisory</h3>
                    <p>
                      Based on your responses, you should wait before donating:
                    </p>
                    <ul style={{ paddingLeft: 18, marginTop: 4, fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {!answers.ageOk && <li>Donors must be between 18 and 65 years old.</li>}
                      {!answers.weightOk && <li>A minimum weight of 45 kg is required for red cell volume safety.</li>}
                      {answers.lastDonation === 'less_than_3m' && <li>At least 90 days must elapse between whole blood donations to replenish iron reserves.</li>}
                      {!answers.healthyToday && <li>Please rest until you are completely recovered and symptom-free for 48 hours.</li>}
                      {answers.tattooTravelRecent && <li>A 6-month safety window is advised following tattoos or piercings.</li>}
                      {answers.medicationIssues && <li>Finish your course of antibiotics before voluntary blood donation.</li>}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 14, textAlign: 'center' }}>
            Note: This tool provides educational guidance only. Final eligibility is confirmed via physical screening (Hemoglobin &ge; 12.5 g/dL and blood pressure check) at the blood centre.
          </div>
        </div>
      </div>
    </div>
  );
}
