import React, { useEffect, useState } from 'react';
import axios from 'axios';

const THERAPY_OPTIONS = [
  { value: 'Abhyanga',   label: 'Abhyanga (Oil Massage)',  phase: 'Purvakarma' },
  { value: 'Svedana',    label: 'Svedana (Steam Therapy)', phase: 'Purvakarma' },
  { value: 'Basti',      label: 'Basti (Enema Therapy)',   phase: 'Pradhana Karma' },
  { value: 'Shirodhara', label: 'Shirodhara',              phase: 'Pradhana Karma' },
  { value: 'Virechana',  label: 'Virechana (Purgation)',   phase: 'Pradhana Karma' },
  { value: 'Vamana',     label: 'Vamana (Emesis)',         phase: 'Pradhana Karma' },
  { value: 'Nasya',      label: 'Nasya (Nasal Therapy)',   phase: 'Pradhana Karma' },
];

const PHASE_COLORS = {
  'Purvakarma':    '#2980b9',
  'Pradhana Karma':'#8e44ad',
  'Paschat Karma': '#27ae60'
};

const getStatusStyle = (status) => {
  const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.82em', fontWeight: 'bold' };
  const s = (status || '').toLowerCase();
  if (s === 'confirmed')  return { ...base, backgroundColor: '#d5f5e3', color: '#1d8348' };
  if (s === 'conflict')   return { ...base, backgroundColor: '#fde8e8', color: '#c0392b' };
  if (s === 'pending')    return { ...base, backgroundColor: '#fef9e7', color: '#b7950b' };
  if (s === 'cancelled')  return { ...base, backgroundColor: '#f2f3f4', color: '#7f8c8d' };
  return { ...base, backgroundColor: '#eaf4fb', color: '#1a5276' };
};

function Notification({ message, type, onClose }) {
  if (!message) return null;
  const styles = {
    success:  { bg: '#eafaf1', border: '#27ae60', text: '#1e8449', icon: '✅' },
    error:    { bg: '#fdedec', border: '#e74c3c', text: '#c0392b', icon: '❌' },
    conflict: { bg: '#fef5e7', border: '#e67e22', text: '#d35400', icon: '⚠️' },
  };
  const s = styles[type] || styles.error;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', borderRadius: '6px', marginBottom: '16px',
      backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text, fontWeight: '500'
    }}>
      <span>{s.icon} {message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.text, fontSize: '1.2em' }}>×</button>
    </div>
  );
}

const EMPTY_FORM = { patient: '', therapy: '', therapist: '', room: '', date: '', time: '' };

