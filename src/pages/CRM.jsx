import React, { useState, useEffect } from "react";
import { credentialsService, customersService } from '../services/firebaseService';

const CRM = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Password Manager state
  const [savedCredentials, setSavedCredentials] = useState([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [credentialForm, setCredentialForm] = useState({
    serviceName: '',
    username: '',
    password: '',
    website: '',
    notes: ''
  });
  const [showPasswords, setShowPasswords] = useState({});

  // Customer Database state
  const [customers, setCustomers] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
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
      sessionStorage.setItem('crmAuth', 'true');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
    sessionStorage.removeItem('crmAuth');
  };

  // Clear authentication when component unmounts or page is left
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('crmAuth');
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.removeItem('crmAuth');
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sessionStorage.removeItem('crmAuth');
    };
  }, []);

  // Load saved credentials from Firebase
  useEffect(() => {
    if (isAuthenticated) {
      const loadCredentials = async () => {
        try {
          const firebaseCredentials = await credentialsService.getAll();
          setSavedCredentials(firebaseCredentials);
        } catch (error) {
          console.error('Error loading credentials:', error);
          // Fallback to localStorage if Firebase fails
          const savedCreds = localStorage.getItem('companyCredentials');
          if (savedCreds) {
            setSavedCredentials(JSON.parse(savedCreds));
          }
        }
      };
      
      loadCredentials();
      
      // Set up real-time listener for credentials
      const unsubscribe = credentialsService.onSnapshot((credentials) => {
        setSavedCredentials(credentials);
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Password Manager functions
  const handleAddCredential = async (e) => {
    e.preventDefault();
    try {
      const newCredential = {
        ...credentialForm,
        dateAdded: new Date().toLocaleDateString()
      };
      await credentialsService.add(newCredential);
      setCredentialForm({ serviceName: '', username: '', password: '', website: '', notes: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error adding credential:', error);
      alert('Failed to add credential. Please try again.');
    }
  };

  const handleUpdateCredential = async (e) => {
    e.preventDefault();
    try {
      await credentialsService.update(editingCredential, credentialForm);
      setCredentialForm({ serviceName: '', username: '', password: '', website: '', notes: '' });
      setEditingCredential(null);
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error updating credential:', error);
      alert('Failed to update credential. Please try again.');
    }
  };

  const handleEditCredential = (credential) => {
    setCredentialForm({
      serviceName: credential.serviceName,
      username: credential.username,
      password: credential.password,
      website: credential.website,
      notes: credential.notes
    });
    setEditingCredential(credential.id);
    setShowPasswordForm(true);
  };

  const handleDeleteCredential = async (id) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        await credentialsService.delete(id);
      } catch (error) {
        console.error('Error deleting credential:', error);
        alert('Failed to delete credential. Please try again.');
      }
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Load saved customers from Firebase
  useEffect(() => {
    if (isAuthenticated) {
      const loadCustomers = async () => {
        try {
          const firebaseCustomers = await customersService.getAll();
          if (firebaseCustomers.length > 0) {
            setCustomers(firebaseCustomers);
          } else {
            // Add default customers to Firebase if none exist
            const defaultCustomers = [
              {
                companyName: 'ABC Manufacturing Corp',
                contactName: 'John Smith',
                email: 'john.smith@abcmfg.com',
                phone: '(555) 123-4567',
                address: '123 Industrial Blvd',
                city: 'Manufacturing District',
                state: 'CA',
                zipCode: '90210',
                projectType: 'Network Infrastructure',
                notes: 'Large manufacturing facility requiring comprehensive network setup',
                dateAdded: '2025-01-15'
              },
              {
                companyName: 'Office Complex LLC',
                contactName: 'Sarah Johnson',
                email: 'sarah@officecomplex.com',
                phone: '(555) 987-6543',
                address: '456 Business Park Dr, Suite 200',
                city: 'Business District',
                state: 'CA',
                zipCode: '90211',
                projectType: 'Cable Installation',
                notes: 'Multi-floor office building with structured cabling needs',
                dateAdded: '2025-01-10'
              }
            ];
            
            for (const customer of defaultCustomers) {
              await customersService.add(customer);
            }
            
            const updatedCustomers = await customersService.getAll();
            setCustomers(updatedCustomers);
          }
        } catch (error) {
          console.error('Error loading customers:', error);
          // Fallback to localStorage if Firebase fails
          const savedCustomers = localStorage.getItem('companyCustomers');
          if (savedCustomers) {
            setCustomers(JSON.parse(savedCustomers));
          }
        }
      };
      
      loadCustomers();
      
      // Set up real-time listener for customers
      const unsubscribe = customersService.onSnapshot((customers) => {
        setCustomers(customers);
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Customer Database functions
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const newCustomer = {
        ...customerForm,
        dateAdded: new Date().toLocaleDateString()
      };
      await customersService.add(newCustomer);
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
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Failed to add customer. Please try again.');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await customersService.update(editingCustomer, customerForm);
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
      setEditingCustomer(null);
      setShowCustomerForm(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleEditCustomer = (customer) => {
    setCustomerForm({
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      projectType: customer.projectType,
      notes: customer.notes
    });
    setEditingCustomer(customer.id);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersService.delete(id);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
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

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="page-content" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' }}>
          <h1 style={{ color: '#22314a', marginBottom: '1rem' }}>CRM Access</h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>Please login to access the customer relationship management system.</p>
          
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
              Login to CRM
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
        <h1 style={{ color: '#22314a', margin: 0 }}>Customer Relationship Management</h1>
        <button onClick={handleLogout} style={{...buttonStyle, background: '#dc3545'}}>
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

    {/* Password Manager Section */}
    <div style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#22314a', margin: 0 }}>🔐 Company Password Manager</h2>
        <button 
          onClick={() => {
            setShowPasswordForm(!showPasswordForm);
            setEditingCredential(null);
            setCredentialForm({ serviceName: '', username: '', password: '', website: '', notes: '' });
          }}
          style={buttonStyle}
        >
          {showPasswordForm ? 'Cancel' : 'Add New Credential'}
        </button>
      </div>

      {/* Add/Edit Credential Form */}
      {showPasswordForm && (
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '2rem' }}>
          <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>
            {editingCredential ? 'Edit Credential' : 'Add New Credential'}
          </h3>
          <form onSubmit={editingCredential ? handleUpdateCredential : handleAddCredential}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Service/Software Name"
                value={credentialForm.serviceName}
                onChange={(e) => setCredentialForm({...credentialForm, serviceName: e.target.value})}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                placeholder="Username/Email"
                value={credentialForm.username}
                onChange={(e) => setCredentialForm({...credentialForm, username: e.target.value})}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={credentialForm.password}
                onChange={(e) => setCredentialForm({...credentialForm, password: e.target.value})}
                required
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="url"
                placeholder="Website URL (optional)"
                value={credentialForm.website}
                onChange={(e) => setCredentialForm({...credentialForm, website: e.target.value})}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={credentialForm.notes}
              onChange={(e) => setCredentialForm({...credentialForm, notes: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px', marginBottom: '1rem' }}
            />
            <button type="submit" style={buttonStyle}>
              {editingCredential ? 'Update Credential' : 'Save Credential'}
            </button>
          </form>
        </div>
      )}

      {/* Saved Credentials List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
        {savedCredentials.length === 0 ? (
          <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center', color: '#666' }}>
            <p>No credentials saved yet. Click "Add New Credential" to get started.</p>
          </div>
        ) : (
          savedCredentials.map(credential => (
            <div key={credential.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h4 style={{ color: '#22314a', margin: 0, fontSize: '1.1rem' }}>{credential.serviceName}</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEditCredential(credential)}
                    style={{ ...buttonStyle, padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#28a745' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCredential(credential.id)}
                    style={{ ...buttonStyle, padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#dc3545' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Username:</strong> {credential.username}
              </div>
              
              <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Password:</strong> 
                <span style={{ fontFamily: 'monospace' }}>
                  {showPasswords[credential.id] ? credential.password : '••••••••'}
                </span>
                <button 
                  onClick={() => togglePasswordVisibility(credential.id)}
                  style={{ ...buttonStyle, padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: '#6c757d' }}
                >
                  {showPasswords[credential.id] ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {credential.website && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Website:</strong> 
                  <a href={credential.website} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                    {credential.website}
                  </a>
                </div>
              )}
              
              {credential.notes && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Notes:</strong> {credential.notes}
                </div>
              )}
              
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                Added: {credential.dateAdded}
              </div>
            </div>
          ))
        )}
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
            </h3>
            <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm({...customerForm, companyName: e.target.value})}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={customerForm.contactName}
                  onChange={(e) => setCustomerForm({...customerForm, contactName: e.target.value})}
                  required
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input
                  type="email"
                  placeholder="Email Address"
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
                  required
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
                  required
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
              <button type="submit" style={buttonStyle}>
                {editingCustomer ? 'Update Customer' : 'Save Customer'}
              </button>
            </form>
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
                      <h4 style={{ color: '#22314a', margin: 0, fontSize: '1.2rem' }}>{customer.companyName}</h4>
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
                      <strong>Contact:</strong> {customer.contactName}
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
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                        {customer.zipCode && ` ${customer.zipCode}`}
                      </div>
                    )}
                    
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Project Type:</strong> 
                      <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {customer.projectType}
                      </span>
                    </div>
                    
                    {customer.notes && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Notes:</strong> {customer.notes}
                      </div>
                    )}
                    
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                      Added: {customer.dateAdded}
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
