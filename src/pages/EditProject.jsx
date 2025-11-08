import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsService, customersService } from '../services/secureApi';

const taskStatuses = ['Pending', 'In Progress', 'Completed'];

const categories = [
  { id: 'security', name: 'Security' },
  { id: 'access-control', name: 'Access Control' },
  { id: 'it', name: 'Information Technology' },
  { id: 'cctv', name: 'CCTV' },
  { id: 'consultation', name: 'Consultation' },
  { id: 'maintenance', name: 'Routine Maintenance' },
  { id: 'av', name: 'Audio Visual' },
  { id: 'automation', name: 'Automation' },
  { id: 'network', name: 'Network Programming' },
  { id: 'electrical', name: 'Electrical Works' },
  { id: 'contractor', name: 'Contractor' },
  { id: 'garden', name: 'Garden Works' },
  { id: 'lighting', name: 'Electrical & Lighting' }
];

const TaskStatus = ({ status, onUpdate }) => {
  const handleChange = (e) => {
    onUpdate(e.target.value);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Completed': return '#198754';
      case 'In Progress': return '#0d6efd';
      default: return '#6c757d';
    }
  };

  return (
    <select 
      value={status} 
      onChange={handleChange} 
      style={{
        background: getStatusColor(),
        color: 'white',
        border: 'none',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        cursor: 'pointer'
      }}
    >
      {taskStatuses.map(s => (
        <option key={s} value={s} style={{ backgroundColor: '#fff', color: '#000' }}>{s}</option>
      ))}
    </select>
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

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectsService.getById(id);
        setProject(response);
        setTasks(response.tasks || []);
      } catch (err) {
        setError('Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };

    const fetchClients = async () => {
      try {
        const clientsResponse = await customersService.getAll();
        if (clientsResponse && Array.isArray(clientsResponse)) {
          setClients(clientsResponse);
        }
      } catch (err) {
        console.error('Failed to fetch clients', err);
      }
    };

    fetchProject();
    fetchClients();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectsService.update(id, { ...project, tasks });
      navigate('/projects');
    } catch (err) {
      setError('Failed to save project');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      try {
        await projectsService.delete(id);
        navigate('/projects');
      } catch (err) {
        setError('Failed to delete project');
        setLoading(false);
      }
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    setTasks([...tasks, { id: Date.now(), description: newTask, status: 'Pending' }]);
    setNewTask('');
  };

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleUpdateTask = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  if (loading) return <div>Loading project...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Edit Project: {project.name}</h1>
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Project Name</label>
            <input type="text" name="name" value={project.name} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Project Code</label>
            <input type="text" name="projectCode" value={project.projectCode} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label>Client Name</label>
            <select name="clientName" value={project.clientName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }}>
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.name}>{client.name}</option>
              ))}
            </select>
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
          <div>
            <label>Category</label>
            <select name="category" value={project.category} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
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

        <h2 style={{ color: '#22314a', marginTop: '2rem', marginBottom: '1rem' }}>Tasks</h2>
        <ProjectProgressBar tasks={tasks} />
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="New task description"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button type="button" onClick={handleAddTask} style={{ background: '#5cb85c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
            Add Task
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{task.description}</td>
                <td style={{ padding: '0.5rem' }}>
                  <TaskStatus status={task.status} onUpdate={(newStatus) => handleUpdateTask(task.id, newStatus)} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button type="button" onClick={() => handleRemoveTask(task.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" disabled={loading} style={{ background: '#22314a', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Project'}
          </button>
          <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#dc3545', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
};

export default EditProject;
