import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    axios.post('http://localhost:3000/login', { username, password })
      .then(res => {
        // Store token and user in memory
        onLogin(res.data.token, res.data.user);
      })
      .catch(err => {
        if (err.response) {
          setError(err.response.data.error || 'Login failed.');
        } else {
          setError('Cannot reach the server. Make sure gateway is running on port 3000.');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f0f4f8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/ayursutra.jpg" alt="AyurSutra Logo" style={{ width: '160px', height: 'auto', marginBottom: '8px' }} />
          <p style={{ color: '#7f8c8d', marginTop: '6px', fontSize: '0.9em' }}>
            Intelligent Panchakarma Scheduling System
          </p>
          <div style={{ display: 'inline-block', backgroundColor: '#eafaf1', border: '1px solid #a9dfbf', borderRadius: '20px', padding: '3px 12px', fontSize: '0.78em', color: '#1d8348', marginTop: '4px' }}>
            NABH / AYUSH Compliant
          </div>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '32px 36px'
        }}>
          <h3 style={{ margin: '0 0 24px', color: '#1a3a4a', fontSize: '1.1rem' }}>Sign in to your account</h3>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: '#fdedec', border: '1px solid #e74c3c',
              borderRadius: '6px', padding: '10px 14px', marginBottom: '18px',
              color: '#c0392b', fontSize: '0.88em'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '7px',
                  border: '1.5px solid #ddd', fontSize: '0.95em',
                  boxSizing: 'border-box', outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#27ae60'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px', borderRadius: '7px',
                    border: '1.5px solid #ddd', fontSize: '0.95em',
                    boxSizing: 'border-box', outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#27ae60'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em', color: '#888'
                  }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: loading ? '#a9dfbf' : '#27ae60',
                color: 'white', border: 'none', borderRadius: '7px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '700', fontSize: '1em', transition: 'background 0.2s'
              }}
            >
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: '24px', padding: '14px', backgroundColor: '#f8f9fa',
            borderRadius: '8px', border: '1px dashed #d0d0d0'
          }}>
            
        
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#bdc3c7', marginTop: '20px', fontSize: '0.78em' }}>
          AyurSutra v2.0 — KIET Group of Institutions
        </p>
      </div>
    </div>
  );
}