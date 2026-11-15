import React from 'react';
import { FaQuoteLeft, FaHeart, FaCheckCircle, FaStar } from 'react-icons/fa';
import { TESTIMONIALS_DATA } from '../data/mockData';

export default function HeroStoriesSection() {
  return (
    <section className="stories-section">
      <div className="section-head-center">
        <span className="badge-subhead">
          <FaHeart /> Real Community Impact
        </span>
        <h2 className="section-main-title">
          Stories That <span className="highlight-red">Touch Lives</span>
        </h2>
        <p className="section-subtitle">
          Behind every unit of blood donated is a daughter, mother, father, or friend whose life was saved right here in Chhatrapati Sambhajinagar.
        </p>
      </div>

      <div className="stories-grid">
        {TESTIMONIALS_DATA.map((story) => (
          <div key={story.id} className="story-card">
            <div className="story-stars-row">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="star-icon" />
              ))}
            </div>

            <FaQuoteLeft className="quote-watermark" />
            <p className="story-quote">"{story.quote}"</p>

            <div className="story-author-block">
              <div
                className="story-avatar"
                style={{ background: story.avatarBg }}
              >
                {story.author.charAt(0)}
              </div>
              <div className="story-author-info">
                <div className="author-name-row">
                  <strong>{story.author}</strong>
                  {story.verified && (
                    <span className="verified-badge" title="Verified Testimonial">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>
                <span className="author-role">{story.role}</span>
                <span className="author-blood-tag">Blood Group: <strong>{story.bloodGroup}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

