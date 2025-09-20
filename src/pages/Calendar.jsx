import React, { useState, useEffect } from "react";
import { appointmentsService, authService } from '../services/secureApi';

const Calendar = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [currentView, setCurrentView] = useState('monthly');
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
    client: '',
    description: '',
    category: '',
    address: ''
  });

  // 20 appointment categories
  const categories = [
    'Site Survey', 'Network Installation', 'Cable Installation', 'Equipment Setup',
    'Maintenance', 'Repair', 'Consultation', 'Training', 'Safety Inspection',
    'Project Planning', 'Client Meeting ', 'Troubleshooting', 'Upgrade',
    'Testing & Commissioning', 'Documentation', 'Emergency Call',
    'Preventive Maintenance', 'System Integration', 'Quality Assurance', 'Follow-up'
  ];

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Load appointments from secure API
  useEffect(() => {
    if (isAuthenticated) {
      const loadAppointments = async () => {
        try {
          const response = await appointmentsService.getAll();
          const appointmentList = Array.isArray(response) ? response : response.appointments || [];
          setAppointments(appointmentList);
        } catch (error) {
          console.error('Error loading appointments:', error);
          setAppointments([]);
        }
      };
      
      loadAppointments();
    }
  }, [isAuthenticated]);

  // Add new appointment to secure API
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentsService.create(formData);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '' });
      setShowAddForm(false);
      // Reload appointments
      const response = await appointmentsService.getAll();
      const appointmentList = Array.isArray(response) ? response : response.appointments || [];
      setAppointments(appointmentList);
    } catch (error) {
      console.error('Error adding appointment:', error);
      alert('Failed to add appointment. Please try again.');
    }
  };

  // Edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment.id);
    setFormData(appointment);
    setShowAddForm(true);
  };

  // Update appointment in secure API
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentsService.update(editingAppointment, formData);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '' });
      setEditingAppointment(null);
      setShowAddForm(false);
      // Reload appointments
      const response = await appointmentsService.getAll();
      const appointmentList = Array.isArray(response) ? response : response.appointments || [];
      setAppointments(appointmentList);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    }
  };

  // Delete appointment from secure API
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentsService.delete(id);
        // Reload appointments
        const response = await appointmentsService.getAll();
        const appointmentList = Array.isArray(response) ? response : response.appointments || [];
        setAppointments(appointmentList);
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  // Generate calendar days for monthly view
  const generateMonthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generate week days for weekly view
  const generateWeeklyCalendar = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'monthly':
        newDate.setMonth(currentDate.getMonth() + direction);
        break;
      case 'weekly':
        newDate.setDate(currentDate.getDate() + (direction * 7));
        break;
      case 'daily':
        newDate.setDate(currentDate.getDate() + direction);
        break;
    }
    setCurrentDate(newDate);
  };

  // Generate 15-minute time slots for weekly/daily views
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const buttonStyle = {
    background: '#22314a',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 0.5rem'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: '#1a2538'
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-content" style={{ 
        padding: '2rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h2>Loading Calendar...</h2>
          <p>Please wait while we load your calendar data.</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show message to login
  if (!isAuthenticated) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h1 style={{ color: '#22314a', marginBottom: '1rem' }}>🔒 Calendar Access Required</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>
            Please log in to access the secure calendar management system.
          </p>
          
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#2e7d32',
              fontSize: '14px'
            }}>
              🔐 <strong>Secure Access:</strong> This calendar contains sensitive business information and requires authentication.
            </p>
          </div>

          <a 
            href="/login" 
            style={{
              background: '#22314a',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              display: 'inline-block'
            }}
          >
            Go to Login Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#22314a', margin: 0 }}>Calendar Management</h1>
        <button 
          onClick={() => {
            authService.logout();
            setIsAuthenticated(false);
            window.location.href = '/';
          }} 
          style={{...buttonStyle, background: '#dc3545'}}
        >
          Logout
        </button>
      </div>
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Manage appointments and view your schedule.</p>
      
      {/* View Toggle Buttons */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button 
          style={currentView === 'monthly' ? activeButtonStyle : buttonStyle}
          onClick={() => setCurrentView('monthly')}
        >
          Monthly View
        </button>
        <button 
          style={currentView === 'weekly' ? activeButtonStyle : buttonStyle}
          onClick={() => setCurrentView('weekly')}
        >
          Weekly View
        </button>
        <button 
          style={currentView === 'daily' ? activeButtonStyle : buttonStyle}
          onClick={() => setCurrentView('daily')}
        >
          Daily View
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        {/* Add Appointment Section */}
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef', width: '100%', maxWidth: '600px' }}>
          <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Appointment Management</h3>
          <button 
            style={buttonStyle}
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingAppointment(null);
              setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '' });
            }}
          >
            {showAddForm ? 'Cancel' : 'Add New Appointment'}
          </button>
          
          {showAddForm && (
            <form onSubmit={editingAppointment ? handleUpdateAppointment : handleAddAppointment} style={{ marginTop: '1rem' }}>
              <input
                type="text"
                placeholder="Appointment Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Client Name"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="time"
                placeholder="Start Time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="time"
                placeholder="End Time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Address/Location"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', margin: '0.25rem 0', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{...buttonStyle, flex: 1}}>
                  {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
                </button>
                {editingAppointment && (
                  <button 
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this appointment?')) {
                        handleDeleteAppointment(editingAppointment);
                      }
                    }}
                    style={{
                      ...buttonStyle, 
                      background: '#dc3545', 
                      flex: 1
                    }}
                  >
                    Delete Appointment
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

    {/* Calendar Template Views */}
    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => navigateDate(-1)} style={buttonStyle}>‹ Previous</button>
        <h3 style={{ color: '#22314a', margin: 0 }}>
          {currentView === 'monthly' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          {currentView === 'weekly' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          {currentView === 'daily' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        <button onClick={() => navigateDate(1)} style={buttonStyle}>Next ›</button>
      </div>

      {/* Monthly Calendar Grid */}
      {currentView === 'monthly' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {generateMonthlyCalendar().map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={index} style={{
                minHeight: '100px',
                padding: '0.25rem',
                background: isCurrentMonth ? 'white' : '#f8f9fa',
                border: isToday ? '2px solid #22314a' : '1px solid #dee2e6',
                opacity: isCurrentMonth ? 1 : 0.6
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{date.getDate()}</div>
                {dayAppointments.map(apt => (
                  <div key={apt.id} style={{
                    background: '#e3f2fd',
                    padding: '2px 4px',
                    margin: '1px 0',
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    border: '1px solid #2196f3'
                  }} onClick={() => {
                    setFormData(apt);
                    setEditingAppointment(apt.id);
                    setShowAddForm(true);
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{apt.time} - {apt.endTime} {apt.title}</div>
                    <div>{apt.client}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Calendar Grid */}
      {currentView === 'weekly' && (
        <div style={{ display: 'flex' }}>
          {/* Time slots column */}
          <div style={{ width: '80px', borderRight: '1px solid #dee2e6' }}>
            <div style={{ height: '40px', borderBottom: '1px solid #dee2e6', background: '#f8f9fa' }}></div>
            {generateTimeSlots().map((time, index) => (
              <div key={time} style={{
                height: '15px',
                fontSize: '0.7rem',
                padding: '0 0.25rem',
                borderBottom: index % 4 === 3 ? '1px solid #ccc' : '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9fa',
                justifyContent: 'flex-end'
              }}>
                {index % 4 === 0 ? time : ''}
              </div>
            ))}
          </div>
          {/* Days grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
            {generateWeeklyCalendar().map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={index} style={{
                  background: 'white',
                  border: '1px solid #dee2e6',
                  position: 'relative'
                }}>
                  <div style={{ 
                    height: '40px', 
                    fontWeight: 'bold', 
                    padding: '0.5rem', 
                    textAlign: 'center',
                    borderBottom: '1px solid #dee2e6',
                    background: '#f8f9fa'
                  }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </div>
                  <div style={{ height: `${15 * 96}px`, position: 'relative' }}>
                    {generateTimeSlots().map((time, timeIndex) => (
                      <div key={time} style={{
                        height: '15px',
                        borderBottom: timeIndex % 4 === 3 ? '1px solid #ccc' : '1px solid #f0f0f0'
                      }}></div>
                    ))}
                    {dayAppointments.map(apt => {
                      const [startHours, startMinutes] = apt.time.split(':').map(Number);
                      const [endHours, endMinutes] = apt.endTime.split(':').map(Number);
                      // Calculate position: each 15-minute slot = 15px
                      const startPosition = ((startHours * 60 + startMinutes) / 15) * 15;
                      const endPosition = ((endHours * 60 + endMinutes) / 15) * 15;
                      const height = Math.max(30, endPosition - startPosition);
                      return (
                        <div key={apt.id} style={{
                          position: 'absolute',
                          top: `${startPosition}px`,
                          left: '2px',
                          right: '2px',
                          height: `${height}px`,
                          fontSize: '0.7rem',
                          padding: '0.25rem',
                          background: '#22314a',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          zIndex: 1
                        }} onClick={() => {
                          setFormData(apt);
                          setEditingAppointment(apt.id);
                          setShowAddForm(true);
                        }}>
                          <div style={{ fontWeight: 'bold' }}>{apt.time} - {apt.endTime} {apt.title}</div>
                          <div>{apt.client}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Calendar Grid */}
      {currentView === 'daily' && (
        <div style={{ display: 'flex' }}>
          {/* Time slots column */}
          <div style={{ width: '80px', borderRight: '1px solid #dee2e6' }}>
            <div style={{ height: '40px', borderBottom: '1px solid #dee2e6', background: '#f8f9fa' }}></div>
            {generateTimeSlots().map((time, index) => (
              <div key={time} style={{
                height: '15px',
                fontSize: '0.7rem',
                padding: '0 0.25rem',
                borderBottom: index % 4 === 3 ? '1px solid #ccc' : '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9fa',
                justifyContent: 'flex-end'
              }}>
                {index % 4 === 0 ? time : ''}
              </div>
            ))}
          </div>
          {/* Single day grid */}
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'white',
              border: '1px solid #dee2e6',
              position: 'relative'
            }}>
              <div style={{ 
                height: '40px', 
                fontWeight: 'bold', 
                padding: '0.5rem', 
                textAlign: 'center',
                borderBottom: '1px solid #dee2e6',
                background: '#f8f9fa'
              }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ height: `${15 * 96}px`, position: 'relative' }}>
                {generateTimeSlots().map((time, timeIndex) => (
                  <div key={time} style={{
                    height: '15px',
                    borderBottom: timeIndex % 4 === 3 ? '1px solid #ccc' : '1px solid #f0f0f0'
                  }}></div>
                ))}
                {getAppointmentsForDate(currentDate).map(apt => {
                  const [startHours, startMinutes] = apt.time.split(':').map(Number);
                  const [endHours, endMinutes] = apt.endTime.split(':').map(Number);
                  // Calculate position: each 15-minute slot = 15px
                  const startPosition = ((startHours * 60 + startMinutes) / 15) * 15;
                  const endPosition = ((endHours * 60 + endMinutes) / 15) * 15;
                  const height = Math.max(30, endPosition - startPosition);
                  return (
                    <div key={apt.id} style={{
                      position: 'absolute',
                      top: `${startPosition}px`,
                      left: '2px',
                      right: '2px',
                      height: `${height}px`,
                      fontSize: '0.8rem',
                      padding: '0.5rem',
                      background: '#22314a',
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      zIndex: 1
                    }} onClick={() => {
                      setFormData(apt);
                      setEditingAppointment(apt.id);
                      setShowAddForm(true);
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{apt.time} - {apt.endTime} {apt.title}</div>
                      <div>{apt.client}</div>
                      <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{apt.category}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default Calendar;
