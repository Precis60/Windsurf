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
const CRMWorking = lazy(() => import("./pages/CRM-Working"));
const CRMSimple = lazy(() => import("./pages/CRM-Simple"));
const SupportPortal = lazy(() => import("./pages/SupportPortal"));
const Portal = lazy(() => import("./pages/Portal"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SupportRequest = lazy(() => import("./pages/SupportRequest"));
const Security = lazy(() => import("./pages/Security"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));

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
            
            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/crm-working" element={<CRMWorking />} />
              <Route path="/crm-test" element={<CRMSimple />} />
              <Route path="/support-portal" element={<SupportPortal />} />
              <Route path="/security" element={<Security />} />
            </Route>

            {/* General authenticated routes */}
            <Route path="/portal" element={<Portal />} />
            <Route path="/client-portal" element={<ClientPortal />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
