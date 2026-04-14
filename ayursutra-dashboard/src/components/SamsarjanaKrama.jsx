import React, { useState } from 'react';
import axios from 'axios';

const DIET_PHASES = [
  {
    day: 'Day 1-2',
    phase: 'Peya (Thin Rice Gruel)',
    description: 'Very thin, liquid rice gruel. Highly digestible. No salt or spices.',
    foods: ['Thin rice gruel (Peya)', 'Warm water', 'Diluted herbal tea'],
    avoid: ['Solid foods', 'Dairy', 'Spices', 'Raw vegetables'],
    color: '#eaf4fb'
  },
  {
    day: 'Day 3-4',
    phase: 'Vilepi (Thick Rice Gruel)',
    description: 'Slightly thicker gruel. Digestive fire is slowly rekindled.',
    foods: ['Thick rice gruel (Vilepi)', 'Rock salt (minimal)', 'Warm water'],
    avoid: ['Heavy foods', 'Fried items', 'Cold drinks', 'Meat'],
    color: '#eafaf1'
  },
  {
    day: 'Day 5-6',
    phase: 'Akrita Yusha (Thin Vegetable Soup)',
    description: 'Plain vegetable soup without oil or ghee. Light proteins introduced.',
    foods: ['Thin lentil soup', 'Vegetable broth', 'Soft cooked vegetables'],
    avoid: ['Ghee', 'Oil', 'Spicy food', 'Fermented foods'],
    color: '#fef9e7'
  },
  {
    day: 'Day 7-8',
    phase: 'Krita Yusha (Seasoned Vegetable Soup)',
    description: 'Vegetable soup with minimal ghee and mild spices introduced.',
    foods: ['Lentil soup with ghee', 'Soft rice', 'Steamed vegetables', 'Ginger tea'],
    avoid: ['Heavy meats', 'Alcohol', 'Processed foods', 'Cold foods'],
    color: '#fdf2f8'
  },
  {
    day: 'Day 9-10',
    phase: 'Akrita Mamsa (Plain Meat Soup)',
    description: 'For non-vegetarians only. Plain meat broth without heavy spices.',
    foods: ['Thin meat broth', 'Soft cooked dal', 'Plain rice', 'Warm milk'],
    avoid: ['Fried meat', 'Heavy curries', 'Bakery items'],
    color: '#fef5e7'
  },
  {
    day: 'Day 11-14',
    phase: 'Normal Diet (Gradual Return)',
    description: 'Slowly return to normal diet. Avoid incompatible food combinations.',
    foods: ['Normal home cooked food', 'Fresh fruits', 'Dairy', 'Whole grains'],
    avoid: ['Junk food', 'Alcohol', 'Incompatible combinations (milk + fish)'],
    color: '#f0faf4'
  }
];

const LIFESTYLE_RULES = [
  { icon: '😴', rule: 'Adequate sleep (8+ hours)', category: 'Rest' },
  { icon: '🚶', rule: 'Light walking only — no strenuous exercise', category: 'Activity' },
  { icon: '🌞', rule: 'Avoid direct sun exposure and cold wind', category: 'Environment' },
  { icon: '🧘', rule: 'Practice pranayama and gentle yoga', category: 'Mind' },
  { icon: '🚿', rule: 'Warm water baths only — no cold showers', category: 'Hygiene' },
  { icon: '📵', rule: 'Minimize screen time and mental stress', category: 'Mind' },
  { icon: '🌿', rule: 'Take prescribed herbal supplements regularly', category: 'Medication' },
  { icon: '🥛', rule: 'Drink warm water throughout the day', category: 'Hydration' },
];

const EMPTY_FORM = {
  patientName: '', patientId: '', therapyCompleted: '', completionDate: '',
  doctorNotes: '', vegetarian: 'yes'
};

