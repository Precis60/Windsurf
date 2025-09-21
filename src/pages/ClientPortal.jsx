import React, { useEffect, useState } from 'react';
import { authService, supportService } from '../services/secureApi';
import { appointmentRequestService } from '../services/secureApi';
import AddressAutocomplete from '../components/AddressAutocomplete';
import AnalogTimePicker from '../components/AnalogTimePicker';

const ClientPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    address: '',
    addressMeta: null,
  });

  const [supportForm, setSupportForm] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });

  const timeZone = 'Australia/Sydney';

  const calculateDurationMinutes = (startTime, endTime) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const t = await supportService.getTickets();
        setTickets(Array.isArray(t) ? t : t.tickets || []);
        const r = await appointmentRequestService.getAll();
        setRequests(Array.isArray(r) ? r : r.requests || []);
      } catch (e) {
        console.error('Client portal load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const duration = calculateDurationMinutes(form.time, form.endTime);
    if (isNaN(duration) || duration < 15 || duration > 480) {
      alert('Duration must be between 15 and 480 minutes.');
      return;
    }
    const localDateTimeString = `${form.date}T${form.time}:00`;
    const aestDate = new Date(localDateTimeString);
    const payload = {
      title: form.title,
      description: form.description,
      requestedDate: aestDate.toISOString(),
      durationMinutes: duration,
      address: form.address || '',
      addressPlaceId: form.addressMeta?.placeId || null,
      addressLat: form.addressMeta?.lat ?? null,
      addressLng: form.addressMeta?.lng ?? null,
      addressComponents: form.addressMeta?.components || null,
    };
    try {
      await appointmentRequestService.create(payload);
      alert('Your appointment request has been submitted. We will review and confirm.');
      setForm({ title: '', description: '', date: '', time: '', endTime: '', address: '', addressMeta: null });
      const r = await appointmentRequestService.getAll();
      setRequests(Array.isArray(r) ? r : r.requests || []);
    } catch (err) {
      console.error('Submit request error:', err);
      alert(err?.message || 'Failed to submit request');
    }
  };

  const handleSubmitSupportTicket = async (e) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.description.trim()) {
      alert('Please fill in both subject and description.');
      return;
    }
    
    const payload = {
      subject: supportForm.subject.trim(),
      description: supportForm.description.trim(),
      priority: supportForm.priority,
      status: 'open'
    };
    
    try {
      await supportService.createTicket(payload);
      alert('Your support ticket has been submitted successfully. We will respond soon.');
      setSupportForm({ subject: '', description: '', priority: 'medium' });
      // Reload tickets to show the new one
      const t = await supportService.getTickets();
      setTickets(Array.isArray(t) ? t : t.tickets || []);
    } catch (err) {
      console.error('Submit support ticket error:', err);
      alert(err?.message || 'Failed to submit support ticket');
    }
  };

  if (!authService.isAuthenticated()) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
        <h2>🔒 Login required</h2>
        <p>Please log in to access your client portal.</p>
        <a href="/login" className="calendar-btn-main">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#22314a', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Client Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          View your support tickets, submit new support requests, and request tentative appointments for site visits.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#666' }}>Loading...</div>
      ) : (
        <>
          {/* Top Section - Forms */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem', 
            marginBottom: '3rem' 
          }}>
            {/* Support Ticket Form */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: '12px', 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#22314a', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                🎧 Submit Support Ticket
              </h2>
              <form onSubmit={handleSubmitSupportTicket}>
                <div style={{ marginBottom: '1rem' }}>
                  <input 
                    className="calendar-input" 
                    type="text" 
                    placeholder="Subject" 
                    value={supportForm.subject} 
                    onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })} 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <textarea 
                    className="calendar-textarea" 
                    placeholder="Describe your issue or question in detail..." 
                    value={supportForm.description} 
                    onChange={e => setSupportForm({ ...supportForm, description: e.target.value })} 
                    required
                    rows={5}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <select 
                    className="calendar-select" 
                    value={supportForm.priority} 
                    onChange={e => setSupportForm({ ...supportForm, priority: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <button className="calendar-btn-main" type="submit" style={{ width: '100%' }}>
                  Submit Support Ticket
                </button>
              </form>
            </div>

            {/* Appointment Request Form */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: '12px', 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#22314a', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                📅 Request Tentative Appointment
              </h2>
              <form onSubmit={handleSubmitRequest}>
                <div style={{ marginBottom: '1rem' }}>
                  <input 
                    className="calendar-input" 
                    type="text" 
                    placeholder="Appointment Title" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <textarea 
                    className="calendar-textarea" 
                    placeholder="Description" 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    rows={3}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <input 
                    className="calendar-input" 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({ ...form, date: e.target.value })} 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <AnalogTimePicker label="Start Time" value={form.time} onChange={time => setForm({ ...form, time })} />
                  <AnalogTimePicker label="End Time" value={form.endTime} onChange={time => setForm({ ...form, endTime: time })} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <AddressAutocomplete 
                    label="Address/Location" 
                    value={form.address} 
                    onChange={(val, meta) => setForm({ ...form, address: val, addressMeta: meta })} 
                    placeholder="Start typing an Australian address…" 
                    showTip={false} 
                  />
                </div>
                <button className="calendar-btn-main" type="submit" style={{ width: '100%' }}>
                  Submit Request
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section - Your Items */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem' 
          }}>
            {/* Support Tickets */}
            <div style={{ 
              background: '#fff', 
              padding: '2rem', 
              borderRadius: '12px', 
              border: '1px solid #e1e5e9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#22314a', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                🎫 Your Support Tickets
              </h2>
              {tickets.length === 0 ? (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '2rem', 
                  border: '1px solid #e1e5e9', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  No support tickets yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {tickets.map(t => (
                    <div key={t.id} style={{ 
                      background: '#f8f9fa', 
                      padding: '1.5rem', 
                      border: '1px solid #e1e5e9', 
                      borderRadius: '8px',
                      transition: 'box-shadow 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#22314a', fontSize: '1rem' }}>#{t.id} - {t.subject}</strong>
                        <span style={{ 
                          textTransform: 'capitalize', 
                          background: t.status === 'open' ? '#e3f2fd' : '#f3e5f5',
                          color: t.status === 'open' ? '#1976d2' : '#7b1fa2',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {t.status?.replace('_',' ')}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {t.description?.slice(0,150)}{t.description?.length > 150 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appointment Requests */}
            <div style={{ 
              background: '#fff', 
              padding: '2rem', 
              borderRadius: '12px', 
              border: '1px solid #e1e5e9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#22314a', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                📋 Your Appointment Requests
              </h2>
              {requests.length === 0 ? (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '2rem', 
                  border: '1px solid #e1e5e9', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  No appointment requests yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {requests.map(r => (
                    <div key={r.id} style={{ 
                      background: '#f8f9fa', 
                      padding: '1.5rem', 
                      border: '1px solid #e1e5e9', 
                      borderRadius: '8px',
                      transition: 'box-shadow 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#22314a', fontSize: '1rem' }}>{r.title}</strong>
                        <span style={{ 
                          textTransform: 'capitalize',
                          background: r.status === 'pending' ? '#fff3cd' : r.status === 'approved' ? '#d4edda' : '#f8d7da',
                          color: r.status === 'pending' ? '#856404' : r.status === 'approved' ? '#155724' : '#721c24',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        📅 {new Date(r.requestedDate).toLocaleString('en-AU')}
                      </div>
                      {r.address && (
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          📍 {r.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientPortal;
