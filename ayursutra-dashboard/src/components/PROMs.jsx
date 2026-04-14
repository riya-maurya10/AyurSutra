import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SYMPTOMS = ['Pain/Discomfort', 'Energy Level', 'Sleep Quality', 'Digestion', 'Stress Level', 'Overall Wellbeing'];

const EMPTY_FORM = {
  patientName: '', sessionDate: '', therapyReceived: '', sessionNumber: 1,
  ratings: { 'Pain/Discomfort': 5, 'Energy Level': 5, 'Sleep Quality': 5, 'Digestion': 5, 'Stress Level': 5, 'Overall Wellbeing': 5 },
  improvements: '', sideEffects: '', additionalNotes: '', recommendToOthers: ''
};

const THERAPY_OPTIONS = ['Abhyanga', 'Svedana', 'Basti', 'Shirodhara', 'Virechana', 'Vamana', 'Nasya'];

export default function PROMs() {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [allFeedback, setFeedback] = useState([]);
  const [view, setView]           = useState('list');
  const [saving, setSaving]       = useState(false);
  const [filterPatient, setFilter] = useState('');

  useEffect(() => { fetchFeedback(); }, []);

  const fetchFeedback = () => {
    axios.get('http://localhost:3000/proms')
      .then(res => setFeedback(res.data))
      .catch(() => {});
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRating = (symptom, value) => {
    setForm({ ...form, ratings: { ...form.ratings, [symptom]: parseInt(value) } });
  };

  const handleSubmit = () => {
    if (!form.patientName || !form.sessionDate) { alert('Patient name and session date are required.'); return; }
    setSaving(true);
    axios.post('http://localhost:3000/proms', form)
      .then(() => { fetchFeedback(); setView('list'); setForm(EMPTY_FORM); })
      .catch(() => alert('Could not save feedback.'))
      .finally(() => setSaving(false));
  };

  const getRatingColor = (value) => {
    if (value >= 8) return '#27ae60';
    if (value >= 5) return '#f39c12';
    return '#e74c3c';
  };

  const getRatingLabel = (symptom, value) => {
    if (symptom === 'Pain/Discomfort' || symptom === 'Stress Level') {
      if (value <= 3) return 'Low ✅';
      if (value <= 6) return 'Moderate';
      return 'High ⚠️';
    }
    if (value >= 8) return 'Excellent';
    if (value >= 5) return 'Good';
    return 'Poor';
  };

  const filtered = filterPatient
    ? allFeedback.filter(f => f.patientName.toLowerCase().includes(filterPatient.toLowerCase()))
    : allFeedback;

  const inputStyle = { padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.93em', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.83em', color: '#555', fontWeight: '600', display: 'block', marginBottom: '4px' };

  if (view === 'new') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => setView('list')} style={{ padding: '7px 14px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
          <h2 style={{ color: '#1a5276', margin: 0 }}>💬 New Patient Feedback (PROM)</h2>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, color: '#1a5276' }}>Session Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Patient Name *</label><input name="patientName" value={form.patientName} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Session Date *</label><input name="sessionDate" type="date" value={form.sessionDate} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Therapy Received</label>
              <select name="therapyReceived" value={form.therapyReceived} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                <option value="">Select therapy</option>
                {THERAPY_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Session Number</label><input name="sessionNumber" type="number" min="1" value={form.sessionNumber} onChange={handleChange} style={inputStyle} /></div>
          </div>
        </div>

        {/* Symptom Ratings */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, color: '#1a5276' }}>Symptom Ratings (1 = worst, 10 = best)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {SYMPTOMS.map(symptom => (
              <div key={symptom}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.88em', fontWeight: '600', color: '#444' }}>{symptom}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.2em', fontWeight: '700', color: getRatingColor(form.ratings[symptom]) }}>{form.ratings[symptom]}</span>
                    <span style={{ fontSize: '0.75em', color: getRatingColor(form.ratings[symptom]), fontWeight: '600' }}>{getRatingLabel(symptom, form.ratings[symptom])}</span>
                  </div>
                </div>
                <input type="range" min="1" max="10" value={form.ratings[symptom]}
                  onChange={e => handleRating(symptom, e.target.value)} style={{ width: '100%', accentColor: getRatingColor(form.ratings[symptom]) }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72em', color: '#999' }}>
                  <span>1</span><span>5</span><span>10</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, color: '#1a5276' }}>Qualitative Feedback</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Improvements Noticed</label><textarea name="improvements" value={form.improvements} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }}  /></div>
            <div><label style={labelStyle}>Side Effects / Concerns</label><textarea name="sideEffects" value={form.sideEffects} onChange={handleChange} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} /></div>
            <div><label style={labelStyle}>Additional Notes</label><textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} /></div>
            <div>
              <label style={labelStyle}>Would you recommend AyurSutra?</label>
              <select name="recommendToOthers" value={form.recommendToOthers} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                <option value="">Select</option>
                <option value="Definitely Yes">Definitely Yes</option>
                <option value="Yes">Yes</option>
                <option value="Maybe">Maybe</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={saving} style={{ padding: '11px 28px', backgroundColor: saving ? '#a9dfbf' : '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {saving ? 'Saving...' : '💾 Submit Feedback'}
        </button>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1a5276', margin: 0 }}>Patient-Reported Outcomes (PROMs)</h2>
        <button onClick={() => setView('new')} style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Submit Feedback
        </button>
      </div>

      {/* Filter */}
      <div style={{ backgroundColor: '#fff', padding: '14px 20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <input type="text" value={filterPatient}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.93em', width: '280px' }} />
      </div>

      {/* Feedback Cards */}
      {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>          {filtered.map((fb, i) => {
            const avgRating = fb.ratings ? Math.round(Object.values(fb.ratings).reduce((a, b) => a + b, 0) / Object.values(fb.ratings).length) : 0;
            return (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${getRatingColor(avgRating)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1a5276' }}>{fb.patientName}</div>
                    <div style={{ fontSize: '0.82em', color: '#666' }}>{fb.therapyReceived} — Session {fb.sessionNumber}</div>
                    <div style={{ fontSize: '0.78em', color: '#999' }}>{fb.sessionDate}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6em', fontWeight: '700', color: getRatingColor(avgRating) }}>{avgRating}</div>
                    <div style={{ fontSize: '0.7em', color: '#999' }}>avg score</div>
                  </div>
                </div>
                {/* Mini rating bars */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                  {fb.ratings && Object.entries(fb.ratings).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.7em', color: '#666', width: '80px', flexShrink: 0 }}>{k.split(' ')[0]}</span>
                      <div style={{ flex: 1, backgroundColor: '#eee', borderRadius: '3px', height: '6px' }}>
                        <div style={{ width: `${v * 10}%`, height: '100%', backgroundColor: getRatingColor(v), borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.7em', color: '#666' }}>{v}</span>
                    </div>
                  ))}
                </div>
                {fb.improvements && <div style={{ fontSize: '0.82em', color: '#555', backgroundColor: '#f0faf4', padding: '6px 10px', borderRadius: '4px', marginBottom: '6px' }}>✅ {fb.improvements}</div>}
                {fb.sideEffects && <div style={{ fontSize: '0.82em', color: '#d35400', backgroundColor: '#fef5e7', padding: '6px 10px', borderRadius: '4px', marginBottom: '6px' }}>⚠️ {fb.sideEffects}</div>}
                {fb.recommendToOthers && <div style={{ fontSize: '0.78em', color: '#888' }}>Recommend: <strong>{fb.recommendToOthers}</strong></div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '40px', textAlign: 'center', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          No feedback submitted yet. Click "+ Submit Feedback" to add one.
        </div>
      )}
    </div>
  );
}