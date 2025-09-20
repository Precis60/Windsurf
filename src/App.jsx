import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { authService } from "./services/secureApi";
import "./Header.css";
import "./Footer.css";
import "./App.css";

// Lazy load components for code splitting
const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const Consultation = lazy(() => import("./pages/Consultation"));
const Contact = lazy(() => import("./pages/Contact"));
const CompanyPolicies = lazy(() => import("./pages/CompanyPolicies"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Calendar = lazy(() => import("./pages/Calendar"));
const CRM = lazy(() => import("./pages/CRM"));
const SupportPortal = lazy(() => import("./pages/SupportPortal"));
const Portal = lazy(() => import("./pages/Portal"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SupportRequest = lazy(() => import("./pages/SupportRequest"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  // Determine basename for GitHub Pages
  const basename = process.env.NODE_ENV === 'production' ? '/Windsurf' : '';
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser());
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
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
        color: '#22314a'
      }}>
        Loading...
      </div>
    );
  }
  
  return (
    <Router basename={basename}>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ minHeight: "35vh", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '1.2rem', color: '#22314a' }}>Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/company-policies" element={<CompanyPolicies />} />
            <Route path="/about-us" element={<AboutUs />} />
            
            {/* Authentication route */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            
            {/* Public support request route */}
            <Route path="/support-request" element={<SupportRequest />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/crm" element={
              <ProtectedRoute>
                <CRM />
              </ProtectedRoute>
            } />
            <Route path="/support-portal" element={
              <ProtectedRoute>
                <SupportPortal />
              </ProtectedRoute>
            } />
            <Route path="/portal" element={
              <ProtectedRoute>
                <Portal />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
