import React, { useState, useEffect } from "react";
import { customersService, authService } from '../services/secureApi';

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
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    projectType: '',
    notes: ''
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

  // Customer Database functions - SAVES TO ONLINE DATABASE
  const handleAddCustomer = async () => {
    console.log('Saving customer to online database...');
    setSubmitting(true);
    setFormMessage({ type: '', text: '' });
    
    try {
      // Validate required fields
      if (!customerForm.contactName?.trim()) {
        setFormMessage({ type: 'error', text: 'Contact Name is required' });
        setSubmitting(false);
        return;
      }
      
      if (!customerForm.email?.trim()) {
        setFormMessage({ type: 'error', text: 'Email is required' });
        setSubmitting(false);
        return;
      }
      
      // Prepare data for backend API
      const nameParts = customerForm.contactName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const customerData = {
        firstName: firstName,
        lastName: lastName,
        email: customerForm.email.trim(),
        phone: customerForm.phone?.trim() || null,
        company: customerForm.companyName?.trim() || null,
        address: [customerForm.address, customerForm.city, customerForm.state, customerForm.zipCode].filter(Boolean).join(', ') || null
      };
      
      console.log('Sending customer data to online database:', customerData);
      
      // Save to online database
      const result = await customersService.create(customerData);
      console.log('✅ Customer successfully saved to online database:', result);
      
      // Reload customers from database
      const response = await customersService.getAll();
      const customerList = Array.isArray(response) ? response : response.customers || [];
      setCustomers(customerList);
      
      // Clear form and close
      setCustomerForm({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        projectType: '',
        notes: ''
      });
      setShowCustomerForm(false);
      setFormMessage({ type: 'success', text: '✅ Customer saved to online database successfully!' });
      
    } catch (error) {
      console.error('❌ Error saving to online database:', error);
      let errorMsg = '❌ Failed to save to online database: ';
      
      if (error.message.includes('Authentication required') || error.message.includes('Session expired')) {
        errorMsg += 'Please log in again.';
        setTimeout(() => window.location.href = '/login', 1000);
      } else if (error.message.includes('already exists')) {
        errorMsg += 'Customer with this email already exists.';
      } else {
        errorMsg += error.message;
      }
      
      setFormMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
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
      contactName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
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
        
        alert('Customer deleted from online database successfully!');
      } catch (error) {
        console.error('Error deleting customer from online database:', error);
        alert('Failed to delete customer from online database: ' + error.message);
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
      <div className="page-content" style={{ 
        padding: '2rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h2>Loading CRM...</h2>
          <p>Please wait while we load your customer data from the online database.</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show message to login
  if (!isAuthenticated) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h1 style={{ color: '#22314a', marginBottom: '1rem' }}>🔒 CRM Access Required</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>
            Please log in to access the secure customer relationship management system.
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
              🔐 <strong>Secure Access:</strong> This CRM contains sensitive customer information and requires authentication.
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
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ color: '#22314a', margin: 0 }}>Customer Relationship Management</h1>
          <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
            💾 All data is saved to your secure online database across multiple devices
          </p>
        </div>
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
      <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Manage customer relationships and track project progress.</p>
    
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Customer Database</h3>
          <p>View and manage customer information, contact details, and project history.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              onClick={() => {
                setShowCustomerList(!showCustomerList);
                setShowCustomerForm(false);
                setEditingCustomer(null);
              }}
              style={{
                ...buttonStyle,
                width: '100%',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem'
              }}
            >
              {showCustomerList ? 'Hide Customers' : 'View Customers'}
            </button>
            <button 
              onClick={() => {
                console.log('Add Customer button clicked');
                setShowCustomerForm(true);
                setShowCustomerList(false);
                setEditingCustomer(null);
                setFormMessage({ type: '', text: '' });
                setCustomerForm({
                  companyName: '',
                  contactName: '',
                  email: '',
                  phone: '',
                  address: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  projectType: '',
                  notes: ''
                });
              }}
              style={{
                ...buttonStyle,
                background: '#28a745',
                width: '100%',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem'
              }}
            >
              Add Customer
            </button>
          </div>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Active Projects</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>Office Building Wiring - 75% Complete</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>Factory Automation - 40% Complete</li>
            <li style={{ padding: '0.5rem 0' }}>Warehouse Network - Planning Phase</li>
          </ul>
        </div>
        
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Recent Activity</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>New quote sent to ABC Corp</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #dee2e6' }}>Project milestone reached</li>
            <li style={{ padding: '0.5rem 0' }}>Customer feedback received</li>
          </ul>
        </div>
      </div>

      {/* Customer Management Section */}
      {(showCustomerForm || showCustomerList) && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#22314a', marginBottom: '1.5rem' }}>👥 Customer Management</h2>
          
          {/* Add/Edit Customer Form */}
          {showCustomerForm && (
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '2rem' }}>
              <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '1rem' }}>
                  💾 Saves to online database
                </span>
              </h3>
              
              {/* Inline feedback message */}
              {formMessage.text && (
                <div 
                  role="alert" 
                  style={{
                    marginBottom: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 6,
                    border: `1px solid ${formMessage.type === 'error' ? '#f5c2c7' : '#badbcc'}`,
                    background: formMessage.type === 'error' ? '#f8d7da' : '#d1e7dd',
                    color: formMessage.type === 'error' ? '#842029' : '#0f5132'
                  }}
                >
                  {formMessage.text}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm({...customerForm, companyName: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="Contact Name *"
                  value={customerForm.contactName}
                  onChange={(e) => setCustomerForm({...customerForm, contactName: e.target.value})}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={customerForm.state}
                  onChange={(e) => setCustomerForm({...customerForm, state: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={customerForm.zipCode}
                  onChange={(e) => setCustomerForm({...customerForm, zipCode: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <select
                  value={customerForm.projectType}
                  onChange={(e) => setCustomerForm({...customerForm, projectType: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
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
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={customerForm.notes}
                onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', marginBottom: '1rem' }}
              />
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: submitting ? '#6c757d' : '#007bff',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                  disabled={submitting}
                  onClick={handleAddCustomer}
                >
                  {submitting ? '💾 Saving to Database...' : '💾 Save to Online Database'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCustomerForm(false);
                    setEditingCustomer(null);
                    setFormMessage({ type: '', text: '' });
                    setSubmitting(false);
                    setCustomerForm({
                      companyName: '',
                      contactName: '',
                      email: '',
                      phone: '',
                      address: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      projectType: '',
                      notes: ''
                    });
                  }}
                  style={{
                    ...buttonStyle,
                    background: '#6c757d'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Customer List */}
          {showCustomerList && (
            <div>
              <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>Customer Database ({customers.length} customers)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
                {customers.length === 0 ? (
                  <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center', color: '#666' }}>
                    <p>No customers added yet. Click "Add Customer" to get started.</p>
                  </div>
                ) : (
                  customers.map(customer => (
                    <div key={customer.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#22314a', margin: 0, fontSize: '1.2rem' }}>{customer.firstName} {customer.lastName}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            style={{ ...buttonStyle, padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#28a745' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            style={{ ...buttonStyle, padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#dc3545' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Company:</strong> {customer.company}
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Email:</strong> 
                        <a href={`mailto:${customer.email}`} style={{ color: '#007bff', textDecoration: 'none', marginLeft: '0.5rem' }}>
                          {customer.email}
                        </a>
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Phone:</strong> 
                        <a href={`tel:${customer.phone}`} style={{ color: '#007bff', textDecoration: 'none', marginLeft: '0.5rem' }}>
                          {customer.phone}
                        </a>
                      </div>
                      
                      {customer.address && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Address:</strong> {customer.address}
                        </div>
                      )}
                      
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                        💾 Saved to online database: {new Date(customer.createdAt).toLocaleDateString()}
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
