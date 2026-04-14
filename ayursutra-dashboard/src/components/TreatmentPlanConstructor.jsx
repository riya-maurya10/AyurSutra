import React, { useState, useEffect } from 'react';
import axios from 'axios';

const THERAPIES = [
  { value: 'Abhyanga',        label: 'Abhyanga',   color: '#2980b9', phase: 'Purvakarma' },
  { value: 'Svedana',         label: 'Svedana',    color: '#27ae60', phase: 'Purvakarma' },
  { value: 'Basti-Anuvasana', label: 'Basti-A',    color: '#8e44ad', phase: 'Pradhana Karma' },
  { value: 'Basti-Niruha',    label: 'Basti-N',    color: '#6c3483', phase: 'Pradhana Karma' },
  { value: 'Shirodhara',      label: 'Shirodhara', color: '#f39c12', phase: 'Pradhana Karma' },
  { value: 'Virechana',       label: 'Virechana',  color: '#e74c3c', phase: 'Pradhana Karma' },
  { value: 'Vamana',          label: 'Vamana',     color: '#16a085', phase: 'Pradhana Karma' },
  { value: 'Nasya',           label: 'Nasya',      color: '#d35400', phase: 'Pradhana Karma' },
  { value: 'REST',            label: 'Rest Day',   color: '#95a5a6', phase: 'Paschat Karma' },
  { value: 'Diet',            label: 'Diet Plan',  color: '#1abc9c', phase: 'Paschat Karma' },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const TOTAL_DAYS = 14;

const getTherapyInfo = (value) => THERAPIES.find(t => t.value === value);

export default function TreatmentPlanConstructor() {
  const [patientName, setPatientName]   = useState('');
  const [patientId, setPatientId]       = useState('');
  const [startDate, setStartDate]       = useState('');
  const [selectedTherapy, setSelected]  = useState('Abhyanga');
  const [grid, setGrid]                 = useState({}); // key: "day-time" value: therapy
  const [conflicts, setConflicts]       = useState([]);
  const [saved, setSaved]               = useState(false);
  const [saving, setSaving]             = useState(false);
  const [bastiMode, setBastiMode]       = useState('none');
  const [bastiStartDay, setBastiStartDay] = useState(1);

  // Auto-detect protocol conflicts
  useEffect(() => {
    const newConflicts = [];
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const dayEntries = TIME_SLOTS.map(t => grid[`${day}-${t}`]).filter(Boolean);
      // Check if Svedana exists without Abhyanga on same day
      if (dayEntries.includes('Svedana') && !dayEntries.includes('Abhyanga')) {
        newConflicts.push(`Day ${day}: Svedana scheduled without Abhyanga.`);
      }
      // Check if Pradhana Karma therapy on Day 1 without prep
      if (day <= 3) {
        ['Virechana', 'Vamana', 'Basti-Niruha'].forEach(t => {
          if (dayEntries.includes(t)) {
            newConflicts.push(`Day ${day}: ${t} too early — Purvakarma prep (Abhyanga+Svedana) recommended first.`);
          }
        });
      }
    }
    setConflicts(newConflicts);
  }, [grid]);

  const handleCellClick = (day, time) => {
    const key = `${day}-${time}`;
    if (grid[key] === selectedTherapy) {
      const newGrid = { ...grid };
      delete newGrid[key];
      setGrid(newGrid);
    } else {
      const newGrid = { ...grid, [key]: selectedTherapy };
      // Auto-add Svedana after Abhyanga if next slot free
      if (selectedTherapy === 'Abhyanga') {
        const timeIdx = TIME_SLOTS.indexOf(time);
        if (timeIdx < TIME_SLOTS.length - 1) {
          const nextSlot = TIME_SLOTS[timeIdx + 1];
          const nextKey = `${day}-${nextSlot}`;
          if (!newGrid[nextKey]) newGrid[nextKey] = 'Svedana';
        }
      }
      setGrid(newGrid);
    }
    setSaved(false);
  };

  const applyBastiSequence = () => {
    const newGrid = { ...grid };
    if (bastiMode === 'yoga') {
      // Yoga Basti: 7-day alternating Anuvasana/Niruha
      const sequence = ['Basti-Anuvasana','Basti-Niruha','Basti-Anuvasana','Basti-Niruha','Basti-Anuvasana','Basti-Niruha','Basti-Anuvasana'];
      sequence.forEach((type, i) => {
        const day = bastiStartDay + i;
        if (day <= TOTAL_DAYS) newGrid[`${day}-10:00`] = type;
      });
    } else if (bastiMode === 'karma') {
      // Karma Basti: 15-day simplified version
      let anuCount = 0, niruCount = 0;
      for (let i = 0; i < 15; i++) {
        const day = bastiStartDay + i;
        if (day > TOTAL_DAYS) break;
        let type = (anuCount <= niruCount) ? 'Basti-Anuvasana' : 'Basti-Niruha';
        if (type === 'Basti-Anuvasana') anuCount++; else niruCount++;
        newGrid[`${day}-10:00`] = type;
      }
    }
    setGrid(newGrid);
    setSaved(false);
  };

  const clearGrid = () => { setGrid({}); setSaved(false); };

  const handleSave = () => {
    if (!patientName || !startDate) {
      alert('Please enter patient name and start date before saving.');
      return;
    }
    setSaving(true);
    const sessions = [];
    Object.keys(grid).forEach(key => {
      const [day, time] = key.split('-');
      sessions.push({ day: parseInt(day), time, therapy: grid[key] });
    });
    axios.post('http://localhost:3000/treatment-plans', {
      patientName, patientId, startDate, sessions, totalDays: TOTAL_DAYS
    })
      .then(() => { setSaved(true); })
      .catch(() => alert('Could not save. Is the gateway running?'))
      .finally(() => setSaving(false));
  };

  const dayCounts = {};
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    dayCounts[d] = TIME_SLOTS.filter(t => grid[`${d}-${t}`]).length;
  }

  return (
    <div>
      <h2 style={{ color: '#1a5276', marginTop: 0 }}>Treatment Plan Constructor</h2>

      {/* Patient Info */}
      <div style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Patient Name</label>
          <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)}
           
            style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95em', width: '220px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Patient ID</label>
          <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)}
          
            style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95em', width: '130px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Plan Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95em' }} />
        </div>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <div style={{ backgroundColor: '#fef5e7', border: '1px solid #e67e22', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
          <strong style={{ color: '#d35400' }}>⚠️ Protocol Warnings:</strong>
          {conflicts.map((c, i) => <div key={i} style={{ color: '#d35400', fontSize: '0.88em', marginTop: '4px' }}>• {c}</div>)}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Therapy Palette */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: '160px', flexShrink: 0 }}>
          <div style={{ fontSize: '0.85em', fontWeight: '700', color: '#555', marginBottom: '10px' }}>THERAPIES</div>
          {['Purvakarma', 'Pradhana Karma', 'Paschat Karma'].map(phase => (
            <div key={phase} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.72em', color: '#999', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>{phase}</div>
              {THERAPIES.filter(t => t.phase === phase).map(t => (
                <button key={t.value} onClick={() => setSelected(t.value)} style={{
                  display: 'block', width: '100%', padding: '7px 10px', marginBottom: '4px',
                  backgroundColor: selectedTherapy === t.value ? t.color : '#f5f5f5',
                  color: selectedTherapy === t.value ? 'white' : '#333',
                  border: `2px solid ${selectedTherapy === t.value ? t.color : '#e0e0e0'}`,
                  borderRadius: '5px', cursor: 'pointer', fontSize: '0.82em', fontWeight: '500', textAlign: 'left'
                }}>{t.label}</button>
              ))}
            </div>
          ))}

          {/* Basti Auto-Sequence */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '0.72em', color: '#999', fontWeight: '600', marginBottom: '6px' }}>BASTI AUTO-SEQUENCE</div>
            <select value={bastiMode} onChange={e => setBastiMode(e.target.value)}
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.82em', marginBottom: '6px' }}>
              <option value="none">Select Type</option>
              <option value="yoga">Yoga Basti (7 days)</option>
              <option value="karma">Karma Basti (15 days)</option>
            </select>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78em', color: '#555' }}>Start Day:</label>
              <input type="number" min="1" max="14" value={bastiStartDay}
                onChange={e => setBastiStartDay(parseInt(e.target.value))}
                style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.82em' }} />
            </div>
            <button onClick={applyBastiSequence} disabled={bastiMode === 'none'} style={{
              width: '100%', padding: '7px', backgroundColor: bastiMode === 'none' ? '#e0e0e0' : '#8e44ad',
              color: bastiMode === 'none' ? '#999' : 'white', border: 'none', borderRadius: '4px',
              cursor: bastiMode === 'none' ? 'not-allowed' : 'pointer', fontSize: '0.82em', fontWeight: '600'
            }}>Apply Sequence</button>
          </div>
        </div>

        {/* 14-Day Grid */}
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <div style={{ minWidth: '900px' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(14, 1fr)', gap: '2px', marginBottom: '2px' }}>
              <div></div>
              {Array.from({ length: TOTAL_DAYS }, (_, i) => (
                <div key={i} style={{
                  backgroundColor: '#2c3e50', color: 'white', padding: '8px 4px',
                  textAlign: 'center', fontSize: '0.78em', fontWeight: '600', borderRadius: '4px'
                }}>
                  Day {i + 1}
                  {dayCounts[i + 1] > 0 && <div style={{ fontSize: '0.7em', color: '#a0c4d8' }}>{dayCounts[i + 1]} session{dayCounts[i + 1] > 1 ? 's' : ''}</div>}
                </div>
              ))}
            </div>

            {/* Grid Rows */}
            {TIME_SLOTS.map(time => (
              <div key={time} style={{ display: 'grid', gridTemplateColumns: '70px repeat(14, 1fr)', gap: '2px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78em', color: '#666', fontWeight: '600', backgroundColor: '#f8f9fa', borderRadius: '4px', padding: '6px 4px' }}>
                  {time}
                </div>
                {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                  const day = i + 1;
                  const key = `${day}-${time}`;
                  const therapyVal = grid[key];
                  const info = therapyVal ? getTherapyInfo(therapyVal) : null;
                  return (
                    <div key={day} onClick={() => handleCellClick(day, time)} style={{
                      height: '44px', borderRadius: '4px', cursor: 'pointer',
                      backgroundColor: info ? info.color : '#f0f0f0',
                      border: info ? 'none' : '1px dashed #d0d0d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'opacity 0.15s'
                    }} title={info ? info.label : `Click to add ${selectedTherapy}`}>
                      {info && <span style={{ color: 'white', fontSize: '0.7em', fontWeight: '600', textAlign: 'center', padding: '2px' }}>{info.label}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ backgroundColor: '#fff', padding: '14px 20px', borderRadius: '8px', marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82em', fontWeight: '600', color: '#555' }}>Legend:</span>
        {THERAPIES.map(t => (
          <div key={t.value} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: t.color, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '0.78em', color: '#555' }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '11px 28px', backgroundColor: saving ? '#a9dfbf' : '#27ae60',
          color: 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold'
        }}>{saving ? 'Saving...' : '💾 Save Plan'}</button>
        <button onClick={clearGrid} style={{ padding: '11px 20px', backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Clear</button>
        {saved && <span style={{ color: '#27ae60', fontWeight: '600', alignSelf: 'center' }}>✅ Plan saved!</span>}
      </div>
    </div>
  );
}