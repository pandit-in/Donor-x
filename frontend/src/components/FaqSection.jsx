import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FAQ_DATA } from '../data/mockData';

export default function FaqSection() {
  const [openId, setOpenId] = useState(1);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaQuestionCircle /> Clear Answers
        </span>
        <h2 className="section-main-title">
          Frequently Asked <span className="highlight-red">Questions</span>
        </h2>
        <p className="section-subtitle">
          Everything you need to know about eligibility, blood testing, government norms, and donation safety.
        </p>
      </div>

      <div className="faq-list">
        {FAQ_DATA.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`faq-item-card ${isOpen ? 'active' : ''}`}
            >
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleFaq(item.id)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-toggle-icon">
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              {isOpen && (
                <div className="faq-answer-panel">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

