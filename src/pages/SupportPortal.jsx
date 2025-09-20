import React, { useState, useEffect } from 'react';
import { supportService, authService } from '../services/secureApi';

const SupportPortal = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  const user = authService.getCurrentUser();
  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await supportService.getTickets();
      const ticketList = Array.isArray(response) ? response : response.tickets || [];
      setTickets(ticketList);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await supportService.createTicket(newTicket);
      setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' });
      setShowNewTicketForm(false);
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#ed8936',
      'in_progress': '#667eea',
      'resolved': '#48bb78',
      'closed': '#a0aec0'
    };
    return colors[status] || '#a0aec0';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#48bb78',
      'medium': '#ed8936',
      'high': '#f56565',
      'urgent': '#e53e3e'
    };
    return colors[priority] || '#ed8936';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
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
          🎧 Support Portal
        </h1>
        <p style={{ 
          margin: 0,
          fontSize: '18px',
          opacity: 0.9
        }}>
          Professional technical support for Precision Cabling & Automation
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: '30px',
        borderBottom: '2px solid #e1e5e9'
      }}>
        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'tickets' ? '#9f7aea' : 'transparent',
            color: activeTab === 'tickets' ? 'white' : '#666',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '500',
            marginRight: '10px'
          }}
        >
          📋 Support Tickets
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'submit' ? '#9f7aea' : 'transparent',
            color: activeTab === 'submit' ? 'white' : '#666',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '500',
            marginRight: '10px'
          }}
        >
          ➕ Submit Request
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'knowledge' ? '#9f7aea' : 'transparent',
            color: activeTab === 'knowledge' ? 'white' : '#666',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📚 Knowledge Base
        </button>
      </div>

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: '#22314a' }}>Support Tickets</h2>
            <button
              onClick={() => setShowNewTicketForm(true)}
              style={{
                background: '#9f7aea',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              + New Ticket
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ color: '#666', margin: '0 0 10px 0' }}>No Support Tickets</h3>
              <p style={{ color: '#999', margin: 0 }}>
                Create your first support ticket to get started
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e1e5e9',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s'
                  }}
                  onClick={() => setSelectedTicket(ticket)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 5px 0',
                        color: '#22314a',
                        fontSize: '18px'
                      }}>
                        #{ticket.id} - {ticket.subject}
                      </h3>
                      <p style={{ 
                        margin: 0,
                        color: '#666',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {ticket.description?.substring(0, 100)}...
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{
                        background: getPriorityColor(ticket.priority) + '20',
                        color: getPriorityColor(ticket.priority),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {ticket.priority}
                      </span>
                      <span style={{
                        background: getStatusColor(ticket.status) + '20',
                        color: getStatusColor(ticket.status),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    <span>Category: {ticket.category}</span>
                    <span>Created: {formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Request Tab */}
      {activeTab === 'submit' && (
        <div>
          <h2 style={{ margin: '0 0 20px 0', color: '#22314a' }}>Submit Support Request</h2>
          
          {/* Public Support Form */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #e1e5e9',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#22314a' }}>
              🌐 Public Support Request Form
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              Share this link with clients to submit support requests:
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              marginBottom: '20px'
            }}>
              <code style={{ 
                color: '#9f7aea',
                fontSize: '14px',
                wordBreak: 'break-all'
              }}>
                https://precis60.github.io/Windsurf/support-request
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://precis60.github.io/Windsurf/support-request');
                  alert('Link copied to clipboard!');
                }}
                style={{
                  background: '#9f7aea',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  marginLeft: '10px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Copy Link
              </button>
            </div>
          </div>

          {/* Internal Support Form */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #e1e5e9'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#22314a' }}>
              🔒 Internal Support Request
            </h3>
            <form onSubmit={handleCreateTicket}>
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
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#22314a',
                  fontWeight: '500'
                }}>
                  Description *
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
                />
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
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
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#22314a',
                    fontWeight: '500'
                  }}>
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="general">General Inquiry</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#9f7aea',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = '#8b5cf6'}
                onMouseOut={(e) => e.target.style.background = '#9f7aea'}
              >
                🎫 Submit Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div>
          <h2 style={{ margin: '0 0 20px 0', color: '#22314a' }}>Knowledge Base</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* FAQ Section */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#22314a' }}>
                ❓ Frequently Asked Questions
              </h3>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                <p><strong>Q: How do I schedule a service appointment?</strong></p>
                <p>A: Use our Calendar system to book appointments or contact us directly.</p>
                
                <p><strong>Q: What services do you provide?</strong></p>
                <p>A: We specialize in network cabling, security systems, and automation solutions.</p>
                
                <p><strong>Q: How long does installation take?</strong></p>
                <p>A: Installation time varies by project size. We'll provide estimates during consultation.</p>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#22314a' }}>
                📞 Contact Information
              </h3>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                <p><strong>Phone:</strong> 0413 729 663</p>
                <p><strong>Email:</strong> support@precisioncabling.com</p>
                <p><strong>Hours:</strong> Mon-Fri 8AM-6PM</p>
                <p><strong>Emergency:</strong> 24/7 for critical issues</p>
              </div>
            </div>

            {/* Service Areas */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#22314a' }}>
                🗺️ Service Areas
              </h3>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                <p>We provide services throughout:</p>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  <li>Greater Sydney Area</li>
                  <li>Central Coast</li>
                  <li>Newcastle Region</li>
                  <li>Wollongong Area</li>
                </ul>
              </div>
            </div>

            {/* Response Times */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #e1e5e9'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#22314a' }}>
                ⏱️ Response Times
              </h3>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                <p><span style={{color: '#e53e3e'}}>🔴 Urgent:</span> 2 hours</p>
                <p><span style={{color: '#f56565'}}>🟠 High:</span> 4 hours</p>
                <p><span style={{color: '#ed8936'}}>🟡 Medium:</span> 24 hours</p>
                <p><span style={{color: '#48bb78'}}>🟢 Low:</span> 48 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: '#22314a' }}>
                Ticket #{selectedTicket.id}
              </h2>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#22314a' }}>
                {selectedTicket.subject}
              </h3>
              <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
                {selectedTicket.description}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div>
                <strong>Status:</strong> {selectedTicket.status}
              </div>
              <div>
                <strong>Priority:</strong> {selectedTicket.priority}
              </div>
              <div>
                <strong>Category:</strong> {selectedTicket.category}
              </div>
              <div>
                <strong>Created:</strong> {formatDate(selectedTicket.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPortal;
