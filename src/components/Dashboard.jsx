import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/index.js';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    appointments: 0,
    projects: 0,
    tickets: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent appointments
      const appointmentsResponse = await appointmentService.getAppointments({ 
        limit: 5,
        status: 'scheduled' 
      });
      
      setRecentAppointments(appointmentsResponse.appointments || []);
      setStats({
        appointments: appointmentsResponse.totalAppointments || 0,
        projects: 0, // Will be loaded when project service is connected
        tickets: 0   // Will be loaded when support service is connected
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.firstName}!</h1>
          <p>Here's what's happening with your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon appointments">📅</div>
            <div className="stat-info">
              <h3>{stats.appointments}</h3>
              <p>Active Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon projects">🔧</div>
            <div className="stat-info">
              <h3>{stats.projects}</h3>
              <p>Active Projects</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon tickets">🎫</div>
            <div className="stat-info">
              <h3>{stats.tickets}</h3>
              <p>Open Support Tickets</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>Recent Appointments</h2>
          {recentAppointments.length > 0 ? (
            <div className="appointments-list">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-info">
                    <h3>{appointment.title}</h3>
                    <p className="appointment-date">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                    <p className="appointment-description">
                      {appointment.description}
                    </p>
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No upcoming appointments scheduled.</p>
              <button className="primary-button">Schedule Appointment</button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-button">
              <span className="action-icon">📅</span>
              <span>Schedule Appointment</span>
            </button>
            
            <button className="action-button">
              <span className="action-icon">💬</span>
              <span>Contact Support</span>
            </button>
            
            <button className="action-button">
              <span className="action-icon">📊</span>
              <span>View Projects</span>
            </button>
            
            <button className="action-button">
              <span className="action-icon">📋</span>
              <span>Request Quote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
