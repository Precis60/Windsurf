import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/secureApi';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    appointments: 0,
    customers: 0,
    projects: 0,
    tickets: 0
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // In a real app, you'd fetch these stats from your API
    // For now, showing placeholder data
    setStats({
      appointments: 12,
      customers: 45,
      projects: 8,
      tickets: 3
    });
  }, []);

  const quickActions = [
    {
      title: 'Calendar',
      description: 'Manage appointments and scheduling',
      icon: '📅',
      path: '/calendar',
      color: '#667eea'
    },
    {
      title: 'CRM',
      description: 'Customer relationship management',
      icon: '👥',
      path: '/crm',
      color: '#48bb78'
    },
    {
      title: 'Support Portal',
      description: 'Handle customer support tickets',
      icon: '🎧',
      path: '/support-portal',
      color: '#ed8936'
    },
    {
      title: 'Business Portal',
      description: 'Access business tools and reports',
      icon: '📊',
      path: '/portal',
      color: '#9f7aea'
    }
  ];

  const recentActivity = [
    { type: 'appointment', message: 'New appointment scheduled for tomorrow', time: '2 hours ago' },
    { type: 'customer', message: 'Customer John Smith updated profile', time: '4 hours ago' },
    { type: 'project', message: 'Office Network Installation project started', time: '1 day ago' },
    { type: 'ticket', message: 'Support ticket #123 resolved', time: '2 days ago' }
  ];

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '80vh'
    }}>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0',
          fontSize: '32px',
          fontWeight: '600'
        }}>
          Welcome back, {user?.first_name || 'Admin'}! 👋
        </h1>
        <p style={{ 
          margin: 0,
          fontSize: '18px',
          opacity: 0.9
        }}>
          🔒 Secure Business Management Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>📅</span>
            <h3 style={{ margin: 0, color: '#22314a' }}>Appointments</h3>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#667eea' }}>
            {stats.appointments}
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>This month</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>👥</span>
            <h3 style={{ margin: 0, color: '#22314a' }}>Customers</h3>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#48bb78' }}>
            {stats.customers}
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total active</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🔧</span>
            <h3 style={{ margin: 0, color: '#22314a' }}>Projects</h3>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#ed8936' }}>
            {stats.projects}
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>In progress</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🎧</span>
            <h3 style={{ margin: 0, color: '#22314a' }}>Support Tickets</h3>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#9f7aea' }}>
            {stats.tickets}
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Open tickets</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          color: '#22314a',
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e1e5e9',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ 
                    fontSize: '28px', 
                    marginRight: '15px',
                    background: action.color + '20',
                    padding: '10px',
                    borderRadius: '8px'
                  }}>
                    {action.icon}
                  </span>
                  <h3 style={{ 
                    margin: 0, 
                    color: action.color,
                    fontSize: '20px'
                  }}>
                    {action.title}
                  </h3>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ 
          color: '#22314a',
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          Recent Activity
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9',
          overflow: 'hidden'
        }}>
          {recentActivity.map((activity, index) => (
            <div 
              key={index}
              style={{
                padding: '20px',
                borderBottom: index < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#667eea',
                  marginRight: '15px'
                }}></div>
                <span style={{ color: '#22314a', fontSize: '14px' }}>
                  {activity.message}
                </span>
              </div>
              <span style={{ color: '#999', fontSize: '12px' }}>
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div style={{
        background: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: 0, 
          color: '#2e7d32',
          fontSize: '14px'
        }}>
          🔒 <strong>Enterprise Security Active:</strong> Your data is encrypted and secure. 
          Session expires in 24 hours for security.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
