import React, { useState } from "react";

const CRMSimple = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });

  const handleSave = async () => {
    console.log('Save clicked!');
    alert('Save button works! Data: ' + JSON.stringify(formData));
    
    // Add to local list
    const newCustomer = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    setCustomers([...customers, newCustomer]);
    setFormData({ name: '', email: '', company: '' });
    alert('Customer saved locally!');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple CRM Test</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Add Customer</h3>
        <input
          type="text"
          placeholder="Customer Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={{ margin: '0.5rem', padding: '0.5rem', width: '200px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={{ margin: '0.5rem', padding: '0.5rem', width: '200px' }}
        />
        <input
          type="text"
          placeholder="Company"
          value={formData.company}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          style={{ margin: '0.5rem', padding: '0.5rem', width: '200px' }}
        />
        <br />
        <button 
          onClick={handleSave}
          style={{ 
            margin: '0.5rem', 
            padding: '0.5rem 1rem', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          SAVE CUSTOMER
        </button>
      </div>

      <div>
        <h3>Saved Customers ({customers.length})</h3>
        {customers.map(customer => (
          <div key={customer.id} style={{ padding: '0.5rem', border: '1px solid #eee', margin: '0.5rem 0' }}>
            <strong>{customer.name}</strong> - {customer.email} ({customer.company})
          </div>
        ))}
      </div>
    </div>
  );
};

export default CRMSimple;
