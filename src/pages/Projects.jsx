import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
const taskStatuses = ['Pending', 'In Progress', 'Completed'];

const testProjects = [
  {
    id: 1,
    name: "Office Security System",
    description: "Complete security system installation for main office building",
    status: "In Progress",
    category: "security",
    tasks: [
      { id: 1, name: 'Initial Survey', status: 'Completed' },
      { id: 2, name: 'System Design', status: 'Completed' },
      { id: 3, name: 'Installation', status: 'In Progress' },
      { id: 4, name: 'Configuration', status: 'Pending' },
      { id: 5, name: 'Client Training', status: 'Pending' },
    ]
  },
  {
    id: 2,
    name: "Card Access System",
    description: "Installing card readers and access control systems",
    status: "Planning",
    category: "access-control",
    tasks: [
      { id: 1, name: 'Requirement Analysis', status: 'Completed' },
      { id: 2, name: 'Hardware Procurement', status: 'In Progress' },
      { id: 3, name: 'Installation', status: 'Pending' },
      { id: 4, name: 'Software Setup', status: 'Pending' },
      { id: 5, name: 'Testing', status: 'Pending' },
    ]
  },
  // ... (other test projects)
];

const TaskStatus = ({ status, onUpdate }) => {
  const statusIndex = taskStatuses.indexOf(status);

  const handleClick = () => {
    const nextIndex = (statusIndex + 1) % taskStatuses.length;
    onUpdate(taskStatuses[nextIndex]);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Completed': return '#198754';
      case 'In Progress': return '#0d6efd';
      default: return '#6c757d';
    }
  };

  return (
    <span 
      onClick={handleClick} 
      style={{
        background: getStatusColor(),
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        cursor: 'pointer'
      }}
    >
      {status}
    </span>
  );
};

const ProjectProgressBar = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '1rem'
    }}>
      <div style={{
        width: `${progress}%`,
        backgroundColor: '#198754',
        height: '10px',
        transition: 'width 0.3s ease-in-out'
      }}>
      </div>
    </div>
  );
};

const Projects = () => {
  const navigate = useNavigate();
  // State declarations at the top level
  const [projects, setProjects] = useState(testProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateTask = (projectId, taskId, newStatus) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) } 
        : p
    ));
  };


  // Early return for loading state
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

  // Early return for error state
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

  // Filter projects based on category and search term
  const filteredProjects = projects.filter(project => 
    (selectedCategory === 'all' || project.category === selectedCategory) &&
    (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#22314a', margin: 0 }}>Projects</h1>
        <button
          onClick={() => navigate('/projects/new')}
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

      {/* Search and filter section */}
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

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
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

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#22314a', marginBottom: '0.5rem' }}>Project Progress</h4>
                <ProjectProgressBar tasks={project.tasks} />
                <h4 style={{ color: '#22314a', marginBottom: '0.5rem' }}>Tasks</h4>
                {project.tasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span>{task.name}</span>
                    <TaskStatus status={task.status} onUpdate={(newStatus) => handleUpdateTask(project.id, task.id, newStatus)} />
                  </div>
                ))}
              </div>
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
                  onClick={() => console.log('View details clicked', project.id)}
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
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <h3>No projects found</h3>
          <p>Start by creating a new project or try a different search.</p>
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
