import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user.role;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error al obtener los proyectos', error);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error al obtener las tareas', error);
      }
    };

    fetchProjects();
    fetchTasks();
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getTaskCountForProject = (projectId) => {
    return tasks.filter(task => task.project_id === projectId).length;
  };

  const goToProjectTasks = (projectId) => {
    navigate(`/projects/${projectId}/tasks`);
  };

  return (
    <div style={styles.container}>
      <h2>Bienvenido, {user.name}</h2>
      <div style={styles.buttonContainer}>
        <button onClick={handleLogout} style={styles.button}>
          Cerrar Sesión
        </button>
      </div>
      {userRole === 'ADMIN' && (
        <div style={styles.adminOptions}>
          <h3>Opciones de Administrador</h3>
          <Link to="/manage-projects" style={styles.link}>
            Gestionar Proyectos
          </Link>
          <Link to="/manage-epics" style={styles.link}>
            Gestionar Épicas
          </Link>
          <Link to="/manage-users" style={styles.link}>
            Gestionar Usuarios
          </Link>
        </div>
      )}
      <h3>Proyectos</h3>
      {projects.length === 0 ? (
        <p>No hay proyectos disponibles.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre del Proyecto</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Número de Tareas</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.project_id}>
                <td style={styles.td}>{project.project_name}</td>
                <td style={styles.td}>{project.project_description}</td>
                <td style={styles.td}>{getTaskCountForProject(project.project_id)}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => goToProjectTasks(project.project_id)}
                    style={styles.button}
                  >
                    Ver Tareas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  buttonContainer: {
    textAlign: 'right',
  },
  button: {
    padding: '10px',
    marginRight: '10px',
  },
  adminOptions: {
    marginTop: '20px',
  },
  link: {
    display: 'block',
    marginTop: '10px',
    textDecoration: 'none',
    color: 'blue',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
    backgroundColor: '#f2f2f2',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
  },
};

export default Dashboard;