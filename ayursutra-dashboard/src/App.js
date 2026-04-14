import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Navbar from './components/Navbar';
import BookingDashboard from './components/BookingDashboard';
import TreatmentPlanConstructor from './components/TreatmentPlanConstructor';
import PatientEMR from './components/PatientEMR';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ComplianceDashboard from './components/ComplianceDashboard';
import PROMs from './components/PROMs';
import SamsarjanaKrama from './components/SamsarjanaKrama';

function App() {
  const [token, setToken]       = useState(null);
  const [user, setUser]         = useState(null);
  const [activePage, setActivePage] = useState('booking');

  // Called by Login component on success
  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    // Attach token to all future axios requests automatically
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setActivePage('booking');
  };

  // Show login if not authenticated
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    // Admin cannot access EMR
    if (activePage === 'emr' && user.role !== 'Doctor') {
      return (
        <div style={{
          backgroundColor: '#fff', borderRadius: '10px', padding: '40px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
          <h3 style={{ color: '#e74c3c' }}>Access Restricted</h3>
          <p style={{ color: '#666' }}>Patient EMR records can only be accessed by Doctors.</p>
        </div>
      );
    }

    switch (activePage) {
      case 'booking':    return <BookingDashboard user={user} />;
      case 'plans':      return <TreatmentPlanConstructor />;
      case 'emr':        return <PatientEMR />;
      case 'analytics':  return <AnalyticsDashboard />;
      case 'compliance': return <ComplianceDashboard />;
      case 'proms':      return <PROMs />;
      case 'samsarjana': return <SamsarjanaKrama />;
      default:           return <BookingDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f7', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;