export default function SamsarjanaKrama() {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [view, setView]       = useState('guide'); // 'guide' | 'create'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    if (!form.patientName || !form.completionDate) {
      alert('Patient name and completion date are required.');
      return;
    }
    setSaving(true);
    axios.post('http://localhost:3000/samsarjana', { ...form, dietPlan: DIET_PHASES })
      .then(() => { setSaved(true); })
      .catch(() => alert('Could not save. Is the gateway running?'))
      .finally(() => setSaving(false));
  };

  const inputStyle = { padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.93em', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.83em', color: '#555', fontWeight: '600', display: 'block', marginBottom: '4px' };

  const handlePrint = () => {
  const printContent = `
    <html>
    <head>
      <title>Samsarjana Krama Diet Plan — AyurSutra</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        h1 { color: #1a5276; border-bottom: 2px solid #27ae60; padding-bottom: 10px; }
        h2 { color: #27ae60; margin-top: 24px; font-size: 1.1em; }
        h3 { color: #1a5276; margin: 6px 0; font-size: 1em; }
        .phase { border: 1px solid #ddd; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
        .foods li { color: #27ae60; font-size: 0.9em; margin-bottom: 4px; }
        .avoid li { color: #e74c3c; font-size: 0.9em; margin-bottom: 4px; }
        .lifestyle { margin-top: 20px; }
        .lifestyle li { margin-bottom: 6px; font-size: 0.9em; }
        .header-info { background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9em; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        @media print { body { padding: 15px; } }
      </style>
    </head>
    <body>
      <h1>🌿 AyurSutra — Samsarjana Krama Diet Plan</h1>
      <div class="header-info">
        <strong>Patient:</strong> ${form.patientName || '_______________'} &nbsp;&nbsp;
        <strong>ID:</strong> ${form.patientId || '___'} &nbsp;&nbsp;
        <strong>Therapy Completed:</strong> ${form.therapyCompleted || '_______________'} &nbsp;&nbsp;
        <strong>Start Date:</strong> ${form.completionDate || '_______________'}
        ${form.doctorNotes ? `<br/><strong>Doctor's Notes:</strong> ${form.doctorNotes}` : ''}
      </div>

      <h2>📋 14-Day Dietary Rehabilitation Plan</h2>
      ${DIET_PHASES.map(phase => `
        <div class="phase">
          <h3>${phase.day} — ${phase.phase}</h3>
          <p style="font-size:0.88em; color:#555; margin:4px 0 10px">${phase.description}</p>
          <div class="grid">
            <div>
              <strong style="color:#27ae60">✅ Recommended:</strong>
              <ul class="foods">${phase.foods.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
            <div>
              <strong style="color:#e74c3c">❌ Avoid:</strong>
              <ul class="avoid">${phase.avoid.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      `).join('')}

      <div class="lifestyle">
        <h2>🌿 Lifestyle Guidelines (All 14 days)</h2>
        <ul>
          ${LIFESTYLE_RULES.map(r => `<li><strong>${r.category}:</strong> ${r.rule}</li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        Generated by AyurSutra Clinic Portal — NABH/AYUSH Compliant &nbsp;|&nbsp;
        Date: ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
  const win = window.open('', '_blank');
  win.document.write(printContent);
  win.document.close();
  win.print();
};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#1a5276', margin: 0 }}>  Samsarjana Krama</h2>
          <p style={{ color: '#7f8c8d', margin: '4px 0 0', fontSize: '0.88em' }}>
            Post-Panchakarma dietary rehabilitation plan — gradual return to normal diet
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
  <button onClick={handlePrint} style={{
    padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
    fontSize: '0.88em', backgroundColor: '#2980b9', color: 'white', border: 'none'
  }}>🖨️ Print Plan</button>
  <button onClick={() => setView('guide')} style={{
            padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88em',
            backgroundColor: view === 'guide' ? '#27ae60' : '#f0f0f0',
            color: view === 'guide' ? 'white' : '#555', border: 'none'
          }}>📖 Diet Guide</button>
          <button onClick={() => setView('create')} style={{
            padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88em',
            backgroundColor: view === 'create' ? '#27ae60' : '#f0f0f0',
            color: view === 'create' ? 'white' : '#555', border: 'none'
          }}>+ Assign to Patient</button>
        </div>
      </div>

      {view === 'guide' && (
        <>
          {/* Info Banner */}
          <div style={{ backgroundColor: '#eafaf1', border: '1px solid #a9dfbf', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <strong style={{ color: '#1d8348' }}>📜 What is Samsarjana Krama?</strong>
            <p style={{ color: '#2e7d52', margin: '6px 0 0', fontSize: '0.9em', lineHeight: '1.6' }}>
              After Panchakarma, the digestive fire (Agni) is weak. Samsarjana Krama is a systematic
              14-day dietary protocol that gradually rebuilds digestive strength — starting from liquids
              and progressing to normal food. Skipping this phase can nullify treatment benefits.
            </p>
          </div>

          {/* Phase Timeline */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {DIET_PHASES.map((phase, i) => (
              <button key={i} onClick={() => setActiveDay(i)} style={{
                padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                backgroundColor: activeDay === i ? '#27ae60' : '#fff',
                color: activeDay === i ? 'white' : '#555',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontWeight: '600',
                fontSize: '0.8em', whiteSpace: 'nowrap', flexShrink: 0,
                borderBottom: activeDay === i ? 'none' : '2px solid #e0e0e0'
              }}>
                {phase.day}
              </button>
            ))}
          </div>

          {/* Active Phase Detail */}
          <div style={{ backgroundColor: DIET_PHASES[activeDay].color, borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
            <h3 style={{ color: '#1a5276', marginTop: 0 }}>{DIET_PHASES[activeDay].phase}</h3>
            <p style={{ color: '#555', fontSize: '0.93em', marginBottom: '20px' }}>{DIET_PHASES[activeDay].description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ color: '#27ae60', marginTop: 0, fontSize: '0.95em' }}>✅ Recommended Foods</h4>
                {DIET_PHASES[activeDay].foods.map((food, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#27ae60', borderRadius: '50%', flexShrink: 0 }}></div>
                    <span style={{ fontSize: '0.88em', color: '#333' }}>{food}</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ color: '#e74c3c', marginTop: 0, fontSize: '0.95em' }}>❌ Foods to Avoid</h4>
                {DIET_PHASES[activeDay].avoid.map((food, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#e74c3c', borderRadius: '50%', flexShrink: 0 }}></div>
                    <span style={{ fontSize: '0.88em', color: '#333' }}>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lifestyle Rules */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#1a5276', marginTop: 0 }}>🌿 Lifestyle Guidelines (All 14 days)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {LIFESTYLE_RULES.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                  <span style={{ fontSize: '1.4em' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.75em', color: '#27ae60', fontWeight: '700', marginBottom: '2px' }}>{item.category}</div>
                    <div style={{ fontSize: '0.88em', color: '#333' }}>{item.rule}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'create' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginTop: 0, color: '#1a5276' }}>Assign Samsarjana Krama to Patient</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Patient Name *</label>
              <input name="patientName" value={form.patientName} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Patient ID</label>
              <input name="patientId" value={form.patientId} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Therapy Completed</label>
              <select name="therapyCompleted" value={form.therapyCompleted} onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#fff' }}>
                <option value="">Select therapy</option>
                <option>Abhyanga</option><option>Svedana</option><option>Basti</option>
                <option>Virechana</option><option>Vamana</option><option>Nasya</option><option>Shirodhara</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Treatment Completion Date *</label>
              <input name="completionDate" type="date" value={form.completionDate} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dietary Preference</label>
              <select name="vegetarian" value={form.vegetarian} onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#fff' }}>
                <option value="yes">Vegetarian</option>
                <option value="no">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Doctor's Notes</label>
              <textarea name="doctorNotes" value={form.doctorNotes} onChange={handleChange}
                style={{ ...inputStyle, height: '70px', resize: 'vertical' }} />
            </div>
          </div>

          {/* Preview */}
          <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '0.85em', fontWeight: '700', color: '#555', marginBottom: '10px' }}>📋 Plan Preview</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DIET_PHASES.map((p, i) => (
                <div key={i} style={{ backgroundColor: p.color, border: '1px solid #ddd', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78em', color: '#333' }}>
                  <strong>{p.day}</strong><br />{p.phase.split('(')[0]}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '11px 28px', backgroundColor: saving ? '#a9dfbf' : '#27ae60',
              color: 'white', border: 'none', borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold'
            }}>
              {saving ? 'Saving...' : '💾 Save Diet Plan'}
            </button>
            {saved && <span style={{ color: '#27ae60', fontWeight: '600' }}>✅ Diet plan saved!</span>}
          </div>
        </div>
      )}
    </div>
  );
}