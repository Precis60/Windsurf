import React, { useState, useEffect } from "react";
import { appointmentsService, authService, customersService } from '../services/secureApi';
import AnalogTimePicker from '../components/AnalogTimePicker';
import CustomConfirmModal from '../components/CustomConfirmModal';
import '../Calendar.css';

const Calendar = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [currentView, setCurrentView] = useState('monthly');
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
    client: '',
    customerId: '',
    description: '',
    category: '',
    address: ''
  });

  // Autocomplete state for client selection
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

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

  // Load appointments and customers from secure API
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          // Load appointments
          const appointmentsResponse = await appointmentsService.getAll();
          const appointmentList = Array.isArray(appointmentsResponse) ? appointmentsResponse : appointmentsResponse.appointments || [];
          console.log('Loaded appointments:', appointmentList);
          setAppointments(appointmentList);
          
          // Load customers
          const customersResponse = await customersService.getAll();
          const customerList = Array.isArray(customersResponse) ? customersResponse : customersResponse.customers || [];
          setCustomers(customerList);
        } catch (error) {
          console.error('Error loading data:', error);
          setAppointments([]);
          setCustomers([]);
        }
      };
      
      loadData();
    }
  }, [isAuthenticated]);

  // Add new appointment to secure API
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    console.log('Attempting to create appointment with data:', formData);
    // Validate duration before submitting
    const duration = calculateDurationMinutes(formData.time, formData.endTime);
    if (isNaN(duration) || duration < 15 || duration > 480) {
      alert('Duration must be between 15 and 480 minutes.');
      return;
    }
    // Validate customerId is a valid integer
    if (!formData.customerId || isNaN(Number(formData.customerId)) || !Number.isInteger(Number(formData.customerId))) {
      alert('Please select a valid client from the dropdown.');
      return;
    }
    // Build payload
    const appointmentData = {
      title: formData.title,
      description: formData.description || `Client: ${formData.client}\nCategory: ${formData.category}\nAddress: ${formData.address}`,
      appointmentDate: `${formData.date}T${formData.time}:00.000Z`,
      durationMinutes: duration,
      customerId: Number(formData.customerId)
    };
    // Log payload and types for debugging
    console.log('Appointment payload:', appointmentData);
    Object.keys(appointmentData).forEach(key => {
      console.log(`${key}:`, appointmentData[key], 'type:', typeof appointmentData[key]);
    });
    try {
      const result = await appointmentsService.create(appointmentData);
      console.log('Appointment created successfully:', result);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', customerId: '', description: '', category: '', address: '' });
      setShowAddForm(false);
      // Reload appointments
      const response = await appointmentsService.getAll();
      const appointmentList = Array.isArray(response) ? response : response.appointments || [];
      setAppointments(appointmentList);
      alert('Appointment added successfully!');
    } catch (error) {
      let errorMessage = 'Failed to add appointment. ';
      if (error.response && error.response.data && error.response.data.error) {
        if (typeof error.response.data.error === 'string') {
          errorMessage += error.response.data.error;
        } else if (error.response.data.error.message) {
          errorMessage += error.response.data.error.message;
        } else {
          errorMessage += JSON.stringify(error.response.data.error);
        }
        // Show validation details if present
        if (error.response.data.error.details) {
          errorMessage += '\nDetails:';
          error.response.data.error.details.forEach((d) => {
            errorMessage += `\n- ${d.path}: ${d.msg} (value: ${d.value})`;
          });
        }
      } else if (error.message) {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  // Helper function to calculate duration in minutes
  const calculateDurationMinutes = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
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

  // Modal state for confirmation
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  // Delete appointment from secure API (custom modal)
  const handleDeleteAppointment = async (id) => {
    setConfirmModal({ open: true, id });
  };

  const confirmDeleteAppointment = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
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
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    console.log('Looking for appointments on date:', dateStr);
    console.log('All appointments:', appointments);
    
    const filtered = appointments.filter(apt => {
      // Handle both old format (apt.date) and new backend format (apt.appointmentDate)
      const appointmentDate = apt.appointmentDate || apt.date;
      console.log('Checking appointment:', apt.id, 'appointmentDate:', appointmentDate);
      
      if (!appointmentDate) {
        console.log('No appointment date found for appointment:', apt);
        return false;
      }
      
      // Extract date part from ISO string
      const aptDateStr = appointmentDate.split('T')[0];
      const matches = aptDateStr === dateStr;
      console.log('Date comparison:', aptDateStr, 'vs', dateStr, '=', matches);
      
      return matches;
    });
    
    console.log('Filtered appointments for', dateStr, ':', filtered);
    return filtered;
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

  // If loading, show loading state
  if (loading) {
    return (
      <div className="calendar-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading Calendar...</h2>
      </div>
    );
  }
  // If not authenticated, show message to login
  if (!isAuthenticated) {
    return (
      <div className="calendar-container">
        <div className="calendar-card" style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
          <h1 className="calendar-title">🔒 Calendar Access Required</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>Please log in to access the calendar system.</p>
          <a href="/login" className="calendar-btn-main">Go to Login Page</a>
        </div>
      </div>
    );
  }
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="calendar-title">Calendar Management</h1>
        <button className="calendar-logout-btn" onClick={() => { authService.logout(); setIsAuthenticated(false); window.location.href = '/'; }}>Logout</button>
      </div>
      <div className="calendar-dashboard">
        <div className="calendar-card">
          <h3>Appointment Management</h3>
          <p>View and manage appointments, clients, and schedules.</p>
          <button className="calendar-btn-main" onClick={() => { setShowAddForm(!showAddForm); setEditingAppointment(null); setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '' }); }}>
            {showAddForm ? 'Cancel' : 'Add New Appointment'}
          </button>
        </div>
        {/* Optionally add more dashboard cards here */}
      </div>
      {/* Appointment Form Section */}
      {showAddForm && (
        <div className="calendar-section">
          <h2 style={{ color: '#22314a', marginBottom: '1.5rem' }}>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</h2>
          <form className="calendar-form" onSubmit={e => {
            e.preventDefault();
            if (!formData.customerId) {
              alert('Please select a valid client from the dropdown.');
              return;
            }
            (editingAppointment ? handleUpdateAppointment : handleAddAppointment)(e);
          }} noValidate>
            <input
              type="text"
              placeholder="Appointment Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="calendar-input"
            />
            <div className="calendar-client-select">
              <input
                type="text"
                placeholder="Select Client"
                value={clientSearch || formData.client}
                onChange={e => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                  setFormData({ ...formData, client: e.target.value, customerId: '' });
                }}
                onBlur={() => {
                  setTimeout(() => setShowClientDropdown(false), 200);
                  // If the typed value does not match a customer, clear customerId
                  const match = customers.find(c => `${c.firstName} ${c.lastName}`.toLowerCase() === clientSearch.toLowerCase());
                  if (!match) setFormData(f => ({ ...f, customerId: '' }));
                }}
                onFocus={() => setShowClientDropdown(true)}
                autoComplete="off"
                required
                className="calendar-input"
              />
              {showClientDropdown && filteredCustomers.length > 0 && (
                <div className="calendar-client-dropdown">
                  {filteredCustomers.map(c => (
                    <div
                      key={c.id}
                      className="calendar-client-option"
                      onClick={() => {
                        setFormData({ ...formData, client: `${c.firstName} ${c.lastName}`, customerId: c.id });
                        setClientSearch(`${c.firstName} ${c.lastName}`);
                        setShowClientDropdown(false);
                      }}
                    >
                      {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              className="calendar-input"
            />
            <AnalogTimePicker
              label="Start Time"
              value={formData.time}
              onChange={(time) => setFormData({...formData, time: time})}
            />
            <AnalogTimePicker
              label="End Time"
              value={formData.endTime}
              onChange={(time) => setFormData({...formData, endTime: time})}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
              className="calendar-select"
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
              className="calendar-input"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="calendar-textarea"
            />
            <div className="calendar-form-actions">
              <button className="calendar-btn-main" type="submit">{editingAppointment ? 'Update Appointment' : 'Add Appointment'}</button>
              <button className="calendar-btn-secondary" type="button" onClick={() => { setShowAddForm(false); setEditingAppointment(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Calendar Views Section (monthly/weekly/daily) */}
      <div className="calendar-section">
        {/* Navigation Header */}
        <div className="calendar-nav-header">
          <button onClick={() => navigateDate(-1)} className="calendar-nav-btn">‹ Previous</button>
          <h3 className="calendar-nav-title">
            {currentView === 'monthly' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {currentView === 'weekly' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            {currentView === 'daily' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <button onClick={() => navigateDate(1)} className="calendar-nav-btn">Next ›</button>
          <div className="calendar-view-switcher">
            <button
              className={`calendar-view-btn${currentView === 'monthly' ? ' active' : ''}`}
              onClick={() => setCurrentView('monthly')}
              type="button"
            >Monthly</button>
            <button
              className={`calendar-view-btn${currentView === 'weekly' ? ' active' : ''}`}
              onClick={() => setCurrentView('weekly')}
              type="button"
            >Weekly</button>
            <button
              className={`calendar-view-btn${currentView === 'daily' ? ' active' : ''}`}
              onClick={() => setCurrentView('daily')}
              type="button"
            >Daily</button>
          </div>
        </div>

        {/* Monthly Calendar Grid */}
        {currentView === 'monthly' && (
          <div className="calendar-monthly-grid">
            {generateMonthlyCalendar().map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={index} className={`calendar-day ${!isCurrentMonth ? 'calendar-day-muted' : ''} ${isToday ? 'calendar-day-today' : ''}`}>
                  <div className="calendar-day-date">{date.getDate()}</div>
                  {dayAppointments.filter(apt => {
                    const hasTime = apt.time && apt.endTime && String(apt.time).trim() && String(apt.endTime).trim();
                    console.log('Appointment filter check:', apt.id, 'hasTime:', hasTime, 'time:', apt.time, 'endTime:', apt.endTime);
                    return hasTime;
                  }).map(apt => (
                    <div key={apt.id} className="calendar-appointment" onClick={() => {
                      setFormData(apt);
                      setEditingAppointment(apt.id);
                      setShowAddForm(true);
                    }}>
                      <div className="calendar-appointment-time">{apt.time} - {apt.endTime}</div>
                      <div className="calendar-appointment-title">{apt.title}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Weekly Calendar Grid */}
        {currentView === 'weekly' && (
          <div className="calendar-weekly-grid">
            {/* Time slots column */}
            <div className="calendar-time-slots">
              <div className="calendar-time-slot-header"></div>
              {generateTimeSlots().map((time, index) => (
                <div key={time} className="calendar-time-slot">
                  {index % 4 === 0 ? time : ''}
                </div>
              ))}
            </div>
            {/* Days grid */}
            <div className="calendar-days-grid">
              {generateWeeklyCalendar().map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={index} className={`calendar-day ${isToday ? 'calendar-day-today' : ''}`}>
                    <div className="calendar-day-header">
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                    </div>
                    <div className="calendar-day-body">
                      {generateTimeSlots().map((time, timeIndex) => (
                        <div key={time} className="calendar-time-slot"></div>
                      ))}
                      {dayAppointments.filter(apt => {
                        const hasTime = apt.time && apt.endTime && String(apt.time).trim() && String(apt.endTime).trim();
                        console.log('Weekly view appointment filter:', apt.id, 'hasTime:', hasTime, 'time:', apt.time, 'endTime:', apt.endTime);
                        return hasTime;
                      }).map(apt => {
                        const [startHours, startMinutes] = apt.time.split(':').map(Number);
                        const [endHours, endMinutes] = apt.endTime.split(':').map(Number);
                        // Calculate position: each 15-minute slot = 15px
                        const startPosition = ((startHours * 60 + startMinutes) / 15) * 15;
                        const endPosition = ((endHours * 60 + endMinutes) / 15) * 15;
                        const height = Math.max(30, endPosition - startPosition);
                        return (
                          <div key={apt.id} className="calendar-appointment" style={{
                            top: `${startPosition}px`,
                            height: `${height}px`,
                          }} onClick={() => {
                            setFormData(apt);
                            setEditingAppointment(apt.id);
                            setShowAddForm(true);
                          }}>
                            <div className="calendar-appointment-time">{apt.time} - {apt.endTime}</div>
                            <div className="calendar-appointment-title">{apt.title}</div>
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
          <div className="calendar-daily-grid">
            {/* Time slots column */}
            <div className="calendar-time-slots">
              <div className="calendar-time-slot-header"></div>
              {generateTimeSlots().map((time, index) => (
                <div key={time} className="calendar-time-slot">
                  {index % 4 === 0 ? time : ''}
                </div>
              ))}
            </div>
            {/* Single day grid */}
            <div className="calendar-single-day">
              <div className="calendar-day-header">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="calendar-day-body">
                {generateTimeSlots().map((time, timeIndex) => (
                  <div key={time} className="calendar-time-slot"></div>
                ))}
                {getAppointmentsForDate(currentDate).filter(apt => {
                  const hasTime = apt.time && apt.endTime && String(apt.time).trim() && String(apt.endTime).trim();
                  console.log('Daily view appointment filter:', apt.id, 'hasTime:', hasTime, 'time:', apt.time, 'endTime:', apt.endTime);
                  return hasTime;
                }).map(apt => {
                  const [startHours, startMinutes] = apt.time.split(':').map(Number);
                  const [endHours, endMinutes] = apt.endTime.split(':').map(Number);
                  // Calculate position: each 15-minute slot = 15px
                  const startPosition = ((startHours * 60 + startMinutes) / 15) * 15;
                  const endPosition = ((endHours * 60 + endMinutes) / 15) * 15;
                  const height = Math.max(30, endPosition - startPosition);
                  return (
                    <div key={apt.id} className="calendar-appointment" style={{
                      top: `${startPosition}px`,
                      height: `${height}px`,
                    }} onClick={() => {
                      setFormData(apt);
                      setEditingAppointment(apt.id);
                      setShowAddForm(true);
                    }}>
                      <div className="calendar-appointment-time">{apt.time} - {apt.endTime}</div>
                      <div className="calendar-appointment-title">{apt.title}</div>
                      <div className="calendar-appointment-category">{apt.category}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <CustomConfirmModal
        open={confirmModal.open}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        onConfirm={confirmDeleteAppointment}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />
    </div>
  );
};

export default Calendar;
