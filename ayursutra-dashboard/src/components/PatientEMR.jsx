import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DOSHAS = ['Vata', 'Pitta', 'Kapha'];
const PARIKSHA_FIELDS = [
  { key: 'nadi', label: 'Nadi (Pulse)' },
  { key: 'mutra', label: 'Mutra (Urine)' },
  { key: 'mala', label: 'Mala (Stool)' },
  { key: 'jihva', label: 'Jihva (Tongue)' },
  { key: 'shabda', label: 'Shabda (Voice)' },
  { key: 'sparsha', label: 'Sparsha (Skin)' },
  { key: 'drik', label: 'Drik (Eyes)' },
  { key: 'akriti', label: 'Akriti (Appearance)' },
];

const EMPTY_EMR = {
  patientName: '', patientId: '', age: '', gender: '', contact: '',
  prakriti: { Vata: 33, Pitta: 33, Kapha: 34 },
  vikriti: { Vata: 33, Pitta: 33, Kapha: 34 },
  ashtavidha: { nadi: '', mutra: '', mala: '', jihva: '', shabda: '', sparsha: '', drik: '', akriti: '' },
  chiefComplaint: '', medicalHistory: '', currentMedications: '',
  allergies: '', previousTreatments: '', dietaryHabits: '', lifestyle: '',
  doctorNotes: ''
};

