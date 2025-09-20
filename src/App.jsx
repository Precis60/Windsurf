import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
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
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Router>
      <Header />
      <main style={{ minHeight: "35vh", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '1.2rem', color: '#22314a' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/company-policies" element={<CompanyPolicies />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/support-portal" element={<SupportPortal />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
