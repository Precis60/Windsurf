import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '../services/secureApi';

const NewProject = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState({
    projectName: '',
    projectCode: '',
    clientName: '',
    clientAddress: '',
    requestDate: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Planning',
    requestedBy: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // The create method in projectsService needs to be implemented
      await projectsService.create(project);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#22314a', marginBottom: '2rem' }}>Add New Project</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Project Name</label>
            <input type="text" name="projectName" value={project.projectName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Project Code</label>
            <input type="text" name="projectCode" value={project.projectCode} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Client Name</label>
            <input type="text" name="clientName" value={project.clientName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Client Address</label>
            <input type="text" name="clientAddress" value={project.clientAddress} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Request Date</label>
            <input type="date" name="requestDate" value={project.requestDate} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Due Date</label>
            <input type="date" name="dueDate" value={project.dueDate} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Priority</label>
            <select name="priority" value={project.priority} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select name="status" value={project.status} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
              <option>Planning</option>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label>Requested By</label>
            <input type="text" name="requestedBy" value={project.requestedBy} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label>Description</label>
            <textarea name="description" value={project.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
        </div>

        <h2 style={{ color: '#22314a', marginTop: '2rem', marginBottom: '1rem' }}>Jobs</h2>
        {/* Jobs table will go here */}
        <p>Jobs table functionality will be added in a future step.</p>

        <button type="submit" disabled={loading} style={{ background: '#22314a', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create Project'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
};

export default NewProject;
