import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import './footer.css';

const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="library-footer">
      <div className="footer-container">
        <div className="footer-main">

          <div className="footer-column">
            <h3 className="footer-heading">AGC Library</h3>
            <p className="footer-about-text">
              The College Library serves as the academic hub of our institution,
              providing resources and services to support learning, teaching,
              and research for our students and faculty.
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" className="social-icon" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" className="social-icon" aria-label="LinkedIn"><FiLinkedin /></a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link" onClick={scrollTop}>Home</Link></li>
              <li><Link to="/books" className="footer-link" onClick={scrollTop}>Books</Link></li>
              <li><Link to="/category" className="footer-link" onClick={scrollTop}>Categories</Link></li>
              <li><Link to="/aboutus" className="footer-link" onClick={scrollTop}>About Us</Link></li>
              <li><Link to="/contactus" className="footer-link" onClick={scrollTop}>Contact</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="footer-contact-info">
              <li className="contact-item">
                <FiMapPin className="contact-icon" />
                <span>123 College Avenue, Academic City, AC 12345</span>
              </li>
              <li className="contact-item">
                <FiMail className="contact-icon" />
                <span>library@college.edu</span>
              </li>
              <li className="contact-item">
                <FiPhone className="contact-icon" />
                <span>(123) 456-7890</span>
              </li>
              <li className="contact-item">
                <FiClock className="contact-icon" />
                <div>
                  <p>Mon–Fri: 8:00 AM – 8:00 PM</p>
                  <p>Sat–Sun: 10:00 AM – 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} AGC College Library. All rights reserved.
          </div>
          <div className="footer-legal">
            <Link to="/privacy" className="legal-link" onClick={scrollTop}>Privacy Policy</Link>
            <Link to="/terms" className="legal-link" onClick={scrollTop}>Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;