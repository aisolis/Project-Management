import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [newProjectData, setNewProjectData] = useState({
    project_name: '',
    project_description: '',
  });
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [editProjectData, setEditProjectData] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user.role;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';



  const fetchProjects = useCallback(() => {
    axios
      .get(`${API_URL}/api/projects`)
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los proyectos', error);
      });
  }, [API_URL]);

  useEffect(() => {
    if (userRole !== 'ADMIN') {
      // Si el usuario no es ADMIN, lo redirigimos al dashboard
      navigate('/dashboard');
    } else {
      fetchProjects();
    }
  }, [userRole, navigate, fetchProjects]);


  const handleChange = (e) => {
    setNewProjectData({
      ...newProjectData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitNewProject = (e) => {
    e.preventDefault();

    axios
      .post(`${API_URL}/api/projects`, newProjectData)
      .then(() => {
        fetchProjects();
        setNewProjectData({
          project_name: '',
          project_description: '',
        });
        setShowCreateProjectForm(false);
      })
      .catch((error) => {
        console.error('Error al crear el proyecto', error);
      });
  };

  const handleDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
  };

  const confirmDeleteProject = () => {
    axios
      .delete(`${API_URL}/api/projects/${projectToDelete}`)
      .then(() => {
        fetchProjects();
        setProjectToDelete(null);
      })
      .catch((error) => {
        console.error('Error al eliminar el proyecto', error);
      });
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
  };

  const handleEditProject = (project) => {
    setEditProjectData(project);
  };

  const handleChangeEdit = (e) => {
    setEditProjectData({
      ...editProjectData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEditProject = (e) => {
    e.preventDefault();

    axios
      .put(`${API_URL}/api/projects/${editProjectData.project_id}`, editProjectData)
      .then(() => {
        fetchProjects();
        setEditProjectData(null);
      })
      .catch((error) => {
        console.error('Error al actualizar el proyecto', error);
      });
  };

  const handleCancelEditProject = () => {
    setEditProjectData(null);
  };

  const handleCancelCreateProject = () => {
    setShowCreateProjectForm(false);
    setNewProjectData({
      project_name: '',
      project_description: '',
    });
  };

  return (
    <div style={styles.container}>
      <h2>Gestionar Proyectos</h2>
      <button onClick={() => setShowCreateProjectForm(true)} style={styles.button}>
        Crear Nuevo Proyecto
      </button>

      {showCreateProjectForm && (
        <>
          <div style={styles.overlay} onClick={handleCancelCreateProject}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitNewProject} style={styles.form}>
              <h3>Crear Nuevo Proyecto</h3>
              <div style={styles.inputGroup}>
                <label htmlFor="project_name">Nombre del Proyecto:</label>
                <input
                  type="text"
                  name="project_name"
                  id="project_name"
                  value={newProjectData.project_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="project_description">Descripción:</label>
                <textarea
                  name="project_description"
                  id="project_description"
                  value={newProjectData.project_description}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={handleCancelCreateProject} style={styles.button}>
                  Cancelar
                </button>
                <button type="submit" style={styles.button}>
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <h3>Lista de Proyectos</h3>
      {projects.length === 0 ? (
        <p>No hay proyectos disponibles.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre del Proyecto</th>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.project_id}>
                <td style={styles.td}>{project.project_name}</td>
                <td style={styles.td}>{project.project_description}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEditProject(project)}
                    style={styles.button}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.project_id)}
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editProjectData && (
        <>
          <div style={styles.overlay} onClick={handleCancelEditProject}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitEditProject} style={styles.form}>
              <h3>Editar Proyecto</h3>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_project_name">Nombre del Proyecto:</label>
                <input
                  type="text"
                  name="project_name"
                  id="edit_project_name"
                  value={editProjectData.project_name}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_project_description">Descripción:</label>
                <textarea
                  name="project_description"
                  id="edit_project_description"
                  value={editProjectData.project_description}
                  onChange={handleChangeEdit}
                  style={styles.textarea}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={handleCancelEditProject}
                  style={styles.button}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.button}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {projectToDelete && (
        <>
          <div style={styles.overlay} onClick={cancelDeleteProject}></div>
          <div style={styles.modal}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este proyecto?</p>
            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={cancelDeleteProject} style={styles.button}>
                Cancelar
              </button>
              <button type="button" onClick={confirmDeleteProject} style={styles.deleteButton}>
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}

      <button onClick={() => navigate('/dashboard')} style={styles.button}>
        Volver al Dashboard
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  form: {
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
  },
  inputGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    boxSizing: 'border-box',
    minHeight: '80px',
  },
  button: {
    padding: '10px',
    marginRight: '10px',
  },
  deleteButton: {
    padding: '10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    marginRight: '10px',
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
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '20px',
    zIndex: 1000,
    width: '80%',
    maxWidth: '500px',
    borderRadius: '5px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
};

export default ManageProjects;