export default function PatientEMR() {
  const [form, setForm]         = useState(EMPTY_EMR);
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [view, setView]       = useState('list');
  const [search, setSearch]   = useState(''); // 'list' | 'new' | 'view'

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = () => {
    axios.get('http://localhost:3000/patients')
      .then(res => setPatients(res.data))
      .catch(() => {});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleDosha = (type, dosha, value) => {
    const total = 100;
    const newVal = Math.max(0, Math.min(100, parseInt(value) || 0));
    setForm({ ...form, [type]: { ...form[type], [dosha]: newVal } });
    setSaved(false);
  };

  const handlePariksha = (key, value) => {
    setForm({ ...form, ashtavidha: { ...form.ashtavidha, [key]: value } });
    setSaved(false);
  };

  const handleSave = () => {
    if (!form.patientName) { alert('Patient name is required.'); return; }
    setSaving(true);
    axios.post('http://localhost:3000/patients', form)
      .then(res => { setSaved(true); fetchPatients(); setView('list'); })
      .catch(() => alert('Could not save EMR. Is the gateway running?'))
      .finally(() => setSaving(false));
  };

  const viewPatient = (patient) => {
    setSelected(patient);
    setView('view');
  };

  const inputStyle = { padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.93em', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.83em', color: '#555', fontWeight: '600', display: 'block', marginBottom: '4px' };
  const cardStyle  = { backgroundColor: '#fff', padding: '20px 24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' };

  const DoshaBar = ({ type, label }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '0.85em', fontWeight: '700', color: '#1a5276', marginBottom: '8px' }}>{label}</div>
      {DOSHAS.map(dosha => (
        <div key={dosha} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ width: '50px', fontSize: '0.85em', fontWeight: '600', color: dosha === 'Vata' ? '#2980b9' : dosha === 'Pitta' ? '#e74c3c' : '#27ae60' }}>{dosha}</span>
          <input type="range" min="0" max="100" value={form[type][dosha]}
            onChange={e => handleDosha(type, dosha, e.target.value)}
            style={{ flex: 1 }} />
          <span style={{ width: '40px', textAlign: 'right', fontSize: '0.85em', fontWeight: '600' }}>{form[type][dosha]}%</span>
          <div style={{ width: '80px', height: '10px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '5px',
              width: `${form[type][dosha]}%`,
              backgroundColor: dosha === 'Vata' ? '#2980b9' : dosha === 'Pitta' ? '#e74c3c' : '#27ae60'
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'view' && selected) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => setView('list')} style={{ padding: '7px 14px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
          <h2 style={{ color: '#1a5276', margin: 0 }}>📋 EMR: {selected.patientName}</h2>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[['Patient ID', selected.patientId], ['Age', selected.age], ['Gender', selected.gender], ['Contact', selected.contact]].map(([l, v]) => (
              <div key={l}><span style={{ fontWeight: '600', color: '#555', fontSize: '0.85em' }}>{l}:</span> <span style={{ fontSize: '0.93em' }}>{v || '—'}</span></div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={cardStyle}>
            <h4 style={{ color: '#1a5276', marginTop: 0 }}>Prakriti (Constitution)</h4>
            {DOSHAS.map(d => (
              <div key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85em', fontWeight: '600' }}>{d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '100px', height: '10px', backgroundColor: '#eee', borderRadius: '5px' }}>
                    <div style={{ width: `${selected.prakriti?.[d] || 0}%`, height: '100%', backgroundColor: d === 'Vata' ? '#2980b9' : d === 'Pitta' ? '#e74c3c' : '#27ae60', borderRadius: '5px' }}></div>
                  </div>
                  <span style={{ fontSize: '0.85em' }}>{selected.prakriti?.[d] || 0}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#1a5276', marginTop: 0 }}>Vikriti (Current Imbalance)</h4>
            {DOSHAS.map(d => (
              <div key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85em', fontWeight: '600' }}>{d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '100px', height: '10px', backgroundColor: '#eee', borderRadius: '5px' }}>
                    <div style={{ width: `${selected.vikriti?.[d] || 0}%`, height: '100%', backgroundColor: d === 'Vata' ? '#2980b9' : d === 'Pitta' ? '#e74c3c' : '#27ae60', borderRadius: '5px' }}></div>
                  </div>
                  <span style={{ fontSize: '0.85em' }}>{selected.vikriti?.[d] || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={cardStyle}>
          <h4 style={{ color: '#1a5276', marginTop: 0 }}>Ashtavidha Pariksha (8-Fold Examination)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {PARIKSHA_FIELDS.map(f => (
              <div key={f.key}><span style={{ fontWeight: '600', color: '#555', fontSize: '0.85em' }}>{f.label}:</span> <span style={{ fontSize: '0.9em' }}>{selected.ashtavidha?.[f.key] || '—'}</span></div>
            ))}
          </div>
        </div>
        <div style={cardStyle}>
          <h4 style={{ color: '#1a5276', marginTop: 0 }}>Clinical Notes</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[['Chief Complaint', selected.chiefComplaint], ['Medical History', selected.medicalHistory], ['Current Medications', selected.currentMedications], ['Allergies', selected.allergies], ['Previous Treatments', selected.previousTreatments], ["Doctor's Notes", selected.doctorNotes]].map(([l, v]) => (
              <div key={l}><div style={{ fontWeight: '600', color: '#555', fontSize: '0.85em', marginBottom: '3px' }}>{l}:</div><div style={{ fontSize: '0.9em', color: v ? '#333' : '#999' }}>{v || 'None recorded'}</div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'new') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => setView('list')} style={{ padding: '7px 14px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
          <h2 style={{ color: '#1a5276', margin: 0 }}>📋 New Patient EMR</h2>
        </div>

        {/* Basic Info */}
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, color: '#1a5276' }}>Patient Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><label style={labelStyle}>Patient Name *</label><input name="patientName" value={form.patientName} onChange={handleChange} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Patient ID</label><input name="patientId" value={form.patientId} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Age</label><input name="age" type="number" value={form.age} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} style={{ ...inputStyle, backgroundColor: '#fff' }}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Contact Number</label><input name="contact" value={form.contact} onChange={handleChange} style={{ ...inputStyle, maxWidth: '250px' }} /></div>
          </div>
        </div>

        {/* Prakriti & Vikriti */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={cardStyle}><DoshaBar type="prakriti" label="Prakriti (Natural Constitution)" /></div>
          <div style={cardStyle}><DoshaBar type="vikriti" label="Vikriti (Current Imbalance)" /></div>
        </div>

        {/* Ashtavidha Pariksha */}
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, color: '#1a5276' }}>Ashtavidha Pariksha (8-Fold Examination)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {PARIKSHA_FIELDS.map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input value={form.ashtavidha[f.key]} onChange={e => handlePariksha(f.key, e.target.value)} style={inputStyle} placeholder={`Findings for ${f.label}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Notes */}
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, color: '#1a5276' }}>Clinical Notes</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[['chiefComplaint','Chief Complaint'],['medicalHistory','Medical History'],['currentMedications','Current Medications'],['allergies','Allergies'],['previousTreatments','Previous Ayurvedic Treatments'],['dietaryHabits','Dietary Habits'],['lifestyle','Lifestyle'],['doctorNotes',"Doctor's Notes"]].map(([name, label]) => (
              <div key={name}>
                <label style={labelStyle}>{label}</label>
                <textarea name={name} value={form[name]} onChange={handleChange}
                  style={{ ...inputStyle, height: '70px', resize: 'vertical' }} placeholder={label} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '11px 28px', backgroundColor: saving ? '#a9dfbf' : '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            {saving ? 'Saving...' : '💾 Save EMR'}
          </button>
          {saved && <span style={{ color: '#27ae60', fontWeight: '600', alignSelf: 'center' }}>✅ Saved!</span>}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1a5276', margin: 0 }}>Patient EMR</h2>
        <button onClick={() => { setForm(EMPTY_EMR); setSaved(false); setView('new'); }} style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          + New Patient
        </button>
      </div>
<div style={{ backgroundColor: '#fff', padding: '14px 20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
  <input
    type="text"
    value={search}
    onChange={e => setSearch(e.target.value)}
    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.93em', width: '280px' }}
  />
</div>
<div style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', maxHeight: '500px', overflowY: 'auto' }}>        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
              {['Patient ID', 'Name', 'Age', 'Gender', 'Dominant Prakriti', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.88em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.filter(p => p.patientName.toLowerCase().includes(search.toLowerCase()) || (p.patientId || '').toLowerCase().includes(search.toLowerCase())).length > 0 ? patients.filter(p => p.patientName.toLowerCase().includes(search.toLowerCase()) || (p.patientId || '').toLowerCase().includes(search.toLowerCase())).map(p => {
              const dominant = p.prakriti ? Object.entries(p.prakriti).sort((a, b) => b[1] - a[1])[0]?.[0] : '—';
              return (
                <tr key={p._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', color: '#2980b9', fontWeight: '600' }}>{p.patientId || '—'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{p.patientName}</td>
                  <td style={{ padding: '12px 16px' }}>{p.age || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{p.gender || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: '600', color: dominant === 'Vata' ? '#2980b9' : dominant === 'Pitta' ? '#e74c3c' : '#27ae60' }}>{dominant}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => viewPatient(p)} style={{ padding: '5px 12px', backgroundColor: '#eaf4fb', color: '#1a5276', border: '1px solid #aed6f1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em' }}>View EMR</button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>No patients registered yet. Click "+ New Patient" to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}