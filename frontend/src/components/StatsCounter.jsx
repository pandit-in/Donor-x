import { useEffect, useRef, useState } from 'react';

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsCounter() {
  const stats = [
    { icon: '🩸', num: 1250, suffix: '+', label: 'Registered Donors', color: '#E74C3C' },
    { icon: '💉', num: 3800, suffix: '+', label: 'Lives Saved', color: '#F39C12' },
    { icon: '🏥', num: 45, suffix: '+', label: 'Partner Hospitals', color: '#3498DB' },
    { icon: '📍', num: 32, suffix: '', label: 'City Wards Covered', color: '#27AE60' },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-number" style={{ color: s.color }}>
                <Counter target={s.num} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
