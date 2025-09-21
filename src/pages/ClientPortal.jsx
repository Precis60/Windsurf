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
    <div className="page-content" style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#22314a' }}>Client Portal</h1>
      <p>View your support tickets, submit new support requests, and request tentative appointments for site visits.</p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#22314a' }}>Your Support Tickets</h2>
            {tickets.length === 0 ? (
              <div style={{ background: '#fff', padding: 20, border: '1px solid #e1e5e9', borderRadius: 8 }}>No tickets yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {tickets.map(t => (
                  <div key={t.id} style={{ background: '#fff', padding: 16, border: '1px solid #e1e5e9', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>#{t.id} - {t.subject}</strong>
                      <span style={{ textTransform: 'capitalize' }}>{t.status?.replace('_',' ')}</span>
                    </div>
                    <div style={{ color: '#666', fontSize: 14 }}>{t.description?.slice(0,120)}...</div>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ color: '#22314a', marginTop: '2rem' }}>Your Appointment Requests</h2>
            {requests.length === 0 ? (
              <div style={{ background: '#fff', padding: 20, border: '1px solid #e1e5e9', borderRadius: 8 }}>No appointment requests yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {requests.map(r => (
                  <div key={r.id} style={{ background: '#fff', padding: 16, border: '1px solid #e1e5e9', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{r.title}</strong>
                      <span style={{ textTransform: 'capitalize' }}>{r.status}</span>
                    </div>
                    <div style={{ color: '#666', fontSize: 14 }}>{new Date(r.requestedDate).toLocaleString('en-AU')}</div>
                    {r.address && <div style={{ color: '#666', fontSize: 13 }}>📍 {r.address}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ color: '#22314a' }}>Submit Support Ticket</h2>
            <form onSubmit={handleSubmitSupportTicket} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <input 
                className="calendar-input" 
                type="text" 
                placeholder="Subject" 
                value={supportForm.subject} 
                onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })} 
                required 
                style={{ marginBottom: '1rem' }}
              />
              <textarea 
                className="calendar-textarea" 
                placeholder="Describe your issue or question in detail..." 
                value={supportForm.description} 
                onChange={e => setSupportForm({ ...supportForm, description: e.target.value })} 
                required
                rows={6}
                style={{ marginBottom: '1rem' }}
              />
              <select 
                className="calendar-select" 
                value={supportForm.priority} 
                onChange={e => setSupportForm({ ...supportForm, priority: e.target.value })}
                style={{ marginBottom: '1rem' }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <button className="calendar-btn-main" type="submit" style={{ width: '100%' }}>
                Submit Support Ticket
              </button>
            </form>
          </div>

          <div>
            <h2 style={{ color: '#22314a' }}>Request Tentative Appointment</h2>
            <form onSubmit={handleSubmitRequest}>
              <input className="calendar-input" type="text" placeholder="Appointment Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea className="calendar-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input className="calendar-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              <AnalogTimePicker label="Start Time" value={form.time} onChange={time => setForm({ ...form, time })} />
              <AnalogTimePicker label="End Time" value={form.endTime} onChange={time => setForm({ ...form, endTime: time })} />
              <AddressAutocomplete label="Address/Location" value={form.address} onChange={(val, meta) => setForm({ ...form, address: val, addressMeta: meta })} placeholder="Start typing an Australian address…" showTip={false} />
              <button className="calendar-btn-main" type="submit" style={{ marginTop: 12 }}>Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
