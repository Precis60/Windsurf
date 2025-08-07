import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/pca-logo.png";
import "./Header.css";

const pages = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Consultation", path: "/consultation" },
  { name: "Contact", path: "/contact" },
  { name: "Company Policies", path: "/company-policies" },
  { name: "About Us", path: "/about-us" },
];

const authenticatedPages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Calendar", path: "/calendar" },
  { name: "CRM", path: "/crm" },
  { name: "Support Portal", path: "/support-portal" },
  { name: "Portal", path: "/portal" }
];

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const menuPages = user ? [...pages, ...authenticatedPages] : pages;

  return (
    <header className="header">
      <Link 
        className="logo" 
        to={user ? "/dashboard" : "/"} 
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
      >
        <img 
          src={logo} 
          alt="Precision Cabling & Automation Logo" 
          style={{ height: '3.2rem', width: 'auto', marginRight: '16px', display: 'block' }} 
        />
        Precision Cabling & Automation
      </Link>

      <div className="header-actions">
        {user ? (
          <div className="user-menu-container">
            <button 
              className="user-menu-btn" 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <span className="user-name">
                {user.firstName} {user.lastName}
              </span>
              <span className="user-avatar">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </button>
            
            {userMenuOpen && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <p className="user-email">{user.email}</p>
                  <span className="user-role">{user.role}</span>
                </div>
                <ul>
                  <li>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="login-btn">
            Login
          </Link>
        )}

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <nav className="nav-menu">
          <ul>
            {menuPages.map((page) => (
              <li key={page.path} onClick={() => setMenuOpen(false)}>
                <Link to={page.path}>{page.name}</Link>
              </li>
            ))}
            {!user && (
              <li onClick={() => setMenuOpen(false)}>
                <Link to="/auth" className="mobile-login">Login / Register</Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
