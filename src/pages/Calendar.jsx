import React, { useState, useEffect } from "react";
import { appointmentsService } from '../services/firebaseService';

const Calendar = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
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

  // Authentication functions
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Hardcoded credentials for security (in production, this would be handled by a backend)
    const validCredentials = {
      username: 'admin',
      password: 'calendar2025'
    };
    
    if (loginData.username === validCredentials.username && loginData.password === validCredentials.password) {
      setIsAuthenticated(true);
      // Store in sessionStorage (expires when browser session ends)
      sessionStorage.setItem('calendarAuth', 'true');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
    sessionStorage.removeItem('calendarAuth');
  };

  // Clear authentication when component unmounts or page is left
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('calendarAuth');
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.removeItem('calendarAuth');
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sessionStorage.removeItem('calendarAuth');
    };
  }, []);

  // Load appointments from Firebase
  useEffect(() => {
    if (isAuthenticated) {
      const loadAppointments = async () => {
        try {
          const firebaseAppointments = await appointmentsService.getAll();
          if (firebaseAppointments.length > 0) {
            setAppointments(firebaseAppointments);
          } else {
            // Add default appointments to Firebase if none exist
            const defaultAppointments = [
              { title: 'Client Site Survey', client: 'ABC Manufacturing', date: '2025-01-20', time: '10:00', endTime: '12:00', description: 'Initial site assessment for network infrastructure', category: 'Site Survey', address: '123 Industrial Blvd, Manufacturing District' },
              { title: 'Network Infrastructure Install', client: 'Office Complex', date: '2025-01-25', time: '09:00', endTime: '17:00', description: 'Complete network setup and configuration', category: 'Network Installation', address: '456 Business Park Dr, Suite 200' },
              { title: 'Safety Training & Equipment Inspection', client: 'Internal', date: '2025-02-01', time: '14:00', endTime: '16:00', description: 'Quarterly safety review and equipment maintenance', category: 'Safety Inspection', address: 'Company Headquarters' }
            ];
            
            for (const appointment of defaultAppointments) {
              await appointmentsService.add(appointment);
            }
            
            const updatedAppointments = await appointmentsService.getAll();
            setAppointments(updatedAppointments);
          }
        } catch (error) {
          console.error('Error loading appointments:', error);
          // Fallback to localStorage if Firebase fails
          const savedAppointments = localStorage.getItem('appointments');
          if (savedAppointments) {
            setAppointments(JSON.parse(savedAppointments));
          }
        }
      };
      
      loadAppointments();
      
      // Set up real-time listener
      const unsubscribe = appointmentsService.onSnapshot((appointments) => {
        setAppointments(appointments);
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Add new appointment to Firebase
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentsService.add(formData);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '' });
      setShowAddForm(false);
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

  // Update appointment in Firebase
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentsService.update(editingAppointment, formData);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '' });
      setEditingAppointment(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    }
  };

  // Delete appointment from Firebase
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentsService.delete(id);
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

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h1 style={{ color: '#22314a', marginBottom: '1rem' }}>Calendar Access</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>Please login to access the calendar management system.</p>
          
          <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                margin: '0.5rem 0', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                margin: '0.5rem 0', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            />
            {loginError && (
              <div style={{ color: '#dc3545', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                {loginError}
              </div>
            )}
            <button 
              type="submit" 
              style={{
                ...buttonStyle,
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                marginTop: '1rem'
              }}
            >
              Login to Calendar
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px', fontSize: '0.9rem', color: '#1976d2' }}>
            <strong>Demo Credentials:</strong><br/>
            Username: admin<br/>
            Password: calendar2025
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#22314a', margin: 0 }}>Calendar Management</h1>
        <button onClick={handleLogout} style={{...buttonStyle, background: '#dc3545'}}>
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
