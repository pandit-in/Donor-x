import React, { useState } from 'react';
import { 
  FaTimes, 
  FaBook, 
  FaCode, 
  FaDatabase, 
  FaServer, 
  FaShieldAlt, 
  FaGraduationCap,
  FaCheckCircle
} from 'react-icons/fa';

export default function ProjectDocsModal({ isOpen, onClose }) {
  const [activeDocTab, setActiveDocTab] = useState('abstract'); // 'abstract' | 'architecture' | 'schema' | 'modules' | 'viva'

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide project-doc-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="modal-title-sos">
            <FaGraduationCap style={{ color: '#38bdf8' }} /> Project Documentation &amp; Technical Viva Guide
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Docs Tab Selector */}
          <div className="project-docs-tabs">
            <button
              type="button"
              className={`doc-tab-btn ${activeDocTab === 'abstract' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('abstract')}
            >
              <FaBook /> Abstract &amp; Problem
            </button>

            <button
              type="button"
              className={`doc-tab-btn ${activeDocTab === 'architecture' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('architecture')}
            >
              <FaServer /> System Architecture
            </button>

            <button
              type="button"
              className={`doc-tab-btn ${activeDocTab === 'modules' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('modules')}
            >
              <FaCode /> Core Modules
            </button>

            <button
              type="button"
              className={`doc-tab-btn ${activeDocTab === 'schema' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('schema')}
            >
              <FaDatabase /> Database Schemas
            </button>

            <button
              type="button"
              className={`doc-tab-btn ${activeDocTab === 'viva' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('viva')}
            >
              <FaGraduationCap /> Viva / Q&amp;A
            </button>
          </div>

          <div className="doc-content-box">
            {activeDocTab === 'abstract' && (
              <div className="doc-section">
                <h3>1. Executive Abstract</h3>
                <p>
                  <strong>DonorX</strong> is an emergency-driven, community-centric blood donation and transfusion assistance platform designed specifically for the healthcare ecosystem of <strong>Chhatrapati Sambhajinagar (Aurangabad), Maharashtra</strong>.
                </p>
                <p>
                  During traumatic accidents on key transit corridors (e.g., Jalna Road, Beed Bypass, Dhule Highway) and high-risk surgical operations at central institutions (Ghati GMCH, MGM Hospital, Dr. Hedgewar Hospital), access to compatible blood within the <strong>Golden Hour (first 60 minutes)</strong> is a matter of life and death.
                </p>

                <h4 style={{ color: '#ff6b7e', marginTop: 14 }}>The Core Problems Solved:</h4>
                <ul className="doc-bullet-list">
                  <li><strong>Fragmented Inventory:</strong> Hospital blood banks lack a unified emergency alert system to reach voluntary donors in immediate geographic proximity.</li>
                  <li><strong>Slow Outreach:</strong> WhatsApp forward chains cause rumors and delayed matching without compatibility verification.</li>
                  <li><strong>Privacy &amp; Harassment:</strong> Female and student voluntary donors hesitate to share personal phone numbers publicly on social boards.</li>
                  <li><strong>Donor Motivation:</strong> Lack of digital credentials, recognition tiers, and post-donation tracking.</li>
                </ul>
              </div>
            )}

            {activeDocTab === 'architecture' && (
              <div className="doc-section">
                <h3>2. Full Stack Technology Architecture</h3>
                <div className="arch-tech-grid">
                  <div className="arch-block">
                    <h4>Frontend Layer</h4>
                    <ul>
                      <li><strong>React 19 (SPA):</strong> High-performance virtual DOM with concurrent rendering</li>
                      <li><strong>Vite 8:</strong> Sub-millisecond HMR build toolchain</li>
                      <li><strong>Web Audio API:</strong> Synthesized sonar radar pings, emergency alerts, and 105 BPM CPR metronome</li>
                      <li><strong>Glassmorphism UX:</strong> Custom dark medical dashboard with responsive mobile dock</li>
                    </ul>
                  </div>

                  <div className="arch-block">
                    <h4>Backend API Layer</h4>
                    <ul>
                      <li><strong>Node.js &amp; Express 5:</strong> Modular RESTful micro-routes</li>
                      <li><strong>JWT (JSON Web Tokens):</strong> Stateless secure authorization with 32+ char secret</li>
                      <li><strong>Bcrypt.js:</strong> Salted password hashing (10 salt rounds)</li>
                      <li><strong>Rate Limiting &amp; CORS:</strong> Express rate limiter preventing brute-force &amp; DDoS</li>
                    </ul>
                  </div>

                  <div className="arch-block">
                    <h4>Database &amp; Data Layer</h4>
                    <ul>
                      <li><strong>MongoDB:</strong> NoSQL document store with ACID transaction capability</li>
                      <li><strong>Mongoose ODM:</strong> Strict schema validation, indexing, and cascade references</li>
                      <li><strong>e-RaktKosh Integration:</strong> Sourced verified district blood banks &amp; civil centres</li>
                      <li><strong>Hybrid Offline Fallback:</strong> Resilient reactive client engine when offline</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeDocTab === 'modules' && (
              <div className="doc-section">
                <h3>3. Key Novel Engineering Modules</h3>
                <div className="module-item">
                  <h4>A. Transfusion Compatibility &amp; Antigen Matrix</h4>
                  <p>
                    Mathematical mapping of red blood cell antigens (A, B, Rh) ensuring 100% adherence to clinical ABO/Rh transfusion rules, identifying Universal Red Cell Donor (O-) and Universal Recipient (AB+).
                  </p>
                </div>

                <div className="module-item">
                  <h4>B. Dynamic Sonar Radar Algorithm</h4>
                  <p>
                    Concentric radar coordinates computed via trigonometric polar mapping:
                    <code>x = 50 + r * cos(angle); y = 50 + r * sin(angle)</code> with audio pulse synthesis.
                  </p>
                </div>

                <div className="module-item">
                  <h4>C. 105 BPM Emergency CPR Metronome</h4>
                  <p>
                    Precision Web Audio synthesizer oscillating triangle wave pulses at 105 BPM with visual cardial rhythm matching AHA guidelines.
                  </p>
                </div>

                <div className="module-item">
                  <h4>D. Two-Tier Privacy &amp; Consent Dispatch</h4>
                  <p>
                    Donor contact numbers are never exposed in public search results. Phone numbers are revealed exclusively when an available verified donor explicitly accepts an emergency request.
                  </p>
                </div>
              </div>
            )}

            {activeDocTab === 'schema' && (
              <div className="doc-section">
                <h3>4. Database Entities &amp; Relations (MongoDB)</h3>
                <div className="schema-table-box">
                  <table className="schema-table">
                    <thead>
                      <tr>
                        <th>Collection</th>
                        <th>Primary Fields</th>
                        <th>Key Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>User</strong></td>
                        <td>_id, name, email, password, role ('donor' | 'seeker' | 'admin'), emailNotifications</td>
                        <td>Authentication &amp; role-based access control</td>
                      </tr>
                      <tr>
                        <td><strong>Donor</strong></td>
                        <td>user (FK), name, bloodGroup, age, weight, area, isAvailable, verificationStatus, donationsCount</td>
                        <td>Verified donor registry &amp; availability state</td>
                      </tr>
                      <tr>
                        <td><strong>BloodRequest</strong></td>
                        <td>requester (FK), bloodGroup, unitsNeeded, hospital, urgency, neededBy, status, donorResponses[]</td>
                        <td>Active emergency requests &amp; responder tracking</td>
                      </tr>
                      <tr>
                        <td><strong>DonorResponse</strong></td>
                        <td>request (FK), donor (FK), status ('Accepted' | 'Declined'), eta, isConnected</td>
                        <td>Independent responder records with ETAs</td>
                      </tr>
                      <tr>
                        <td><strong>BloodBank</strong></td>
                        <td>name, address, phone, inventory{}, isVerified, category, sourceUrl</td>
                        <td>Sourced hospital &amp; blood centre directory</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeDocTab === 'viva' && (
              <div className="doc-section">
                <h3>5. Viva Voce &amp; Evaluation Quick Q&amp;A</h3>
                <div className="viva-qa-block">
                  <strong>Q: What makes DonorX different from existing blood bank websites?</strong>
                  <p>A: Existing government portals are static inventory lists. DonorX is an active 24x7 emergency response network that matches requests with live voluntary donors via real-time ETAs, radar positioning, and privacy-shielded calls.</p>
                </div>

                <div className="viva-qa-block">
                  <strong>Q: How do you handle donor data privacy?</strong>
                  <p>A: Donors can toggle their contact sharing. Contact numbers and home addresses are never exposed in public search. Only when an emergency match occurs and both parties consent are direct calls initiated.</p>
                </div>

                <div className="viva-qa-block">
                  <strong>Q: What happens if MongoDB or internet is down during a critical emergency?</strong>
                  <p>A: DonorX incorporates a dual-mode engine: when cloud API is connected, it uses MongoDB; if internet or local database is interrupted, it seamlessly uses the reactive local engine with cached Sambhajinagar data so emergency helplines, compatibility rules, CPR metronome, and local camp passes remain fully operational.</p>
                </div>
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="btn-header-sos" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}
            onClick={onClose}
          >
            <FaCheckCircle /> Done Reviewing Project Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
