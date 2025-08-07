import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Consultation from "./pages/Consultation";
import Contact from "./pages/Contact";
import CompanyPolicies from "./pages/CompanyPolicies";
import AboutUs from "./pages/AboutUs";
import Calendar from "./pages/Calendar";
import CRM from "./pages/CRM";
import SupportPortal from "./pages/SupportPortal";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";
import { Login, Register } from "./components/Auth";
import Dashboard from "./components/Dashboard";
import { authService } from "./services/index";
import "./Header.css";
import "./Footer.css";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        authService.logout();
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  // Public route component (redirect to dashboard if logged in)
  const PublicRoute = ({ children }) => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ minHeight: "35vh", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/company-policies" element={<CompanyPolicies />} />
          <Route path="/about-us" element={<AboutUs />} />
          
          {/* Authentication routes */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <div style={{ padding: '2rem 0' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <button 
                      onClick={() => setShowLogin(true)}
                      style={{
                        marginRight: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: showLogin ? '#667eea' : 'transparent',
                        color: showLogin ? 'white' : '#667eea',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setShowLogin(false)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: !showLogin ? '#667eea' : 'transparent',
                        color: !showLogin ? 'white' : '#667eea',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Register
                    </button>
                  </div>
                  {showLogin ? (
                    <Login onLogin={handleLogin} />
                  ) : (
                    <Register onRegister={handleRegister} />
                  )}
                </div>
              </PublicRoute>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crm" 
            element={
              <ProtectedRoute>
                <CRM />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support-portal" 
            element={
              <ProtectedRoute>
                <SupportPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal" 
            element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
