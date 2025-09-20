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

const authenticatedPages = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Calendar", path: "/calendar" },
  { name: "CRM", path: "/crm" },
  { name: "Support Portal", path: "/support-portal" },
  { name: "Portal", path: "/portal" }
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <Link className="logo" to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
        Precision Cabling & Automation
      </Link>
      <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)}>
        ☰
      </button>
      {menuOpen && (
        <nav className="nav-menu">
          <ul>
            {pages.map((page) => (
              <li key={page.path} onClick={() => setMenuOpen(false)}>
                <Link to={page.path}>{page.name}</Link>
              </li>
            ))}
            <li onClick={() => setMenuOpen(false)}>
              <Link to="/calendar">Calendar</Link>
            </li>
            <li onClick={() => setMenuOpen(false)}>
              <Link to="/crm">CRM</Link>
            </li>
            <li onClick={() => setMenuOpen(false)}>
              <Link to="/support-portal">Support Portal</Link>
            </li>
            <li onClick={() => setMenuOpen(false)}>
              <Link to="/portal">Portal</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
