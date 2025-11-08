import React, { useState, useEffect } from 'react';
import { authService } from '../services/secureApi';

// Test data for initial development
const testProjects = [
  {
    id: 1,
    name: "Security System Installation",
    description: "Complete security system installation for main office building",
    status: "In Progress"
  },
  {
    id: 2,
    name: "Network Infrastructure Upgrade",
    description: "Upgrading network infrastructure and cabling for better performance",
    status: "Planning"
  },
  {
    id: 3,
    name: "Camera System Maintenance",
    description: "Regular maintenance and updates for existing camera systems",
    status: "Completed"
  }
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    setUser(currentUser);
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // For now, we'll use test data
      setProjects(testProjects);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#22314a'
      }}>
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        color: '#dc3545',
        textAlign: 'center'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#22314a', margin: 0 }}>Projects</h1>
        <button
          onClick={() => {/* TODO: Implement project creation */}}
          style={{
            background: '#22314a',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          New Project
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}
          >
            <h3 style={{ color: '#22314a', marginBottom: '1rem' }}>{project.name}</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>{project.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: getStatusColor(project.status),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.875rem'
              }}>
                {project.status}
              </span>
              <button
                onClick={() => {/* TODO: Implement project details view */}}
                style={{
                  background: 'none',
                  border: '1px solid #22314a',
                  color: '#22314a',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <h3>No projects found</h3>
          <p>Start by creating a new project.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    'In Progress': '#0d6efd',
    'Completed': '#198754',
    'On Hold': '#ffc107',
    'Cancelled': '#dc3545',
    'Planning': '#6c757d'
  };
  return colors[status] || '#6c757d';
};

export default Projects;
