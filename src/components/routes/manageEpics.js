// src/ManageEpics.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ManageEpics() {
  const [epics, setEpics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newEpicData, setNewEpicData] = useState({
    epic_name: '',
    epic_description: '',
    project_id: '',
  });
  const [showCreateEpicForm, setShowCreateEpicForm] = useState(false);
  const [editEpicData, setEditEpicData] = useState(null);
  const [epicToDelete, setEpicToDelete] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user.role;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const fetchEpics = useCallback(() => {
    axios
      .get(`${API_URL}/api/epics`)
      .then((response) => {
        setEpics(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener las épicas', error);
      });
  }, [API_URL]);

  const fetchProjects = useCallback(() => {
    axios
      .get(`${API_URL}/api/projects`)
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener proyectos', error);
      });
  }, [API_URL]);


  useEffect(() => {
    if (userRole !== 'ADMIN') {
      // Si el usuario no es ADMIN, lo redirigimos al dashboard
      navigate('/dashboard');
    } else {
      fetchEpics();
      fetchProjects();
    }
  }, [userRole, navigate, API_URL, fetchEpics, fetchProjects]);

  const handleChange = (e) => {
    setNewEpicData({
      ...newEpicData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitNewEpic = (e) => {
    e.preventDefault();

    axios
      .post(`${API_URL}/api/epics/project/${newEpicData.project_id}`, {
        epic_name: newEpicData.epic_name,
        epic_description: newEpicData.epic_description,
      })
      .then(() => {
        fetchEpics();
        setNewEpicData({
          epic_name: '',
          epic_description: '',
          project_id: '',
        });
        setShowCreateEpicForm(false);
      })
      .catch((error) => {
        console.error('Error al crear la épica', error);
      });
  };

  const handleDeleteEpic = (epicId) => {
    setEpicToDelete(epicId);
  };

  const confirmDeleteEpic = () => {
    axios
      .delete(`${API_URL}/api/epics/${epicToDelete}`)
      .then(() => {
        fetchEpics();
        setEpicToDelete(null);
      })
      .catch((error) => {
        console.error('Error al eliminar la épica', error);
      });
  };

  const cancelDeleteEpic = () => {
    setEpicToDelete(null);
  };

  const handleEditEpic = (epic) => {
    setEditEpicData(epic);
  };

  const handleChangeEdit = (e) => {
    setEditEpicData({
      ...editEpicData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEditEpic = (e) => {
    e.preventDefault();

    axios
      .put(`${API_URL}/api/epics/${editEpicData.epic_id}`, editEpicData)
      .then(() => {
        fetchEpics();
        setEditEpicData(null);
      })
      .catch((error) => {
        console.error('Error al actualizar la épica', error);
      });
  };

  const handleCancelEditEpic = () => {
    setEditEpicData(null);
  };

  const handleCancelCreateEpic = () => {
    setShowCreateEpicForm(false);
    setNewEpicData({
      epic_name: '',
      epic_description: '',
      project_id: '',
    });
  };

  return (
    <div style={styles.container}>
      <h2>Gestionar Épicas</h2>
      <button onClick={() => setShowCreateEpicForm(true)} style={styles.button}>
        Crear Nueva Épica
      </button>

      {showCreateEpicForm && (
        <>
          <div style={styles.overlay} onClick={handleCancelCreateEpic}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitNewEpic} style={styles.form}>
              <h3>Crear Nueva Épica</h3>
              <div style={styles.inputGroup}>
                <label htmlFor="epic_name">Nombre de la Épica:</label>
                <input
                  type="text"
                  name="epic_name"
                  id="epic_name"
                  value={newEpicData.epic_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="epic_description">Descripción:</label>
                <textarea
                  name="epic_description"
                  id="epic_description"
                  value={newEpicData.epic_description}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="project_id">Proyecto Asociado:</label>
                <select
                  name="project_id"
                  id="project_id"
                  value={newEpicData.project_id}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">Selecciona un proyecto</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={handleCancelCreateEpic} style={styles.button}>
                  Cancelar
                </button>
                <button type="submit" style={styles.button}>
                  Crear Épica
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <h3>Lista de Épicas</h3>
      {epics.length === 0 ? (
        <p>No hay épicas disponibles.</p>
      ) : (
        <div style={styles.cardContainer}>
          {epics.map((epic) => (
            <div key={epic.epic_id} style={styles.card}>
              <h4>{epic.epic_name}</h4>
              <p>
                <strong>Proyecto:</strong> {epic.project_name}
              </p>
              <p>{epic.epic_description}</p>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => handleEditEpic(epic)}
                  style={styles.button}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteEpic(epic.epic_id)}
                  style={styles.deleteButton}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editEpicData && (
        <>
          <div style={styles.overlay} onClick={handleCancelEditEpic}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitEditEpic} style={styles.form}>
              <h3>Editar Épica</h3>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_epic_name">Nombre de la Épica:</label>
                <input
                  type="text"
                  name="epic_name"
                  id="edit_epic_name"
                  value={editEpicData.epic_name}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_epic_description">Descripción:</label>
                <textarea
                  name="epic_description"
                  id="edit_epic_description"
                  value={editEpicData.epic_description}
                  onChange={handleChangeEdit}
                  style={styles.textarea}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_project_id">Proyecto Asociado:</label>
                <select
                  name="project_id"
                  id="edit_project_id"
                  value={editEpicData.project_id}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                >
                  <option value="">Selecciona un proyecto</option>
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={handleCancelEditEpic}
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

      {epicToDelete && (
        <>
          <div style={styles.overlay} onClick={cancelDeleteEpic}></div>
          <div style={styles.modal}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar esta épica?</p>
            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={cancelDeleteEpic} style={styles.button}>
                Cancelar
              </button>
              <button type="button" onClick={confirmDeleteEpic} style={styles.deleteButton}>
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
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '15px',
    margin: '10px',
    width: 'calc(33% - 20px)',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    marginTop: '10px',
    textAlign: 'right',
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

export default ManageEpics;