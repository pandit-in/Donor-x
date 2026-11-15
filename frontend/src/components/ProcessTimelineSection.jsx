import React from 'react';
import { FaUserEdit, FaStethoscope, FaHandHoldingHeart, FaAward, FaArrowRight } from 'react-icons/fa';

const STEPS = [
  {
    step: '01',
    title: 'Registration & Identity',
    time: '2 - 3 Mins',
    icon: <FaUserEdit />,
    color: '#38bdf8',
    desc: 'Fill out a brief health history questionnaire and provide any photo ID (Aadhaar, Driving License, or College ID).',
  },
  {
    step: '02',
    title: 'Mini Physical & Hb Check',
    time: '5 Mins',
    icon: <FaStethoscope />,
    color: '#10b981',
    desc: 'Trained medical staff checks your blood pressure, pulse, weight, and performs a 30-second painless finger prick for hemoglobin (≥ 12.5 g/dL).',
  },
  {
    step: '03',
    title: 'Comfortable Donation',
    time: '8 - 10 Mins',
    icon: <FaHandHoldingHeart />,
    color: '#ef233c',
    desc: 'Relax on an ergonomically padded reclining donor chair. A brand new single-use sterile kit draws 350ml or 450ml while you listen to soothing music.',
  },
  {
    step: '04',
    title: 'Refreshments & Life Saver Pass',
    time: '10 Mins',
    icon: <FaAward />,
    color: '#f59e0b',
    desc: 'Enjoy complimentary fresh juice, biscuits, and tea in the donor lounge. Receive your digital Certificate of Honor and Government Donor Card.',
  },
];

export default function ProcessTimelineSection({ onRegisterClick }) {
  return (
    <section className="timeline-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaHandHoldingHeart /> The Donor Journey
        </span>
        <h2 className="section-main-title">
          What Happens On <span className="highlight-red">Donation Day?</span>
        </h2>
        <p className="section-subtitle">
          From arrival to stepping out as a life-saver in less than 30 minutes. Here is the comfortable, step-by-step experience awaiting you.
        </p>
      </div>

      <div className="timeline-steps-grid">
        {STEPS.map((s, idx) => (
          <div key={s.step} className="timeline-step-card">
            <div className="step-card-header">
              <span className="step-number" style={{ color: s.color }}>{s.step}</span>
              <span className="step-duration-badge">{s.time}</span>
            </div>

            <div className="step-icon-circle" style={{ background: `${s.color}20`, color: s.color }}>
              {s.icon}
            </div>

            <h3 className="step-card-title">{s.title}</h3>
            <p className="step-card-desc">{s.desc}</p>

            {idx < STEPS.length - 1 && (
              <div className="step-connector-arrow">
                <FaArrowRight />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="timeline-footer-banner">
        <div className="footer-banner-text">
          <strong>Ready to take the step?</strong>
          <span>Join over 1,480 registered voluntary donors across Chhatrapati Sambhajinagar today.</span>
        </div>
        {onRegisterClick && (
          <button
            type="button"
            className="btn-timeline-register"
            onClick={onRegisterClick}
          >
            Become a Registered Donor <FaArrowRight />
          </button>
        )}
      </div>
    </section>
  );
}

