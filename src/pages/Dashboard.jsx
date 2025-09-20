import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService, appointmentsService, customersService, projectsService, supportService } from '../services/secureApi';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    appointments: 0,
    customers: 0,
    projects: 0,
    tickets: 0
  });
  const [recentData, setRecentData] = useState({
    appointments: [],
    customers: [],
    projects: [],
    tickets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all services
      const [appointments, customers, projects, tickets] = await Promise.allSettled([
        appointmentsService.getAll(),
        customersService.getAll(),
        projectsService.getAll(),
        supportService.getTickets()
      ]);

      // Process appointments
      const appointmentData = appointments.status === 'fulfilled' ? appointments.value : [];
      const appointmentList = Array.isArray(appointmentData) ? appointmentData : appointmentData.appointments || [];

      // Process customers
      const customerData = customers.status === 'fulfilled' ? customers.value : [];
      const customerList = Array.isArray(customerData) ? customerData : customerData.customers || [];

      // Process projects
      const projectData = projects.status === 'fulfilled' ? projects.value : [];
      const projectList = Array.isArray(projectData) ? projectData : projectData.projects || [];

      // Process tickets
      const ticketData = tickets.status === 'fulfilled' ? tickets.value : [];
      const ticketList = Array.isArray(ticketData) ? ticketData : ticketData.tickets || [];

      // Update stats
      setStats({
        appointments: appointmentList.length,
        customers: customerList.length,
        projects: projectList.length,
        tickets: ticketList.filter(ticket => ticket.status === 'open' || ticket.status === 'in_progress').length
      });

      // Update recent data (last 5 items)
      setRecentData({
        appointments: appointmentList.slice(0, 3),
        customers: customerList.slice(0, 3),
        projects: projectList.slice(0, 3),
        tickets: ticketList.slice(0, 3)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Keep placeholder data if API calls fail
      setStats({
        appointments: 0,
        customers: 0,
        projects: 0,
        tickets: 0
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Generate recent activity from real data
  const generateRecentActivity = () => {
    const activities = [];
    
    // Add recent appointments
    recentData.appointments.forEach(appointment => {
      activities.push({
        type: 'appointment',
        message: `Appointment: ${appointment.title || 'New appointment scheduled'}`,
        time: appointment.created_at ? new Date(appointment.created_at).toLocaleDateString() : 'Recently',
        icon: '📅',
        color: '#667eea'
      });
    });

    // Add recent customers
    recentData.customers.forEach(customer => {
      activities.push({
        type: 'customer',
        message: `New customer: ${customer.first_name} ${customer.last_name}`,
        time: customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'Recently',
        icon: '👥',
        color: '#48bb78'
      });
    });

    // Add recent projects
    recentData.projects.forEach(project => {
      activities.push({
        type: 'project',
        message: `Project: ${project.name || 'New project created'}`,
        time: project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Recently',
        icon: '🔧',
        color: '#ed8936'
      });
    });

    // Add recent tickets
    recentData.tickets.forEach(ticket => {
      activities.push({
        type: 'ticket',
        message: `Support: ${ticket.subject || 'New support ticket'}`,
        time: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'Recently',
        icon: '🎧',
        color: '#9f7aea'
      });
    });

    // Sort by most recent and limit to 6 items
    return activities.slice(0, 6);
  };

  const recentActivity = generateRecentActivity();

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Appointments Card */}
        <Link to="/calendar" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e1e5e9',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>📅</span>
                <h3 style={{ margin: 0, color: '#22314a' }}>Appointments</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#667eea', fontWeight: '500' }}>MANAGE →</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#667eea' }}>
              {loading ? '...' : stats.appointments}
            </p>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total scheduled</p>
            {recentData.appointments.length > 0 && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Latest: {recentData.appointments[0].title || 'Recent appointment'}
              </div>
            )}
          </div>
        </Link>

        {/* Customers Card */}
        <Link to="/crm" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e1e5e9',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>👥</span>
                <h3 style={{ margin: 0, color: '#22314a' }}>Customers</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#48bb78', fontWeight: '500' }}>MANAGE →</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#48bb78' }}>
              {loading ? '...' : stats.customers}
            </p>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total customers</p>
            {recentData.customers.length > 0 && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Latest: {recentData.customers[0].first_name || 'Recent customer'}
              </div>
            )}
          </div>
        </Link>

        {/* Projects Card */}
        <Link to="/portal" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e1e5e9',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>🔧</span>
                <h3 style={{ margin: 0, color: '#22314a' }}>Projects</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#ed8936', fontWeight: '500' }}>MANAGE →</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#ed8936' }}>
              {loading ? '...' : stats.projects}
            </p>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Active projects</p>
            {recentData.projects.length > 0 && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Latest: {recentData.projects[0].name || 'Recent project'}
              </div>
            )}
          </div>
        </Link>

        {/* Support Tickets Card */}
        <Link to="/support-portal" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e1e5e9',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>🎧</span>
                <h3 style={{ margin: 0, color: '#22314a' }}>Support Tickets</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#9f7aea', fontWeight: '500' }}>MANAGE →</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#9f7aea' }}>
              {loading ? '...' : stats.tickets}
            </p>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Open tickets</p>
            {recentData.tickets.length > 0 && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Latest: {recentData.tickets[0].subject || 'Recent ticket'}
              </div>
            )}
          </div>
        </Link>
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
          {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: activity.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <span style={{ fontSize: '14px' }}>{activity.icon}</span>
                </div>
                <span style={{ color: '#22314a', fontSize: '14px' }}>
                  {activity.message}
                </span>
              </div>
              <span style={{ color: '#999', fontSize: '12px' }}>
                {activity.time}
              </span>
            </div>
          )) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              <p style={{ margin: 0, fontSize: '16px' }}>
                📊 No recent activity yet
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                Start by creating appointments, adding customers, or managing projects
              </p>
            </div>
          )}
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
