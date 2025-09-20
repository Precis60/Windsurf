import React, { useState } from 'react';
import { supportService } from '../services/secureApi';

const SupportRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create a public support request
      const ticketData = {
        subject: `[${formData.name}] ${formData.subject}`,
        description: `
Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Company: ${formData.company || 'Not specified'}

Issue Description:
${formData.description}
        `,
        priority: formData.priority,
        category: formData.category,
        customer_email: formData.email,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_company: formData.company
      };

      await supportService.createTicket(ticketData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting support request:', error);
      setError('Failed to submit support request. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '1px solid #e1e5e9'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            ✅
          </div>
          <h1 style={{ 
            color: '#22314a', 
            marginBottom: '15px',
            fontSize: '28px'
          }}>
            Support Request Submitted!
          </h1>
          <p style={{ 
            color: '#666', 
            margin: '0 0 20px 0',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            Thank you for contacting Precision Cabling & Automation. We've received your support request and will respond within our standard timeframes.
          </p>
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#22314a' }}>What happens next?</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>You'll receive an email confirmation shortly</li>
              <li>Our technical team will review your request</li>
              <li>We'll contact you within our response timeframes</li>
              <li>For urgent issues, call us directly at 0413 729 663</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                subject: '',
                description: '',
                priority: 'medium',
                category: 'general'
              });
            }}
            style={{
              background: '#9f7aea',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: '80vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #9f7aea 0%, #667eea 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0',
          fontSize: '32px',
          fontWeight: '600'
        }}>
          🎧 Support Request
        </h1>
        <p style={{ 
          margin: 0,
          fontSize: '18px',
          opacity: 0.9
        }}>
          Get professional technical support from Precision Cabling & Automation
        </p>
      </div>

      {/* Company Info */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #e1e5e9',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#22314a' }}>📞 Phone Support</h3>
            <p style={{ margin: 0, color: '#666' }}>0413 729 663</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Mon-Fri 8AM-6PM</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#22314a' }}>📧 Email Support</h3>
            <p style={{ margin: 0, color: '#666' }}>support@precisioncabling.com</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>24/7 Response</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#22314a' }}>🚨 Emergency</h3>
            <p style={{ margin: 0, color: '#666' }}>24/7 Critical Issues</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Call for immediate help</p>
          </div>
        </div>
      </div>

      {/* Support Request Form */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #e1e5e9'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#22314a' }}>
          Submit Support Request
        </h2>

        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Contact Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#22314a',
                fontWeight: '500'
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#22314a',
                fontWeight: '500'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#22314a',
                fontWeight: '500'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="0412 345 678"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#22314a',
                fontWeight: '500'
              }}>
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Your company name (optional)"
              />
            </div>
          </div>

          {/* Issue Details */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#22314a',
              fontWeight: '500'
            }}>
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Brief description of your issue"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#22314a',
              fontWeight: '500'
            }}>
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Please provide detailed information about your issue, including:
- What happened?
- When did it occur?
- What were you trying to do?
- Any error messages?
- Steps to reproduce the issue"
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#22314a',
                fontWeight: '500'
              }}>
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="low">🟢 Low - General inquiry</option>
                <option value="medium">🟡 Medium - Standard issue</option>
                <option value="high">🟠 High - Business impacting</option>
                <option value="urgent">🔴 Urgent - Critical/Emergency</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#22314a',
                fontWeight: '500'
              }}>
                Issue Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="technical">🔧 Technical Issue</option>
                <option value="billing">💰 Billing Question</option>
                <option value="general">💬 General Inquiry</option>
                <option value="feature_request">💡 Feature Request</option>
              </select>
            </div>
          </div>

          {/* Response Time Information */}
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e1e5e9'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#22314a', fontSize: '16px' }}>
              ⏱️ Expected Response Times
            </h3>
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              <p style={{ margin: '5px 0' }}>🔴 <strong>Urgent:</strong> 2 hours (Critical business issues)</p>
              <p style={{ margin: '5px 0' }}>🟠 <strong>High:</strong> 4 hours (Business impacting)</p>
              <p style={{ margin: '5px 0' }}>🟡 <strong>Medium:</strong> 24 hours (Standard issues)</p>
              <p style={{ margin: '5px 0' }}>🟢 <strong>Low:</strong> 48 hours (General inquiries)</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#ccc' : '#9f7aea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.background = '#8b5cf6';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.background = '#9f7aea';
            }}
          >
            {loading ? '🔄 Submitting Request...' : '🎫 Submit Support Request'}
          </button>
        </form>
      </div>

      {/* Security Notice */}
      <div style={{
        background: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: 0, 
          color: '#2e7d32',
          fontSize: '14px'
        }}>
          🔒 <strong>Your information is secure:</strong> All support requests are encrypted and handled confidentially by our professional technical team.
        </p>
      </div>
    </div>
  );
};

export default SupportRequest;
