import React, { useState, useEffect } from "react";

const Portal = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Authentication functions
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Hardcoded credentials for security (in production, this would be handled by a backend)
    const validCredentials = {
      username: 'admin',
      password: 'calendar2025'
    };
    
    if (loginData.username === validCredentials.username && loginData.password === validCredentials.password) {
      setIsAuthenticated(true);
      // Store in sessionStorage (expires when browser session ends)
      sessionStorage.setItem('portalAuth', 'true');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
    sessionStorage.removeItem('portalAuth');
  };

  // Clear authentication when component unmounts or page is left
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('portalAuth');
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.removeItem('portalAuth');
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sessionStorage.removeItem('portalAuth');
    };
  }, []);

  // Button styles
  const buttonStyle = {
    background: '#22314a',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 0.5rem'
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h1 style={{ color: '#22314a', marginBottom: '1rem' }}>Portal Access</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>Please login to access the client and staff portal system.</p>
          
          <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                margin: '0.5rem 0', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                margin: '0.5rem 0', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            />
            {loginError && (
              <div style={{ color: '#dc3545', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                {loginError}
              </div>
            )}
            <button 
              type="submit" 
              style={{
                ...buttonStyle,
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                marginTop: '1rem'
              }}
            >
              Login to Portal
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px', fontSize: '0.9rem', color: '#1976d2' }}>
            <strong>Demo Credentials:</strong><br/>
            Username: admin<br/>
            Password: calendar2025
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#22314a', margin: 0 }}>Client & Staff Portal</h1>
        <button onClick={handleLogout} style={{...buttonStyle, background: '#dc3545'}}>
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
