import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const pages = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Consultation", path: "/consultation" },
  { name: "Contact", path: "/contact" },
  { name: "Company Policies", path: "/company-policies" },
  { name: "About Us", path: "/about-us" },
];

const staffPages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Company Portal", path: "/portal" }
];

const customerPages = [
  { name: "Client Portal", path: "/client-portal" },
];

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  const isStaff = user && (user.role === 'admin' || user.role === 'staff');
  const authedSet = isStaff ? staffPages : customerPages;
  const menuPages = user ? [...pages, ...authedSet] : pages;

  return (
    <header className="header">
      <Link className="logo" to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
        Precision Cabling & Automation
      </Link>
      
      <div className="header-actions">
        {user ? (
          <div className="user-menu-container">
            <button 
              className="user-menu-btn" 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                background: 'none',
                border: '1px solid #667eea',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span className="user-name">
                {user.first_name} {user.last_name}
              </span>
              <span className="user-avatar" style={{
                background: '#667eea',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </button>
            
            {userMenuOpen && (
              <div className="user-menu" style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px 0',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000
              }}>
                <div className="user-menu-header" style={{ padding: '8px 16px', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{user.email}</p>
                  <span style={{ fontSize: '12px', color: '#999', textTransform: 'capitalize' }}>{user.role}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#dc3545'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            background: '#667eea',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
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
            {pages.map((page) => (
              <li key={page.path} onClick={() => setMenuOpen(false)}>
                <Link to={page.path}>{page.name}</Link>
              </li>
            ))}
            {user && (isStaff ? staffPages : customerPages).map((page) => (
              <li key={page.path} onClick={() => setMenuOpen(false)}>
                <Link to={page.path}>{page.name}</Link>
              </li>
            ))}
            {!user && (
              <li onClick={() => setMenuOpen(false)}>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
