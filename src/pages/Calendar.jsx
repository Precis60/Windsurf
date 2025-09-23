  import React, { useState, useEffect } from "react";
import { appointmentsService, authService, calendarService, appointmentRequestService, customersService } from '../services/secureApi';
import AnalogTimePicker from '../components/AnalogTimePicker';
import AddressAutocomplete from '../components/AddressAutocomplete';
import CustomConfirmModal from '../components/CustomConfirmModal';
import { eventCategories, getCategoryStyle } from '../utils/eventCategories';
import '../Calendar.css';

const Calendar = () => {
  const timeZone = 'Australia/Sydney'; // AEST/AEDT
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [currentView, setCurrentView] = useState('monthly');
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notice, setNotice] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
    client: '',
    customerId: '',
    description: '',
    category: '',
    address: '',
    addressMeta: null
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

  // Helper function to convert backend UTC appointments to AEST for display
  const transformAppointment = (apt) => {
    if (!apt.appointmentDate) return apt;

    const utcDate = new Date(apt.appointmentDate);

    // Get AEST date string (e.g., "2025-09-21")
    const date = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(utcDate);
    
    // Get AEST time string (e.g., "14:30")
    const startTime = new Intl.DateTimeFormat('en-AU', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(utcDate);

    let endTime = startTime;
    if (apt.durationMinutes) {
      const endDate = new Date(utcDate.getTime() + apt.durationMinutes * 60000);
      endTime = new Intl.DateTimeFormat('en-AU', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(endDate);
    }

    return {
      ...apt,
      time: startTime,
      endTime: endTime,
      date: date,
      appointmentDate: apt.appointmentDate
    };
  };

  // Load appointments and customers from secure API
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        // Reset notice on each load attempt
        setNotice(null);

        // Load appointments
        try {
          const appointmentsResponse = await appointmentsService.getAll();
          const appointmentList = Array.isArray(appointmentsResponse) ? appointmentsResponse : appointmentsResponse.appointments || [];
          const transformedAppointments = appointmentList.map(transformAppointment);
          setAppointments(transformedAppointments);
        } catch (error) {
          console.error('Error loading appointments:', error);
          setAppointments([]);
          const msg = error?.status === 401 ? 'Your session has expired. Please log in again to view appointments.' : (error?.message || 'Failed to load appointments.');
          setNotice({ type: 'error', message: msg });
        }

        // Load customers (minimal set for calendar) with admin fallback
        try {
          const customersResponse = await calendarService.getCalendarCustomers();
          const customerList = Array.isArray(customersResponse) ? customersResponse : customersResponse.customers || [];
          setCustomers(customerList);
        } catch (error) {
          console.error('Error loading customers (calendar endpoint):', error);
          // If forbidden, attempt full customers list (admin/staff have access)
          if (error?.status === 403) {
            try {
              const fullResp = await customersService.getAll();
              const fullList = Array.isArray(fullResp) ? fullResp : fullResp.customers || [];
              setCustomers(fullList);
            } catch (e2) {
              console.error('Fallback customers load failed:', e2);
              setCustomers([]);
              const u = authService.getCurrentUser?.();
              if (!u || (u.role !== 'admin' && u.role !== 'staff')) {
                setNotice({ type: 'error', message: 'You are logged in without admin/staff permissions. Customer list is hidden. Appointments can still be created by typing a client name, but dropdown requires admin/staff.' });
              }
            }
          } else if (error?.status === 401) {
            setCustomers([]);
            setNotice({ type: 'error', message: 'Your session has expired. Please log in again to load customers.' });
          } else {
            setCustomers([]);
          }
        }

        // Load pending appointment requests for staff/admin
        try {
          const current = authService.getCurrentUser?.();
          if (current && (current.role === 'admin' || current.role === 'staff')) {
            setPendingLoading(true);
            const r = await appointmentRequestService.getAll('?status=pending');
            const list = Array.isArray(r) ? r : r.requests || [];
            setPendingRequests(list);
          } else {
            setPendingRequests([]);
          }
        } catch (e) {
          console.error('Error loading pending requests:', e);
          setPendingRequests([]);
        } finally {
          setPendingLoading(false);
        }
      };
      
      loadData();
    }
  }, [isAuthenticated]);

  // Poll pending requests count every 60s for staff/admin
  useEffect(() => {
    const current = authService.getCurrentUser?.();
    if (!(current && (current.role === 'admin' || current.role === 'staff'))) return;
    const timer = setInterval(async () => {
      try {
        const r = await appointmentRequestService.getAll('?status=pending');
        const list = Array.isArray(r) ? r : r.requests || [];
        setPendingRequests(list);
      } catch {}
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
    // Create a date string that is explicitly in the AEST time zone
    const localDateTimeString = `${formData.date}T${formData.time}:00`;
    const aestDate = new Date(localDateTimeString);

    // Build payload with the UTC date by getting the ISO string
    const appointmentData = {
      title: formData.title,
      description: formData.description || `Client: ${formData.client}\nCategory: ${formData.category}\nAddress: ${formData.address}`,
      appointmentDate: aestDate.toISOString(),
      durationMinutes: duration,
      customerId: Number(formData.customerId),
      address: formData.address || '',
      category: formData.category || ''
    };

    // Only add address metadata if it's valid and has a placeId
    if (formData.addressMeta && formData.addressMeta.placeId) {
      appointmentData.addressPlaceId = formData.addressMeta.placeId;
      appointmentData.addressLat = formData.addressMeta.lat;
      appointmentData.addressLng = formData.addressMeta.lng;
      appointmentData.addressComponents = formData.addressMeta.components;
    }
    // Log payload and types for debugging
    console.log('Appointment payload:', appointmentData);
    Object.keys(appointmentData).forEach(key => {
      console.log(`${key}:`, appointmentData[key], 'type:', typeof appointmentData[key]);
    });
    try {
      const result = await appointmentsService.create(appointmentData);
      console.log('Appointment created successfully:', result);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', customerId: '', description: '', category: '', address: '', addressMeta: null });
      setShowAddForm(false);
      // Reload appointments
      const response = await appointmentsService.getAll();
      const appointmentList = Array.isArray(response) ? response : response.appointments || [];
      const transformedAppointments = appointmentList.map(transformAppointment);
      setAppointments(transformedAppointments);
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
    const mapped = prepareFormDataFromAppointment(appointment);
    setEditingAppointment(appointment.id);
    setFormData(mapped);
    setClientSearch(mapped.client || '');
    setShowAddForm(true);
  };

  // Update appointment in secure API
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();

    // Create a date string that is explicitly in the AEST time zone
    const localDateTimeString = `${formData.date}T${formData.time}:00`;
    const aestDate = new Date(localDateTimeString);
    const duration = calculateDurationMinutes(formData.time, formData.endTime);

    // Build an update payload that preserves existing details by not overwriting
    // address metadata unless the user actually selected a new address (addressMeta present)
    const appointmentData = {
      title: formData.title,
      description: formData.description,
      appointmentDate: aestDate.toISOString(),
      durationMinutes: duration,
      // keep the selected customer link
      customerId: Number(formData.customerId),
      // always carry the human-readable address text
      address: formData.address || '',
      category: formData.category || '',
    };
    // Only add address metadata if it's valid and has a placeId
    if (formData.addressMeta && formData.addressMeta.placeId) {
      appointmentData.addressPlaceId = formData.addressMeta.placeId;
      appointmentData.addressLat = formData.addressMeta.lat;
      appointmentData.addressLng = formData.addressMeta.lng;
      appointmentData.addressComponents = formData.addressMeta.components;
    }

    try {
      await appointmentsService.update(editingAppointment, appointmentData);
      setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '', addressMeta: null });
      setEditingAppointment(null);
      setShowAddForm(false);
      // Reload appointments
      const response = await appointmentsService.getAll();
      const appointmentList = Array.isArray(response) ? response : response.appointments || [];
      const transformedAppointments = appointmentList.map(transformAppointment);
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    }
  };

  // Modal state for confirmation
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  // Map an appointment from API into our form shape while preserving existing details
  const prepareFormDataFromAppointment = (apt) => {
    const clientName = apt.client || (apt.customer ? `${apt.customer.firstName || ''} ${apt.customer.lastName || ''}`.trim() : '') || '';
    return {
      title: apt.title || '',
      date: apt.date || '',
      time: apt.time || '',
      endTime: apt.endTime || '',
      client: clientName,
      customerId: apt.customerId || apt.customer?.id || '',
      description: apt.description || '',
      category: apt.category || '',
      address: apt.address || '',
      addressMeta: null, // will be set only if user selects a new address from autocomplete
      id: apt.id,
      appointmentDate: apt.appointmentDate
    };
  };

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
      const transformedAppointments = appointmentList.map(transformAppointment);
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  // Get appointments for a specific date, ensuring time zone correctness
  const getAppointmentsForDate = (date) => {
    // Format the calendar grid's date to an AEST date string (e.g., "2025-09-21")
    const calendarDateStr = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

    return appointments.filter(apt => apt.date === calendarDateStr);
  };

  // Generate calendar days for monthly view, AEST-aware
  const generateMonthlyCalendar = () => {
    // Get year and month in AEST
    const year = Number(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(currentDate));
    const month = Number(new Intl.DateTimeFormat('en-US', { timeZone, month: 'numeric' }).format(currentDate)) - 1;

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, etc.

    let startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generate week days for weekly view, AEST-aware
  const generateWeeklyCalendar = () => {
    const dayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, etc.
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

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
      {notice && (
        <div className={`calendar-feedback ${notice.type === 'error' ? 'error' : ''}`}>
          {notice.message}
        </div>
      )}
      <div className="calendar-dashboard">
        {/* Pending Appointment Requests (staff/admin only) */}
        {(() => {
          const current = authService.getCurrentUser?.();
          if (!(current && (current.role === 'admin' || current.role === 'staff'))) return null;
          return (
            <div className="calendar-card" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Pending Appointment Requests</h3>
                <button className="calendar-btn-secondary" type="button" onClick={async () => {
                  try {
                    setPendingLoading(true);
                    const r = await appointmentRequestService.getAll('?status=pending');
                    const list = Array.isArray(r) ? r : r.requests || [];
                    setPendingRequests(list);
                  } finally { setPendingLoading(false); }
                }}>Refresh</button>
              </div>
              {pendingLoading ? (
                <div style={{ color: '#666' }}>Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div style={{ color: '#666' }}>No pending requests.</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {pendingRequests.slice(0, 5).map((r) => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #eee' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{new Date(r.requestedDate).toLocaleString('en-AU')}{r.address ? ` • ${r.address}` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="calendar-btn-secondary" type="button" onClick={async () => {
                          try {
                            await appointmentRequestService.update(r.id, { status: 'approved', createAppointment: true });
                            const resp = await appointmentRequestService.getAll('?status=pending');
                            const list = Array.isArray(resp) ? resp : resp.requests || [];
                            setPendingRequests(list);
                            // Reload appointments to show newly created one
                            const response = await appointmentsService.getAll();
                            const appointmentList = Array.isArray(response) ? response : response.appointments || [];
                            setAppointments(appointmentList.map(transformAppointment));
                          } catch (e) { alert('Failed to approve.'); }
                        }}>Approve & Create</button>
                        <button className="calendar-btn-secondary" type="button" onClick={async () => {
                          try {
                            await appointmentRequestService.update(r.id, { status: 'approved', createAppointment: false });
                            const resp = await appointmentRequestService.getAll('?status=pending');
                            const list = Array.isArray(resp) ? resp : resp.requests || [];
                            setPendingRequests(list);
                          } catch (e) { alert('Failed to approve.'); }
                        }}>Approve Only</button>
                        <button className="calendar-btn-secondary" type="button" onClick={async () => {
                          try {
                            await appointmentRequestService.update(r.id, { status: 'declined' });
                            const resp = await appointmentRequestService.getAll('?status=pending');
                            const list = Array.isArray(resp) ? resp : resp.requests || [];
                            setPendingRequests(list);
                          } catch (e) { alert('Failed to decline.'); }
                        }}>Decline</button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 5 && (
                    <div style={{ fontSize: 12, color: '#666' }}>+ {pendingRequests.length - 5} more pending...</div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
        <div className="calendar-card">
          <h3>Appointment Management</h3>
          <p>View and manage appointments, clients, and schedules.</p>
          <button className="calendar-btn-main" onClick={() => { setShowAddForm(!showAddForm); setEditingAppointment(null); setFormData({ title: '', date: '', time: '', endTime: '', client: '', description: '', category: '', address: '', addressMeta: null }); }}>
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
                  // Update visible client name but do not clear existing customerId unless user selects a different one
                  setFormData({ ...formData, client: e.target.value });
                }}
                onBlur={() => {
                  setTimeout(() => setShowClientDropdown(false), 200);
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
              <option value="">Select a Category</option>
              {Object.keys(eventCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <AddressAutocomplete
              label="Address/Location"
              value={formData.address}
              onChange={(val, payload) => {
                setFormData({ ...formData, address: val, addressMeta: payload });
              }}
              placeholder="Start typing an Australian address…"
              showTip={false}
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
              {editingAppointment && (
                <button 
                  className="calendar-btn-delete" 
                  type="button" 
                  onClick={() => handleDeleteAppointment(editingAppointment)}>
                  Delete
                </button>
              )}
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
            {currentView === 'monthly' && new Intl.DateTimeFormat('en-AU', { timeZone, month: 'long', year: 'numeric' }).format(currentDate)}
            {currentView === 'weekly' && `Week of ${new Intl.DateTimeFormat('en-AU', { timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(currentDate)}`}
            {currentView === 'daily' && new Intl.DateTimeFormat('en-AU', { timeZone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(currentDate)}
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
                  {dayAppointments.map(apt => {
                    const hasValidTime = apt.time && apt.endTime && 
                      String(apt.time).trim() !== '' && String(apt.endTime).trim() !== '' &&
                      apt.time !== 'Invalid Date' && apt.endTime !== 'Invalid Date';
                    console.log('Monthly view appointment:', apt.id, 'hasValidTime:', hasValidTime, 'time:', apt.time, 'endTime:', apt.endTime);
                    return apt;
                  }).map(apt => {
                    const hasValidTime = apt.time && apt.endTime && 
                      String(apt.time).trim() !== '' && String(apt.endTime).trim() !== '' &&
                      apt.time !== 'Invalid Date' && apt.endTime !== 'Invalid Date';
                    const style = getCategoryStyle(apt.category);
                    return (
                      <div key={apt.id} className="calendar-appointment" style={{ backgroundColor: style.color, color: style.textColor }} onClick={() => {
                        handleEditAppointment(apt);
                      }}>
                        <div className="calendar-appointment-time">
                          {hasValidTime ? `${apt.time} - ${apt.endTime}` : 'All Day'}
                        </div>
                        <div className="calendar-appointment-title">{apt.title}</div>
                      </div>
                    );
                  })}
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
                        const hasValidTime = apt.time && apt.endTime && 
                          String(apt.time).trim() !== '' && String(apt.endTime).trim() !== '' &&
                          apt.time !== 'Invalid Date' && apt.endTime !== 'Invalid Date';
                        console.log('Weekly view appointment filter:', apt.id, 'hasValidTime:', hasValidTime, 'time:', apt.time, 'endTime:', apt.endTime);
                        return hasValidTime;
                      }).map(apt => {
                        const style = getCategoryStyle(apt.category);
                        const [startHours, startMinutes] = apt.time.split(':').map(Number);
                        const [endHours, endMinutes] = apt.endTime.split(':').map(Number);
                        // Calculate position: each 15-minute slot = 15px (96 slots × 15px = 1440px total for 24 hours)
                        const startPositionInMinutes = startHours * 60 + startMinutes;
                        const endPositionInMinutes = endHours * 60 + endMinutes;
                        const startPosition = (startPositionInMinutes / 15) * 15; // Convert to 15px per 15-minute slot
                        const endPosition = (endPositionInMinutes / 15) * 15;
                        const height = Math.max(30, endPosition - startPosition);
                        return (
                          <div key={apt.id} className="calendar-appointment" style={{
                            top: `${startPosition}px`,
                            height: `${height}px`,
                            backgroundColor: style.color,
                            color: style.textColor,
                          }} onClick={() => {
                            handleEditAppointment(apt);
                          }}>
                            <div className="calendar-appointment-time">{apt.time} - {apt.endTime}</div>
                            <div className="calendar-appointment-title">{apt.title}</div>
                          </div>
                        );
                      })}
                      {/* All Day appointments */}
                      {dayAppointments.filter(apt => {
                        const hasValidTime = apt.time && apt.endTime && 
                          String(apt.time).trim() !== '' && String(apt.endTime).trim() !== '' &&
                          apt.time !== 'Invalid Date' && apt.endTime !== 'Invalid Date';
                        return !hasValidTime;
                      }).map(apt => {
                        const style = getCategoryStyle(apt.category);
                        return (
                          <div key={apt.id} className="calendar-appointment calendar-all-day" style={{
                            backgroundColor: style.color,
                            color: style.textColor,
                            position: 'relative',
                            marginBottom: '2px',
                            padding: '2px 4px',
                            fontSize: '11px'
                          }} onClick={() => {
                            handleEditAppointment(apt);
                          }}>
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
                  const hasTime = apt.time && apt.endTime && 
                    String(apt.time).trim() !== '' && String(apt.endTime).trim() !== '' &&
                    apt.time !== 'Invalid Date' && apt.endTime !== 'Invalid Date';
                  console.log('Daily view appointment filter:', apt.id, 'hasTime:', hasTime, 'time:', apt.time, 'endTime:', apt.endTime, 'appointmentDate:', apt.appointmentDate);
                  return hasTime;
                }).map(apt => {
                  const style = getCategoryStyle(apt.category);
                  const [startHours, startMinutes] = apt.time.split(':').map(Number);
                  const [endHours, endMinutes] = apt.endTime.split(':').map(Number);
                  // Calculate position: each 15-minute slot = 15px (96 slots × 15px = 1440px total for 24 hours)
                  const startPositionInMinutes = startHours * 60 + startMinutes;
                  const endPositionInMinutes = endHours * 60 + endMinutes;
                  const startPosition = (startPositionInMinutes / 15) * 15; // Convert to 15px per 15-minute slot
                  const endPosition = (endPositionInMinutes / 15) * 15;
                  const height = Math.max(30, endPosition - startPosition);
                  return (
                    <div key={apt.id} className="calendar-appointment" style={{
                      top: `${startPosition}px`,
                      height: `${height}px`,
                      backgroundColor: style.color,
                      color: style.textColor,
                    }} onClick={() => {
                      handleEditAppointment(apt);
                    }}>
                      <div className="calendar-appointment-time">{apt.time} - {apt.endTime}</div>
                      <div className="calendar-appointment-title">{apt.title}</div>
                      <div className="calendar-appointment-category">{apt.category}</div>
                    </div>
                  );
                })}
                {/* All Day appointments */}
                <div className="calendar-all-day-section" style={{ position: 'absolute', top: '0', left: '0', right: '0', background: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '4px' }}>
                  {getAppointmentsForDate(currentDate).filter(apt => {
                    const hasValidTime = apt.time && apt.endTime && 
                      String(apt.time).trim() !== '' && String(apt.endTime).trim() !== '' &&
                      apt.time !== 'Invalid Date' && apt.endTime !== 'Invalid Date';
                    return !hasValidTime;
                  }).map(apt => {
                    const style = getCategoryStyle(apt.category);
                    return (
                      <div key={apt.id} className="calendar-appointment calendar-all-day" style={{
                        backgroundColor: style.color,
                        color: style.textColor,
                        marginBottom: '2px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }} onClick={() => {
                        handleEditAppointment(apt);
                      }}>
                        <div className="calendar-appointment-title">{apt.title}</div>
                      </div>
                    );
                  })}
                </div>
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
