import React, { useState, useEffect } from 'react';
import { authService, projectsService } from '../services/secureApi';

// Project categories
const categories = [
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'access-control', name: 'Access Control', icon: '🔑' },
  { id: 'it', name: 'Information Technology', icon: '💻' },
  { id: 'cctv', name: 'CCTV', icon: '📹' },
  { id: 'consultation', name: 'Consultation', icon: '📋' },
  { id: 'maintenance', name: 'Routine Maintenance', icon: '🔧' },
  { id: 'av', name: 'Audio Visual', icon: '🎵' },
  { id: 'automation', name: 'Automation', icon: '🤖' },
  { id: 'network', name: 'Network Programming', icon: '🌐' },
  { id: 'electrical', name: 'Electrical Works', icon: '⚡' },
  { id: 'contractor', name: 'Contractor', icon: '👷' },
  { id: 'garden', name: 'Garden Works', icon: '🌿' },
  { id: 'lighting', name: 'Electrical & Lighting', icon: '💡' }
];

// Test data for initial development
const testProjects = [
  {
    id: 1,
    name: "Office Security System",
    description: "Complete security system installation for main office building",
    status: "In Progress",
    category: "security"
  },
  {
    id: 2,
    name: "Card Access System",
    description: "Installing card readers and access control systems",
    status: "Planning",
    category: "access-control"
  },
  {
    id: 3,
    name: "Server Room Setup",
    description: "Setting up new server infrastructure",
    status: "In Progress",
    category: "it"
  },
  {
    id: 4,
    name: "Surveillance System",
    description: "Installing HD cameras and monitoring system",
    status: "Completed",
    category: "cctv"
  },
  {
    id: 5,
    name: "Security Assessment",
    description: "Comprehensive security consultation for new building",
    status: "In Progress",
    category: "consultation"
  },
  {
    id: 6,
    name: "Monthly System Check",
    description: "Regular maintenance of security systems",
    status: "Planning",
    category: "maintenance"
  },
  {
    id: 7,
    name: "Conference Room AV",
    description: "Setting up audio-visual equipment",
    status: "In Progress",
    category: "av"
  },
  {
    id: 8,
    name: "Smart Home System",
    description: "Home automation installation",
    status: "Planning",
    category: "automation"
  },
  {
    id: 9,
    name: "Network Programming",
    description: "Custom network solution development",
    status: "In Progress",
    category: "network"
  },
  {
    id: 10,
    name: "Electrical Upgrade",
    description: "Upgrading electrical systems",
    status: "Planning",
    category: "electrical"
  },
  {
    id: 11,
    name: "Construction Support",
    description: "Security system installation during construction",
    status: "On Hold",
    category: "contractor"
  },
  {
    id: 12,
    name: "Garden Lighting",
    description: "Installing garden security lights",
    status: "Planning",
    category: "garden"
  },
  {
    id: 13,
    name: "LED Upgrade",
    description: "Upgrading to energy-efficient lighting",
    status: "In Progress",
    category: "lighting"
  }
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuthAndLoadProjects = async () => {
      setLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        setUser(currentUser);
        
        // Now load projects
        await loadProjects();
      } catch (err) {
        console.error('Error in authentication or loading projects:', err);
        setError(err.message || 'Failed to initialize projects page');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // Try to load from API first
      const response = await projectsService.getAll();
      if (response && Array.isArray(response)) {
        setProjects(response);
      } else {
        // Fallback to test data if API fails or returns invalid data
        console.log('Using test data as fallback');
        setProjects(testProjects);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      // Fallback to test data if API fails
      console.log('Using test data as fallback after error');
      setProjects(testProjects);
      // Don't set error when we have fallback data
      setError(null);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Safety check for null/undefined projects
  if (!projects) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        color: '#6c757d'
      }}>
        <h3>No projects available</h3>
        <p>There might be an issue loading the projects.</p>
      </div>
    );
  }

  const filteredProjects = projects.filter(project => 
    (selectedCategory === 'all' || project.category === selectedCategory) &&
    (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginBottom: '1rem'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              background: selectedCategory === 'all' ? '#22314a' : '#f8f9fa',
              color: selectedCategory === 'all' ? 'white' : '#22314a',
              border: '1px solid #22314a',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            All Projects
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                background: selectedCategory === category.id ? '#22314a' : '#f8f9fa',
                color: selectedCategory === category.id ? 'white' : '#22314a',
                border: '1px solid #22314a',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>{categories.find(c => c.id === project.category)?.icon}</span>
              <span style={{ 
                background: '#e9ecef',
                color: '#6c757d',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                {categories.find(c => c.id === project.category)?.name}
              </span>
            </div>
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
