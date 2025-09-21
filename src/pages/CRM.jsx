import React, { useState, useEffect } from "react";
import { customersService, authService } from '../services/secureApi';
import './CRM.css';

const CRM = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Customer Database state
  const [customers, setCustomers] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    projectType: '',
    notes: '',
    password: '' // Added password field
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Load customers from secure API
  useEffect(() => {
    if (isAuthenticated) {
      const loadCustomers = async () => {
        try {
          const response = await customersService.getAll();
          const customerList = Array.isArray(response) ? response : response.customers || [];
          setCustomers(customerList);
        } catch (error) {
          console.error('Error loading customers:', error);
          setCustomers([]);
        }
      };
      
      loadCustomers();
    }
  }, [isAuthenticated]);


  // Debug function to test basic functionality
  const debugButtonClick = () => {
    console.log('🟢 DEBUG: Basic button click works!');
    console.log('🟢 DEBUG: customerForm state:', customerForm);
    console.log('🟢 DEBUG: submitting state:', submitting);
    console.log('🟢 DEBUG: isAuthenticated:', authService.isAuthenticated());
    alert('DEBUG: Button click registered successfully!');
  };

  // Customer Database functions
  const handleAddCustomer = async (e) => {
    e && e.preventDefault && e.preventDefault();
    setFormMessage({ type: '', text: '' });
    setSubmitting(true);
    // Frontend validation
    if (!customerForm.firstName.trim()) {
      setFormMessage({ type: 'error', text: 'Please enter a first name.' });
      setSubmitting(false);
      return;
    }
    if (!customerForm.lastName.trim()) {
      setFormMessage({ type: 'error', text: 'Please enter a last name.' });
      setSubmitting(false);
      return;
    }
    if (!customerForm.email.trim()) {
      setFormMessage({ type: 'error', text: 'Please enter an email address.' });
      setSubmitting(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerForm.email.trim())) {
      setFormMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setSubmitting(false);
      return;
    }
    if (!customerForm.password || customerForm.password.length < 8) {
      setFormMessage({ type: 'error', text: 'Please enter a password (min 8 characters).' });
      setSubmitting(false);
      return;
    }
    const customerData = {
      firstName: customerForm.firstName.trim(),
      lastName: customerForm.lastName.trim(),
      email: customerForm.email.trim(),
      phone: (customerForm.phone || '').trim() || null,
      company: (customerForm.companyName || '').trim() || null,
      address: `${customerForm.address}, ${customerForm.city}, ${customerForm.state} ${customerForm.zipCode}`.trim().replace(/^,\s*|,\s*$/g, '') || null,
      password: customerForm.password // Always include password for add
    };
    try {
      const result = await customersService.create(customerData);
      setCustomerForm({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        projectType: '',
        notes: '',
        password: '' // Reset password field
      });
      setShowCustomerForm(false);
      const response = await customersService.getAll();
      const customerList = Array.isArray(response) ? response : response.customers || [];
      setCustomers(customerList);
      setFormMessage({ type: 'success', text: 'Customer added successfully!' });
      setSubmitting(false);
    } catch (error) {
      let errorMessage = 'Failed to add customer. ';
      if (error.message.includes('Validation failed')) {
        errorMessage += 'Please check all required fields are filled correctly. Make sure you have entered both first and last name, a valid email address, and a password.';
      } else if (error.message.includes('already exists')) {
        errorMessage += 'A customer with this email already exists.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      setFormMessage({ type: 'error', text: errorMessage });
      setSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    console.log('Attempting to update customer with data:', customerForm);
    
    // Frontend validation
    if (!customerForm.firstName.trim()) {
      alert('Please enter a first name.');
      return;
    }
    
    if (!customerForm.lastName.trim()) {
      alert('Please enter a last name.');
      return;
    }
    
    if (!customerForm.email.trim()) {
      alert('Please enter an email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerForm.email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Build customerData for update
    const customerData = {
      firstName: customerForm.firstName.trim(),
      lastName: customerForm.lastName.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim() || null,
      company: customerForm.companyName.trim() || null,
      address: `${customerForm.address}, ${customerForm.city}, ${customerForm.state} ${customerForm.zipCode}`.trim().replace(/^,\s*|,\s*$/g, '') || null
    };
    if (customerForm.password && customerForm.password.length >= 8) {
      customerData.password = customerForm.password;
    }
    
    try {
      // Convert frontend form data to backend expected format
      console.log('Sending updated customer data to backend:', customerData);
      
      await customersService.update(editingCustomer, customerData);
      
      setCustomerForm({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        projectType: '',
        notes: ''
      });
      setEditingCustomer(null);
      setShowCustomerForm(false);
      
      // Reload customers
      const response = await customersService.getAll();
      const customerList = Array.isArray(response) ? response : response.customers || [];
      setCustomers(customerList);
      
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      
      let errorMessage = 'Failed to update customer. ';
      
      if (error.message.includes('Authentication required')) {
        errorMessage += 'Please log in again.';
        window.location.href = '/login';
        return;
      } else if (error.message.includes('Session expired')) {
        errorMessage += 'Your session has expired. Please log in again.';
        window.location.href = '/login';
        return;
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleEditCustomer = (customer) => {
    console.log('Editing customer:', customer);
    
    // Parse address if it exists
    let address = '', city = '', state = '', zipCode = '';
    if (customer.address) {
      const addressParts = customer.address.split(', ');
      if (addressParts.length >= 1) address = addressParts[0] || '';
      if (addressParts.length >= 2) city = addressParts[1] || '';
      if (addressParts.length >= 3) {
        const stateZip = addressParts[2].split(' ');
        state = stateZip[0] || '';
        zipCode = stateZip[1] || '';
      }
    }
    
    setCustomerForm({
      companyName: customer.company || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: address,
      city: city,
      state: state,
      zipCode: zipCode,
      projectType: customer.projectType || '',
      notes: customer.notes || ''
    });
    setEditingCustomer(customer.id);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersService.delete(id);
        
        // Reload customers after deletion
        const response = await customersService.getAll();
        const customerList = Array.isArray(response) ? response : response.customers || [];
        setCustomers(customerList);
        
        alert('Customer deleted successfully!');
      } catch (error) {
        console.error('Error deleting customer:', error);
        
        let errorMessage = 'Failed to delete customer. ';
        
        if (error.message.includes('Authentication required')) {
          errorMessage += 'Please log in again.';
          window.location.href = '/login';
          return;
        } else if (error.message.includes('Session expired')) {
          errorMessage += 'Your session has expired. Please log in again.';
          window.location.href = '/login';
          return;
        } else {
          errorMessage += `Error: ${error.message}`;
        }
        
        alert(errorMessage);
      }
    }
  };

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

  // If loading, show loading state
  if (loading) {
    return (
      <div className="crm-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading CRM...</h2>
      </div>
    );
  }
  // If not authenticated, show message to login
  if (!isAuthenticated) {
    return (
      <div className="crm-container">
        <div className="crm-card" style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
          <h1 className="crm-title">🔒 CRM Access Required</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>Please log in to access the CRM system.</p>
          <a href="/login" className="crm-btn-main">Go to Login Page</a>
        </div>
      </div>
    );
  }
  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1 className="crm-title">Customer Relationship Management</h1>
        <button className="crm-logout-btn" onClick={() => { authService.logout(); setIsAuthenticated(false); window.location.href = '/'; }}>Logout</button>
      </div>
      <div className="crm-dashboard">
        <div className="crm-card">
          <h3>Customer Database</h3>
          <p>View and manage customer information, contact details, and project history.</p>
          <button className="crm-btn-main" onClick={() => { setShowCustomerList(!showCustomerList); setShowCustomerForm(false); setEditingCustomer(null); }}>
            {showCustomerList ? 'Hide Customers' : 'View Customers'}
          </button>
          <button className="crm-btn-secondary" onClick={() => { setShowCustomerForm(true); setShowCustomerList(false); setEditingCustomer(null); setCustomerForm({ companyName: '', firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', projectType: '', notes: '' }); }}>
            Add Customer
          </button>
        </div>
        <div className="crm-card">
          <h3>Active Projects</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>Office Building Wiring - 75% Complete</li>
            <li>Factory Automation - 40% Complete</li>
            <li>Warehouse Network - Planning Phase</li>
          </ul>
        </div>
        <div className="crm-card">
          <h3>Recent Activity</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>New quote sent to ABC Corp</li>
            <li>Project milestone reached</li>
            <li>Customer feedback received</li>
          </ul>
        </div>
      </div>
      {/* Customer Management Section */}
      {(showCustomerForm || showCustomerList) && (
        <div className="crm-section">
          <h2 style={{ color: '#22314a', marginBottom: '1.5rem' }}>👥 Customer Management</h2>
          {/* Add/Edit Customer Form */}
          {showCustomerForm && (
            <div className="crm-form">
              <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer} noValidate>
                <input type="text" placeholder="Company Name" value={customerForm.companyName} onChange={e => setCustomerForm({ ...customerForm, companyName: e.target.value })} />
                <input type="text" placeholder="First Name" value={customerForm.firstName} onChange={e => setCustomerForm({ ...customerForm, firstName: e.target.value })} required />
                <input type="text" placeholder="Last Name" value={customerForm.lastName} onChange={e => setCustomerForm({ ...customerForm, lastName: e.target.value })} required />
                <input type="email" placeholder="Email Address" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} required />
                <input type="password" placeholder={editingCustomer ? "Set/Change Password (min 8 chars, optional)" : "Password (min 8 chars)"} value={customerForm.password} onChange={e => setCustomerForm({ ...customerForm, password: e.target.value })} />
                <input type="tel" placeholder="Phone Number" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                <input type="text" placeholder="Street Address" value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} />
                <input type="text" placeholder="City" value={customerForm.city} onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })} />
                <input type="text" placeholder="State" value={customerForm.state} onChange={e => setCustomerForm({ ...customerForm, state: e.target.value })} />
                <input type="text" placeholder="ZIP Code" value={customerForm.zipCode} onChange={e => setCustomerForm({ ...customerForm, zipCode: e.target.value })} />
                <select value={customerForm.projectType} onChange={e => setCustomerForm({ ...customerForm, projectType: e.target.value })}>
                  <option value="">Select Project Type</option>
                  <option value="Network Infrastructure">Network Infrastructure</option>
                  <option value="Cable Installation">Cable Installation</option>
                  <option value="Equipment Setup">Equipment Setup</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Consultation">Consultation</option>
                  <option value="System Integration">System Integration</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="Emergency Service">Emergency Service</option>
                </select>
                <textarea placeholder="Notes (optional)" value={customerForm.notes} onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })} />
                {formMessage.text && (
                  <div className={`crm-feedback ${formMessage.type}`}>{formMessage.text}</div>
                )}
                <div className="crm-form-actions">
                  <button className="crm-btn-main" type="submit" disabled={submitting}>{editingCustomer ? 'Update Customer' : 'Add Customer'}</button>
                  <button className="crm-btn-secondary" type="button" onClick={() => { setShowCustomerForm(false); setEditingCustomer(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          )}
          {/* Customer List */}
          {showCustomerList && (
            <div>
              <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Customer Database ({customers.length} customers)</h3>
              <div className="crm-customer-list">
                {customers.length === 0 ? (
                  <div className="crm-card" style={{ textAlign: 'center', color: '#666' }}>
                    <p>No customers added yet. Click "Add Customer" to get started.</p>
                  </div>
                ) : (
                  customers.map(customer => (
                    <div key={customer.id} className="crm-customer-card">
                      <h4>{customer.firstName} {customer.lastName}</h4>
                      <div><strong>Company:</strong> {customer.company}</div>
                      <div><strong>Email:</strong> <a href={`mailto:${customer.email}`} style={{ color: '#007bff', textDecoration: 'none', marginLeft: '0.5rem' }}>{customer.email}</a></div>
                      <div><strong>Phone:</strong> <a href={`tel:${customer.phone}`} style={{ color: '#007bff', textDecoration: 'none', marginLeft: '0.5rem' }}>{customer.phone}</a></div>
                      {customer.address && (<div><strong>Address:</strong> {customer.address}</div>)}
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>Added: {new Date(customer.createdAt).toLocaleDateString()}</div>
                      <div className="crm-customer-actions">
                        <button className="crm-btn-edit" onClick={() => handleEditCustomer(customer)}>Edit</button>
                        <button className="crm-btn-delete" onClick={() => handleDeleteCustomer(customer.id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CRM;
