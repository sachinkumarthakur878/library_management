import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="user-navbar">
      <div className="user-navbar__inner">
        <Link className="user-navbar__brand" to="/">
          <span className="brand-icon">📚</span>
          <span className="brand-text">AKTU Library</span>
        </Link>

        <button
          className={`user-navbar__hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>

        <div className={`user-navbar__links ${menuOpen ? "show" : ""}`}>
          <ul className="user-navbar__nav">
            {[
              { to: "/", label: "Home" },
              { to: "/books", label: "Books" },
              { to: "/category", label: "Categories" },
              { to: "/aboutus", label: "About" },
              { to: "/contactus", label: "Contact" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  className={`user-navbar__link ${isActive(to) ? "active" : ""}`}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="user-navbar__right">
            {token ? (
              <li className="user-navbar__profile-wrap" ref={dropdownRef}>
                <button
                  className="user-navbar__profile-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="user-navbar__avatar">U</div>
                  <span>Profile</span>
                  <svg
                    viewBox="0 0 12 8"
                    fill="none"
                    width="10"
                    className={`dropdown-arrow ${dropdownOpen ? "rotated" : ""}`}
                  >
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="user-navbar__dropdown">
                    <Link
                      className="user-navbar__drop-item"
                      to="/user"
                      onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
                    >
                      👤 My Profile
                    </Link>
                    <hr className="user-navbar__divider" />
                    <button
                      className="user-navbar__drop-item user-navbar__drop-item--logout"
                      onClick={() => { handleLogout(); setDropdownOpen(false); }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li>
                  <Link className="user-navbar__login-btn" to="/login" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link className="user-navbar__signup-btn" to="/register" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}