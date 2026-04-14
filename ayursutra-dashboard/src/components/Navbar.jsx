import React from 'react';

const NAV_ITEMS = [
  { id: 'booking',     label: 'Daily Schedule',   roles: ['Doctor', 'Admin'] },
  { id: 'plans',      label: 'Treatment Plans',  roles: ['Doctor', 'Admin'] },
  { id: 'emr',         label: 'Patient EMR',      roles: ['Doctor'] },
  { id: 'analytics',   label: 'Analytics',        roles: ['Doctor', 'Admin'] },
  { id: 'compliance',  label: 'Compliance',       roles: ['Doctor', 'Admin'] },
  { id: 'proms',       label: 'PROMs',            roles: ['Doctor', 'Admin'] },
  { id: 'samsarjana', label: 'Diet Plans', roles: ['Doctor', 'Admin'] },
];

export default function Navbar({ activePage, setActivePage, user, onLogout }) {
  return (
    <nav style={{
      width: '220px', minHeight: '100vh', backgroundColor: '#1a3a4a',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 'bold' }}> AyurSutra</div>        <div style={{ color: '#a0b8c8', fontSize: '0.72em', marginTop: '4px' }}>Clinic Portal</div>
      </div>

      {/* Logged in user info */}
      {user && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(39,174,96,0.12)' }}>
          <div style={{ color: 'white', fontSize: '0.88em', fontWeight: '600' }}>{user.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
            <span style={{
              backgroundColor: user.role === 'Doctor' ? '#2980b9' : '#8e44ad',
              color: 'white', fontSize: '0.68em', padding: '2px 7px',
              borderRadius: '10px', fontWeight: '600'
            }}>
              {user.role === 'Doctor' ? '👨‍⚕️' : '🔧'} {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <div style={{ flex: 1, paddingTop: '12px' }}>
        {NAV_ITEMS.map(item => {
          // Grey out EMR for Admin
          const restricted = user && !item.roles.includes(user.role);
          return (
            <button key={item.id} onClick={() => !restricted && setActivePage(item.id)} style={{
              width: '100%', padding: '13px 20px', display: 'flex', alignItems: 'center',
              gap: '12px',
              background: activePage === item.id ? 'rgba(39,174,96,0.25)' : 'transparent',
              border: 'none',
              borderLeft: activePage === item.id ? '3px solid #27ae60' : '3px solid transparent',
              color: restricted ? '#4a6070' : activePage === item.id ? '#27ae60' : '#a0b8c8',
              cursor: restricted ? 'not-allowed' : 'pointer',
              fontSize: '0.9em',
              fontWeight: activePage === item.id ? '600' : '400',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '1.1em', opacity: restricted ? 0.4 : 1 }}>{item.icon}</span>
              <span style={{ opacity: restricted ? 0.4 : 1 }}>{item.label}</span>
              {restricted && <span style={{ marginLeft: 'auto', fontSize: '0.7em', color: '#4a6070' }}>🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onLogout} style={{
          width: '100%', padding: '9px', backgroundColor: 'rgba(231,76,60,0.15)',
          color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)',
          borderRadius: '6px', cursor: 'pointer', fontSize: '0.88em', fontWeight: '600'
        }}>
          🚪 Logout
        </button>
        <div style={{ color: '#4a6070', fontSize: '0.68em', marginTop: '8px', textAlign: 'center' }}>
          NABH/AYUSH Compliant v2.0
        </div>
      </div>
    </nav>
  );
}
