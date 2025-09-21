import React, { useState, useEffect } from "react";
import { authService } from '../services/secureApi';

const Portal = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      await authService.register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password
      });

      setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
      setRegisterForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setShowRegister(false);
      // Optional: redirect to login or show a clear message
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Registration failed. Please try again.' });
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Button styles
  const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    background: '#22314a',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 0.5rem'
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="page-content" style={{ 
        padding: '2rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h2>Loading Portal...</h2>
          <p>Please wait while we load your portal data.</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show message to login
  if (!isAuthenticated) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h1 style={{ color: '#22314a', marginBottom: '1rem' }}>🔒 Portal Access Required</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>
            Please log in to access the secure business portal system.
          </p>
          
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#2e7d32',
              fontSize: '14px'
            }}>
              🔐 <strong>Secure Access:</strong> This portal contains sensitive business information and requires authentication.
            </p>
          </div>

          <a 
            href="/login" 
            style={{
              background: '#22314a',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              display: 'inline-block'
            }}
          >
            Go to Login Page
          </a>

          <div style={{ marginTop: '2rem', fontSize: '14px' }}>
            <p>Don't have an account? <span onClick={() => setShowRegister(true)} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Create one here</span>.</p>
          </div>

        </div>

        {showRegister && (
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', marginTop: '2rem' }}>
            <h2 style={{ color: '#22314a', marginBottom: '1.5rem', textAlign: 'center' }}>Create New Account</h2>
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="First Name" value={registerForm.firstName} onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })} required style={inputStyle} />
                <input type="text" placeholder="Last Name" value={registerForm.lastName} onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })} required style={inputStyle} />
              </div>
              <input type="email" placeholder="Email Address" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required style={{...inputStyle, width: 'calc(100% - 20px)', marginTop: '1rem'}} />
              <input type="password" placeholder="Password (min 8 characters)" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required style={{...inputStyle, width: 'calc(100% - 20px)', marginTop: '1rem'}} />
              <input type="password" placeholder="Confirm Password" value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required style={{...inputStyle, width: 'calc(100% - 20px)', marginTop: '1rem'}} />
              
              {message.text && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda', 
                  color: message.type === 'error' ? '#721c24' : '#155724' 
                }}>
                  {message.text}
                </div>
              )}

              <button type="submit" style={{...buttonStyle, width: '100%', marginTop: '1.5rem'}}>Create Account</button>
            </form>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#22314a', margin: 0 }}>Client & Staff Portal</h1>
        <button 
          onClick={() => {
            authService.logout();
            setIsAuthenticated(false);
            window.location.href = '/';
          }} 
          style={{...buttonStyle, background: '#dc3545'}}
        >
          Logout
        </button>
      </div>
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Secure access to project documents, invoices, and communication tools.</p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Client Login</h3>
        <p>Access your project documents, invoices, and progress updates.</p>
        <button style={{ 
          background: '#22314a', 
          color: 'white', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginTop: '1rem'
        }}>Client Login</button>
      </div>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Staff Portal</h3>
        <p>Internal tools for project management, timesheets, and team communication.</p>
        <button style={{ 
          background: '#22314a', 
          color: 'white', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginTop: '1rem'
        }}>Staff Login</button>
      </div>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Quick Access</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>📄 Project Documents</li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>💰 Invoice Management</li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>📊 Progress Reports</li>
          <li style={{ padding: '0.5rem 0' }}>💬 Message Center</li>
        </ul>
      </div>
    </div>
    </div>
  );
};

export default Portal;
