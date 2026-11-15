import React from 'react';
import { FaBolt, FaArrowRight } from 'react-icons/fa';

export default function UrgentTicker({ activeSos, onRespond }) {
  if (!activeSos) return null;

  return (
    <aside className="urgent-ticker-bar" aria-label="Emergency blood ticker">
      <div className="ticker-left">
        <span className="ticker-tag">
          <FaBolt /> URGENT SOS
        </span>
        <div className="ticker-message">
          <b>[{activeSos.bloodGroup}]</b> Needed at {activeSos.hospital} ({activeSos.urgency})
        </div>
      </div>

      <button className="btn-ticker-respond" onClick={() => onRespond(activeSos)}>
        Respond <FaArrowRight />
      </button>
    </aside>
  );
}
