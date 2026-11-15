import { Link } from 'react-router-dom';
import { FaTint, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              🩸 RaktaSetu
            </div>
            <p className="footer-desc">
              Connecting blood donors and recipients across Chhatrapati Sambhaji Nagar. 
              Every drop counts. Be the reason someone lives.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><FaFacebook /></a>
              <a href="#" className="social-link"><FaInstagram /></a>
              <a href="#" className="social-link"><FaWhatsapp /></a>
              <a href="#" className="social-link"><FaTwitter /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/find-donor" className="footer-link">Find Donor</Link>
              <Link to="/register-donor" className="footer-link">Become a Donor</Link>
              <Link to="/request" className="footer-link">Request Blood</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4>Blood Groups</h4>
            <div className="footer-links">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <Link key={bg} to={`/find-donor?bloodGroup=${bg}`} className="footer-link">
                  {bg} Donors
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-links">
              <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt style={{ color: '#E74C3C' }} />
                Chhatrapati Sambhaji Nagar, MH
              </span>
              <a href="tel:+91-0240-0000000" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPhone style={{ color: '#E74C3C' }} />
                Emergency: 108
              </a>
              <a href="mailto:raktasetu@csn.gov.in" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaEnvelope style={{ color: '#E74C3C' }} />
                raktasetu@csn.in
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 RaktaSetu — Chhatrapati Sambhaji Nagar. Made with <span>❤️</span> to save lives.</p>
          <p>🩸 Every donation can save up to 3 lives</p>
        </div>
      </div>
    </footer>
  );
}
