import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NABH_CHECKLIST = [
  { id: 'n1', category: 'NABH', label: 'Patient consent forms obtained and stored' },
  { id: 'n2', category: 'NABH', label: 'Practitioner credentials verified (BAMS/CCIM)' },
  { id: 'n3', category: 'NABH', label: 'Treatment protocols documented for each patient' },
  { id: 'n4', category: 'NABH', label: 'Adverse event reporting process in place' },
  { id: 'n5', category: 'NABH', label: 'Patient discharge summary prepared' },
];
const AYUSH_CHECKLIST = [
  { id: 'a1', category: 'AYUSH', label: 'Medicines sourced from licensed Ayurvedic pharmacies' },
  { id: 'a2', category: 'AYUSH', label: 'Panchakarma procedure manual maintained' },
  { id: 'a3', category: 'AYUSH', label: 'Patient Prakriti/Vikriti assessment recorded' },
  { id: 'a4', category: 'AYUSH', label: 'Samsarjana Krama (diet plan) provided post-treatment' },
  { id: 'a5', category: 'AYUSH', label: 'Therapy sequence follows classical Ayurvedic order' },
];
const DPDP_CHECKLIST = [
  { id: 'd1', category: 'DPDP', label: 'Patient informed of data collection purpose' },
  { id: 'd2', category: 'DPDP', label: 'Explicit consent obtained before data use' },
  { id: 'd3', category: 'DPDP', label: 'Data encrypted in transit (TLS 1.2+)' },
  { id: 'd4', category: 'DPDP', label: 'Role-based access control (RBAC) implemented' },
  { id: 'd5', category: 'DPDP', label: 'Patient right to withdraw consent documented' },
];

const CATEGORY_COLORS = { NABH: '#2980b9', AYUSH: '#27ae60', DPDP: '#8e44ad' };

export default function ComplianceDashboard() {
  const [checks, setChecks]   = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/compliance')
      .then(res => {
        if (res.data.checks) setChecks(res.data.checks);
        if (res.data.auditLog) setAuditLog(res.data.auditLog);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheck = (id) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    axios.post('http://localhost:3000/compliance', { checks: updated, action: `Updated check: ${id}` })
      .then(res => { if (res.data.auditLog) setAuditLog(res.data.auditLog); })
      .catch(() => {});
  };

  const allChecks = [...NABH_CHECKLIST, ...AYUSH_CHECKLIST, ...DPDP_CHECKLIST];
  const completed = allChecks.filter(c => checks[c.id]).length;
  const percentage = Math.round((completed / allChecks.length) * 100);

  const CheckSection = ({ title, items, color }) => {
    const sectionComplete = items.filter(i => checks[i.id]).length;
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px', borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, color }}>{title} Compliance</h4>
          <span style={{ fontSize: '0.85em', backgroundColor: sectionComplete === items.length ? '#d5f5e3' : '#fef9e7', color: sectionComplete === items.length ? '#1d8348' : '#b7950b', padding: '3px 10px', borderRadius: '10px', fontWeight: '600' }}>
            {sectionComplete}/{items.length}
          </span>
        </div>
        {items.map(item => (
          <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '10px', padding: '8px 10px', borderRadius: '6px', backgroundColor: checks[item.id] ? '#f0faf4' : '#fafafa', border: `1px solid ${checks[item.id] ? '#a9dfbf' : '#e8e8e8'}` }}>
            <input type="checkbox" checked={!!checks[item.id]} onChange={() => handleCheck(item.id)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.9em', color: checks[item.id] ? '#27ae60' : '#444', textDecoration: checks[item.id] ? 'none' : 'none' }}>{item.label}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ color: '#1a5276', marginTop: 0 }}>Compliance Dashboard</h2>

      {/* Overall progress */}
      <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, color: '#34495e' }}>Overall Compliance Score</h4>
          <span style={{ fontSize: '1.6rem', fontWeight: '700', color: percentage === 100 ? '#27ae60' : percentage >= 70 ? '#f39c12' : '#e74c3c' }}>{percentage}%</span>
        </div>
        <div style={{ backgroundColor: '#eee', borderRadius: '8px', height: '14px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', borderRadius: '8px', backgroundColor: percentage === 100 ? '#27ae60' : percentage >= 70 ? '#f39c12' : '#e74c3c', transition: 'width 0.5s' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          {[['NABH', NABH_CHECKLIST], ['AYUSH', AYUSH_CHECKLIST], ['DPDP', DPDP_CHECKLIST]].map(([name, list]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: CATEGORY_COLORS[name], borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.82em', color: '#555' }}>{name}: {list.filter(i => checks[i.id]).length}/{list.length}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <CheckSection title="NABH" items={NABH_CHECKLIST} color={CATEGORY_COLORS.NABH} />
          <CheckSection title="DPDP Act 2023" items={DPDP_CHECKLIST} color={CATEGORY_COLORS.DPDP} />
        </div>
        <div>
          <CheckSection title="AYUSH" items={AYUSH_CHECKLIST} color={CATEGORY_COLORS.AYUSH} />

          {/* Audit Trail */}
          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h4 style={{ margin: '0 0 14px', color: '#34495e' }}>🔍 Audit Trail</h4>
            {auditLog.length > 0 ? auditLog.slice(0, 10).map((log, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.85em' }}>
                <div style={{ color: '#333' }}>{log.action}</div>
                <div style={{ color: '#999', marginTop: '2px' }}>{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            )) : <div style={{ color: '#999', fontSize: '0.88em' }}>No audit entries yet. Start checking items above.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}