export default function BookingDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [loading, setLoading]           = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [filterDate, setFilterDate]     = useState('');
  const [protocolNote, setProtocolNote] = useState('');

  const showNotification = (message, type) => setNotification({ message, type });
  const clearNotification = () => setNotification({ message: '', type: '' });

  const fetchAppointments = () => {
    setFetchLoading(true);
    axios.get('http://localhost:3000/appointments')
      .then(res => setAppointments(res.data))
      .catch(() => showNotification('Could not load appointments. Is the gateway running?', 'error'))
      .finally(() => setFetchLoading(false));
  };

  const handleCancel = (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    axios.delete(`http://localhost:3000/appointments/${id}`)
      .then(() => {
        showNotification('Appointment cancelled successfully.', 'success');
        fetchAppointments();
      })
      .catch(() => showNotification('Could not cancel appointment.', 'error'));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (e.target.name === 'therapy') {
      if (e.target.value === 'Abhyanga')
        setProtocolNote('⚠️ Protocol: Svedana (steam) must follow immediately after Abhyanga.');
      else if (e.target.value === 'Svedana')
        setProtocolNote('ℹ️ Ensure Abhyanga was completed in the previous session.');
      else if (['Virechana', 'Vamana', 'Basti'].includes(e.target.value))
        setProtocolNote('⚠️ This therapy requires Purvakarma preparation (Abhyanga + Svedana) first.');
      else
        setProtocolNote('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    clearNotification();

    axios.post('http://localhost:3000/book', formData)
      .then(res => {
        const pyRes = res.data.python_response;
        if (pyRes.status === 'processed') {
          const note = pyRes.protocol_note ? ` | ${pyRes.protocol_note}` : '';
          showNotification(`Booking confirmed for ${formData.patient}!${note}`, 'success');
          setFormData(EMPTY_FORM);
          setProtocolNote('');
          fetchAppointments();
        } else {
          showNotification(pyRes.message || 'Unexpected response.', 'error');
        }
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 409)
            showNotification(err.response.data.error || 'Scheduling conflict detected!', 'conflict');
          else if (err.response.status === 400)
            showNotification(err.response.data.error || 'Invalid data.', 'error');
          else
            showNotification(`Server Error (${err.response.status}).`, 'error');
        } else {
          showNotification('Cannot reach the gateway. Make sure both servers are running.', 'error');
        }
      })
      .finally(() => setLoading(false));
  };

  const inputStyle = {
    padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc',
    fontSize: '0.95em', width: '100%', boxSizing: 'border-box'
  };
  const labelStyle = {
    fontSize: '0.85em', color: '#555', fontWeight: '600',
    display: 'block', marginBottom: '4px'
  };

  const filtered = filterDate
    ? appointments.filter(a => a.date === filterDate)
    : appointments;

  const selectedTherapyInfo = THERAPY_OPTIONS.find(t => t.value === formData.therapy);

  return (
    <div>
      <h2 style={{ color: '#1a5276', marginTop: 0 }}> Daily Schedule & Booking</h2>

      <Notification message={notification.message} type={notification.type} onClose={clearNotification} />

      {/* ── Booking Form ── */}
      <div style={{
        backgroundColor: '#fff', padding: '24px', borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '28px'
      }}>
        <h3 style={{ marginTop: 0, color: '#27ae60', borderBottom: '2px solid #eafaf1', paddingBottom: '10px' }}>
          📋 New Treatment Booking
        </h3>

        {selectedTherapyInfo && (
          <div style={{
            backgroundColor: '#f0f4ff', padding: '8px 14px', borderRadius: '6px',
            marginBottom: '16px', fontSize: '0.85em', color: '#1a5276'
          }}>
            <strong>Phase:</strong>{' '}
            <span style={{ color: PHASE_COLORS[selectedTherapyInfo.phase], fontWeight: 'bold' }}>
              {selectedTherapyInfo.phase}
            </span>
            {protocolNote && (
              <div style={{ marginTop: '4px', color: '#d35400' }}>{protocolNote}</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Patient Name *</label>
              <input name="patient" type="text" value={formData.patient}
                onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Therapist ID *</label>
              <input name="therapist" type="text" value={formData.therapist}
                onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Therapy Type *</label>
              <select name="therapy" value={formData.therapy} onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#fff', cursor: 'pointer' }} required>
                <option value="">-- Select Therapy --</option>
                {['Purvakarma', 'Pradhana Karma'].map(phase => (
                  <optgroup key={phase} label={`── ${phase} ──`}>
                    {THERAPY_OPTIONS.filter(t => t.phase === phase).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Room Number *</label>
              <input name="room" type="text" value={formData.room}
                onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Appointment Date *</label>
              <input name="date" type="date" value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Appointment Time *</label>
              <input name="time" type="time" value={formData.time}
                onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '11px 28px',
            backgroundColor: loading ? '#a9dfbf' : '#27ae60',
            color: 'white', border: 'none', borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '1em'
          }}>
            {loading ? '⏳ Checking Schedule...' : '✔ Book Appointment'}
          </button>
        </form>
      </div>

      {/* ── Schedule Table ── */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden'
      }}>
        {/* Table Header Bar — stays outside scroll */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '10px'
        }}>
          <h3 style={{ margin: 0, color: '#34495e' }}>📅 Confirmed Schedule</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="date" value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85em' }} />
            <button onClick={() => setFilterDate('')} style={{
              padding: '6px 12px', borderRadius: '4px', border: 'none',
              cursor: filterDate ? 'pointer' : 'default', fontSize: '0.85em', fontWeight: '600',
              backgroundColor: filterDate ? '#e74c3c' : '#f0f0f0',
              color: filterDate ? 'white' : '#999'
            }}>✕ Clear</button>
            <button onClick={fetchAppointments} style={{
              padding: '6px 14px', backgroundColor: '#eaf4fb', color: '#1a5276',
              border: '1px solid #aed6f1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em'
            }}>↻ Refresh</button>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {fetchLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' }}>
                  {['Patient', 'Therapy', 'Phase', 'Therapist', 'Room', 'Date', 'Time', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', fontSize: '0.88em',
                      position: 'sticky', top: 0, backgroundColor: '#2c3e50', zIndex: 1
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((apt) => {
                  const therapyInfo = THERAPY_OPTIONS.find(t => t.value === apt.therapy);
                  return (
                    <tr key={apt._id} style={{
                      borderBottom: '1px solid #f0f0f0',
                      opacity: apt.status === 'Cancelled' ? 0.55 : 1
                    }}>
                      <td style={{ padding: '12px 14px', fontWeight: '500' }}>{apt.patient}</td>
                      <td style={{ padding: '12px 14px', color: '#2980b9' }}>{apt.therapy || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {therapyInfo && (
                          <span style={{ fontSize: '0.8em', color: PHASE_COLORS[therapyInfo.phase], fontWeight: '600' }}>
                            {therapyInfo.phase}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>{apt.therapist || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{apt.room}</td>
                      <td style={{ padding: '12px 14px' }}>{apt.date || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{apt.time}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={getStatusStyle(apt.status)}>{apt.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {apt.status !== 'Cancelled' && user?.role === 'Doctor' && (
                          <button onClick={() => handleCancel(apt._id)} style={{
                            padding: '4px 10px', backgroundColor: '#fde8e8', color: '#c0392b',
                            border: '1px solid #e74c3c', borderRadius: '4px',
                            cursor: 'pointer', fontSize: '0.78em', fontWeight: '600'
                          }}>✕ Cancel</button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}