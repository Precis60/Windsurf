import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/secureApi';
import SecurityControl from '../components/SecurityControl';
import './Security.css';

const Security = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      
      if (!authenticated) {
        // Redirect to login if not authenticated
        navigate('/login');
        return;
      }

      // Check if user has permission (admin or staff only)
      if (user.role !== 'admin' && user.role !== 'staff') {
        alert('Access denied. Security controls are only available to staff and administrators.');
        navigate('/');
        return;
      }

      setIsAuthenticated(authenticated);
      setCurrentUser(user);
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="security-page">
        <div className="security-loading">
          <div className="spinner"></div>
          <p>Loading security controls...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="security-page">
      <div className="security-header-bar">
        <div className="security-title">
          <h1>🔒 Security System Control</h1>
          <p>Manage alarm areas and security zones</p>
        </div>
        <div className="security-user-info">
          <span className="user-name">
            👤 {currentUser?.firstName} {currentUser?.lastName}
          </span>
          <span className="user-role">{currentUser?.role}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="security-info-banner">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>Security Notice:</strong> All arm/disarm actions are logged. 
          You will need to enter your security code to perform any actions.
        </div>
      </div>

      <div className="security-grid">
        {/* Main Areas */}
        <div className="security-section">
          <h2>Main Building</h2>
          <div className="area-grid">
            <SecurityControl areaId={1} areaName="Reception" />
            <SecurityControl areaId={2} areaName="Office Floor 1" />
            <SecurityControl areaId={3} areaName="Office Floor 2" />
          </div>
        </div>

        {/* Warehouse Areas */}
        <div className="security-section">
          <h2>Warehouse</h2>
          <div className="area-grid">
            <SecurityControl areaId={4} areaName="Warehouse Main" />
            <SecurityControl areaId={5} areaName="Loading Dock" />
            <SecurityControl areaId={6} areaName="Storage Area" />
          </div>
        </div>

        {/* Perimeter */}
        <div className="security-section">
          <h2>Perimeter</h2>
          <div className="area-grid">
            <SecurityControl areaId={7} areaName="Parking Lot" />
            <SecurityControl areaId={8} areaName="Exterior Gates" />
          </div>
        </div>
      </div>

      <div className="security-footer-info">
        <div className="footer-section">
          <h3>Quick Guide</h3>
          <ul>
            <li><strong>Arm Away:</strong> Full protection - all sensors active</li>
            <li><strong>Arm Stay:</strong> Perimeter only - motion sensors off</li>
            <li><strong>Arm Night:</strong> Night mode - selected sensors active</li>
            <li><strong>Disarm:</strong> Turn off all sensors</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Emergency Contacts</h3>
          <ul>
            <li><strong>Security Company:</strong> 1300 XXX XXX</li>
            <li><strong>Police:</strong> 000</li>
            <li><strong>Site Manager:</strong> 0413 729 663</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Security;
