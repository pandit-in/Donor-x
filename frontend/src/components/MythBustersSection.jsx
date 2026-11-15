import React, { useState } from 'react';
import { FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaLightbulb, FaUndo } from 'react-icons/fa';
import { MYTH_FACTS_DATA } from '../data/mockData';

export default function MythBustersSection() {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="myths-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaLightbulb /> Fact vs. Fiction
        </span>
        <h2 className="section-main-title">
          Blood Donation <span className="highlight-red">Myth Busters</span>
        </h2>
        <p className="section-subtitle">
          Fear and misconceptions hold back thousands of eligible donors. Tap any card below to reveal the medical reality backed by WHO and Indian Red Cross clinical guidelines.
        </p>
      </div>

      <div className="myths-grid">
        {MYTH_FACTS_DATA.map((item) => {
          const isFlipped = Boolean(flippedCards[item.id]);
          return (
            <div
              key={item.id}
              className={`myth-card ${isFlipped ? 'is-revealed' : ''}`}
              onClick={() => toggleFlip(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip(item.id);
                }
              }}
              aria-label={`Myth: ${item.myth}. Tap to reveal fact.`}
            >
              <div className="card-flipper-inner">
                {/* Front Side: Myth */}
                <div className="card-face card-front">
                  <div className="card-tag-row">
                    <span className="category-pill">{item.category}</span>
                    <span className="myth-flag">
                      <FaTimesCircle /> COMMON MYTH
                    </span>
                  </div>

                  <div className="myth-text-wrap">
                    <p className="myth-statement">"{item.myth}"</p>
                  </div>

                  <div className="tap-hint">
                    <FaUndo /> Tap to reveal clinical fact
                  </div>
                </div>

                {/* Back Side: Fact */}
                <div className="card-face card-back">
                  <div className="card-tag-row">
                    <span className="category-pill">{item.category}</span>
                    <span className="fact-flag">
                      <FaCheckCircle /> MEDICAL REALITY
                    </span>
                  </div>

                  <div className="fact-text-wrap">
                    <p className="fact-statement">{item.fact}</p>
                  </div>

                  <div className="tap-hint flip-back">
                    <FaUndo /> Tap to flip back
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

