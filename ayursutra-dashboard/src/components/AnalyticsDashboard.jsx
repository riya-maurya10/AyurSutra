import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2980b9', '#27ae60', '#8e44ad', '#f39c12', '#e74c3c', '#16a085', '#d35400'];

const PRESETS = [
  { label: 'Today',    days: 0 },
  { label: 'Last 7 days',  days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'All Time', days: null },
];

const getDateRange = (days) => {
  if (days === null) return { from: '', to: '' };
  const to   = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to:   to.toISOString().split('T')[0]
  };
};

export default function AnalyticsDashboard() {
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activePreset, setPreset] = useState('Last 30 days');
  const [customFrom, setFrom]     = useState('');
  const [customTo, setTo]         = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const fetchStats = (from, to) => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to)   params.to   = to;
    axios.get('http://localhost:3000/analytics', { params })
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const { from, to } = getDateRange(30);
    fetchStats(from, to);
  }, []);

  const handlePreset = (preset) => {
    setPreset(preset.label);
    setShowCustom(false);
    const { from, to } = getDateRange(preset.days);
    fetchStats(from, to);
  };

  const handleCustom = () => {
    if (!customFrom || !customTo) return;
    setPreset('Custom');
    fetchStats(customFrom, customTo);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>Loading analytics...</div>;
  if (!stats)  return <div style={{ padding: '40px', textAlign: 'center', color: '#e74c3c' }}>Could not load analytics. Is the gateway running?</div>;

  const cardStyle = (color) => ({
    backgroundColor: '#fff', borderRadius: '10px', padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}`
  });

  return (
    <div>
      <h2 style={{ color: '#1a5276', marginTop: 0 }}>Analytics Dashboard</h2>

      {/* Date Filter Bar */}
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', marginRight: '4px' }}>📅 Filter:</span>

          {PRESETS.map(preset => (
            <button key={preset.label} onClick={() => handlePreset(preset)} style={{
              padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: activePreset === preset.label ? '#27ae60' : '#f0f0f0',
              color: activePreset === preset.label ? 'white' : '#555',
              fontWeight: '600', fontSize: '0.85em'
            }}>{preset.label}</button>
          ))}

          <button onClick={() => setShowCustom(!showCustom)} style={{
            padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            backgroundColor: activePreset === 'Custom' ? '#27ae60' : '#f0f0f0',
            color: activePreset === 'Custom' ? 'white' : '#555',
            fontWeight: '600', fontSize: '0.85em'
          }}>🗓️ Custom Range</button>

          {showCustom && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', width: '100%' }}>
              <input type="date" value={customFrom} onChange={e => setFrom(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85em' }} />
              <span style={{ color: '#555', fontSize: '0.85em' }}>to</span>
              <input type="date" value={customTo} onChange={e => setTo(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85em' }} />
              <button onClick={handleCustom} style={{
                padding: '7px 16px', backgroundColor: '#2980b9', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85em'
              }}>Apply</button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Appointments', value: stats.totalAppointments, color: '#2980b9', icon: '📅' },
          { label: "Today's Sessions",   value: stats.todayAppointments, color: '#27ae60', icon: '🌿' },
          { label: 'Total Patients',     value: stats.totalPatients,     color: '#8e44ad', icon: '👤' },
          { label: 'Active Plans',       value: stats.totalPlans,        color: '#f39c12', icon: '🗓️' },
        ].map(card => (
          <div key={card.label} style={cardStyle(card.color)}>
            <div style={{ fontSize: '1.6rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: card.color, margin: '6px 0 2px' }}>{card.value}</div>
            <div style={{ fontSize: '0.83em', color: '#666' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Bar Chart */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#34495e' }}>Appointments by Therapy</h4>
          {stats.byTherapy?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byTherapy}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.byTherapy.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ color: '#999', textAlign: 'center', paddingTop: '40px' }}>No data for this period</div>}
        </div>

        {/* Pie Chart */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#34495e' }}>Therapy Distribution</h4>
          {stats.byTherapy?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.byTherapy} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.byTherapy.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend formatter={(value) => <span style={{ fontSize: '0.8em' }}>{value}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ color: '#999', textAlign: 'center', paddingTop: '40px' }}>No data for this period</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Room Utilization */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#34495e' }}>Room Utilization</h4>
          {stats.byRoom?.length > 0 ? stats.byRoom.map((r, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88em', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>{r._id}</span>
                <span style={{ color: '#666' }}>{r.count} sessions</span>
              </div>
              <div style={{ backgroundColor: '#eee', borderRadius: '4px', height: '10px' }}>
                <div style={{ width: `${Math.min((r.count / (stats.totalAppointments || 1)) * 100 * 2, 100)}%`, backgroundColor: '#2980b9', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
          )) : <div style={{ color: '#999', textAlign: 'center', paddingTop: '20px' }}>No data for this period</div>}
        </div>

        {/* Therapist Workload */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#34495e' }}>Therapist Workload</h4>
          {stats.byTherapist?.length > 0 ? stats.byTherapist.map((t, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88em', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>{t._id}</span>
                <span style={{ color: '#666' }}>{t.count} sessions</span>
              </div>
              <div style={{ backgroundColor: '#eee', borderRadius: '4px', height: '10px' }}>
                <div style={{ width: `${Math.min((t.count / (stats.totalAppointments || 1)) * 100 * 3, 100)}%`, backgroundColor: '#27ae60', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
          )) : <div style={{ color: '#999', textAlign: 'center', paddingTop: '20px' }}>No data for this period</div>}
        </div>
      </div>
    </div>
  );
}