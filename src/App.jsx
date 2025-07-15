import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import "./Header.css";
import "./Footer.css";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <main style={{ minHeight: "35vh", paddingTop: "3rem", paddingBottom: "3rem" }}>
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
      </main>
      <Footer />
    </Router>
  );
}

export default App;
