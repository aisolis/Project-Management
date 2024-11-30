// src/ProjectTasks.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


function ProjectTasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [epics, setEpics] = useState([]);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    task_title: '',
    task_description: '',
    due_date: '',
    epic_id: null,
  });
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [taskStates, setTaskStates] = useState([]);
  const [tasksByState, setTasksByState] = useState({});
  const [stateNameToIdMap, setStateNameToIdMap] = useState({});
  const userRole = user.role;
  const [users, setUsers] = useState([]);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';


  const fetchTasks = useCallback(() => {
    // Obtener las tareas asignadas al usuario en el proyecto
    axios
      .get(`${API_URL}/api/projects/${projectId}/tasks`)
      .then((response) => {
        let tasksData = response.data;

        const userIdToNameMap = {};
        users.forEach((user) => {
            userIdToNameMap[user.user_id] = user.username;
        });

        tasksData.forEach((task) => {
            
            task.assigned_users_names = task.assigned_users.map(
              (userId) => userIdToNameMap[userId]
            );
          });


        if (userRole !== 'ADMIN') {
            // Filtrar las tareas asignadas al usuario actual si no es ADMIN
            tasksData  = tasksData.filter((task) =>
                task.assigned_users.includes(user.user_id)
            );
        }

        setTasks(tasksData);
      })
      .catch((error) => {
        console.error('Error al obtener tareas del proyecto', error);
      });
  }, [API_URL, projectId, user.user_id, userRole, users]);

  const fetchEpics = useCallback(() => {
    // Obtener las épicas del proyecto
    axios
      .get(`${API_URL}/api/projects/${projectId}/epics`)
      .then((response) => {
        setEpics(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener las épicas del proyecto', error);
      });
  }, [API_URL, projectId]);

  const fetchTaskStates = useCallback(() => {
    axios
      .get(`${API_URL}/api/task-states`)
      .then((response) => {
        // Ordenamos los estados según 'state_order' si es necesario
        const sortedStates = response.data.sort((a, b) => a.state_order - b.state_order);
        setTaskStates(sortedStates);
        // Crear el mapeo state_name -> state_id
        const mapping = {};
        sortedStates.forEach((state) => {
            mapping[state.state_name] = state.state_id;
        });
        setStateNameToIdMap(mapping);
      })
      .catch((error) => {
        console.error('Error al obtener los estados de las tareas', error);
      });
  }, [API_URL]);

  const organizeTasksByState = useCallback((tasks) => {
    const tasksByStateTemp = {};
    taskStates.forEach((state) => {
        tasksByStateTemp[state.state_name] = [];
    });

    tasks.forEach((task) => {
        if (tasksByStateTemp[task.state_name]) {
        tasksByStateTemp[task.state_name].push(task);
        } else {
        // Si el estado no está en taskStates, lo añadimos
        tasksByStateTemp[task.state_name] = [task];
        }
    });
    setTasksByState(tasksByStateTemp);

  }, [taskStates]);

  const fetchUsers = useCallback(() => {
    axios
      .get(`${API_URL}/api/users`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener la lista de usuarios', error);
      });
  }, [API_URL]);


  useEffect(() => {
    fetchTasks();
    fetchEpics();
    fetchUsers();
    fetchTaskStates();
  }, [fetchTasks, fetchEpics, fetchTaskStates, fetchUsers]);

  useEffect(() => {
    if (tasks.length > 0 && taskStates.length > 0) {
      organizeTasksByState(tasks);
    }
  }, [tasks, taskStates, organizeTasksByState]);



  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
  
    // Si no hay destino, no hacemos nada
    if (!destination) return;
  
    // Si el destino es el mismo que el origen, no hacemos nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
  
    // Actualizamos el estado de la tarea en el backend
    const taskId = draggableId;
    const newStateName = destination.droppableId;
    const newStateId = stateNameToIdMap[newStateName];

    if (!newStateId) {
        console.error('No se encontró el ID para el estado:', newStateName);
        return;
    }
  
    axios
      .put(`${API_URL}/api/tasks/${taskId}/change-state/${newStateId}`)
      .then(() => {
        // Actualizamos las tareas localmente
        fetchTasks();
      })
      .catch((error) => {
        console.error('Error al cambiar el estado de la tarea', error);
      });
  };
  

  // Funciones para crear tarea
  const handleCreateTask = () => {
    setShowCreateTaskForm(true);
  };

  const handleCancelCreateTask = () => {
    setShowCreateTaskForm(false);
    setNewTaskData({
      task_title: '',
      task_description: '',
      due_date: '',
      epic_id: null,
    });
  };

  const handleChange = (e) => {
    setNewTaskData({
      ...newTaskData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeAssignedUsers = (e) => {
    const options = e.target.options;
    const selectedUsers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedUsers.push(parseInt(options[i].value));
      }
    }
    setNewTaskData({
      ...newTaskData,
      assigned_users: selectedUsers,
    });
  };

  const handleChangeEditAssignedUsers = (e) => {
    const options = e.target.options;
    const selectedUsers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedUsers.push(parseInt(options[i].value));
      }
    }
    setEditTaskData({
      ...editTaskData,
      assigned_users: selectedUsers,
    });
  };
  

  const handleSubmitNewTask = (e) => {
    e.preventDefault();

    // Crear una nueva tarea asociada al proyecto actual
    axios
      .post(`${API_URL}/api/tasks/project/${projectId}`, {
        ...newTaskData,
        due_date: newTaskData.due_date || null,
        epic_id: newTaskData.epic_id || null,
      })
      .then((response) => {
        // Asignar la tarea al usuario actual
        const taskId = response.data.task_id;

        let assignedUsers = [];
        if (userRole === 'ADMIN' && newTaskData.assigned_users) {
            assignedUsers = newTaskData.assigned_users;
        } else {
            assignedUsers = [user.user_id];
        }

        const assignPromises = assignedUsers.map((userId) => {
            return axios.post(`${API_URL}/api/tasks/${taskId}/assign/${userId}`);
          });
    
        Promise.all(assignPromises)
        .then(() => {
            fetchTasks();
            handleCancelCreateTask();
        })
        .catch((error) => {
            console.error('Error al asignar la tarea', error);
        });

      })
      .catch((error) => {
        console.error('Error al crear la tarea', error);
      });
  };

  // Funciones para editar tarea
  const handleEditTask = (task) => {
    setEditTaskData(task);
    setShowEditTaskForm(true);
  };

  const handleCancelEditTask = () => {
    setShowEditTaskForm(false);
    setEditTaskData(null);
  };

  const handleChangeEdit = (e) => {
    setEditTaskData({
      ...editTaskData,
      [e.target.name]: e.target.value,
    });
  };

  const confirmDeleteTask = (taskId) => {
    axios
    .delete(`${API_URL}/api/tasks/${taskToDelete.task_id}`)
    .then(() => {
        fetchTasks();
        cancelDeleteTask();
    })
    .catch((error) => {
        console.error('Error al eliminar la tarea', error);
    });
    
  };
  
  const cancelDeleteTask = () => {
    setTaskToDelete(null);
  };

  const handleSubmitEditTask = (e) => {
    e.preventDefault();

    // Actualizar la tarea
    axios
      .put(`${API_URL}/api/tasks/${editTaskData.task_id}`, {
        task_title: editTaskData.task_title,
        task_description: editTaskData.task_description,
        due_date: editTaskData.due_date || null,
        epic_id: editTaskData.epic_id || null,
      })
      .then((response) => {
        if (userRole === 'ADMIN' && editTaskData.assigned_users) {
            const taskId = editTaskData.task_id;
    
            // Primero, desasignamos todos los usuarios actuales
            axios
              .delete(`${API_URL}/api/tasks/${taskId}/unassign-all`)
              .then(() => {
                // Asignamos los nuevos usuarios seleccionados haciendo múltiples llamadas
                const assignPromises = editTaskData.assigned_users.map((userId) => {
                  return axios.post(`${API_URL}/api/tasks/${taskId}/assign/${userId}`);
                });
    
                Promise.all(assignPromises)
                  .then(() => {
                    fetchTasks();
                    handleCancelEditTask();
                  })
                  .catch((error) => {
                    console.error('Error al asignar los usuarios a la tarea', error);
                  });
              })
              .catch((error) => {
                console.error('Error al desasignar usuarios de la tarea', error);
              });
          } else {
            fetchTasks();
            handleCancelEditTask();
          }
      })
      .catch((error) => {
        console.error('Error al actualizar la tarea', error);
      });
  };

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
  };

  return (
    <div style={styles.container}>
        <h2>
            {userRole === 'ADMIN'
                ? 'Tablero de Todas las tareas del Proyecto'
                : 'Tus Tareas en el Proyecto'}
        </h2>

      <button onClick={handleCreateTask} style={styles.button}>
        Crear Nueva Tarea
      </button>
  
      {/* Modal para crear tarea */}
      {showCreateTaskForm && (
        <>
          <div style={styles.overlay} onClick={handleCancelCreateTask}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitNewTask} style={styles.form}>
              <h3>Crear Nueva Tarea</h3>
              {/* Campos del formulario */}
              <div style={styles.inputGroup}>
                <label htmlFor="task_title">Título de la Tarea:</label>
                <input
                  type="text"
                  name="task_title"
                  id="task_title"
                  value={newTaskData.task_title}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="task_description">Descripción:</label>
                <textarea
                  name="task_description"
                  id="task_description"
                  value={newTaskData.task_description}
                  onChange={handleChange}
                  required
                  style={styles.textarea}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="due_date">Fecha Límite:</label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={newTaskData.due_date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="epic_id">Épica:</label>
                <select
                  name="epic_id"
                  id="epic_id"
                  value={newTaskData.epic_id || ''}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Selecciona una épica (opcional)</option>
                  {epics.map((epic) => (
                    <option key={epic.epic_id} value={epic.epic_id}>
                      {epic.epic_name}
                    </option>
                  ))}
                </select>
              </div>
              {userRole === 'ADMIN' && (
                <div style={styles.inputGroup}>
                    <label htmlFor="assigned_users">Asignar a:</label>
                    <select
                    name="assigned_users"
                    id="assigned_users"
                    value={newTaskData.assigned_users || []}
                    onChange={handleChangeAssignedUsers}
                    multiple
                    style={styles.input}
                    >
                    {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                        {user.name} ({user.username})
                        </option>
                    ))}
                    </select>
                </div>
                )}

              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={handleCancelCreateTask} style={styles.button}>
                  Cancelar
                </button>
                <button type="submit" style={styles.button}>
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </>
      )}
  
      {/* Modal para editar tarea */}
      {showEditTaskForm && editTaskData && (
        <>
          <div style={styles.overlay} onClick={handleCancelEditTask}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitEditTask} style={styles.form}>
              <h3>Editar Tarea</h3>
              {/* Campos del formulario */}
              <div style={styles.inputGroup}>
                <label htmlFor="edit_task_title">Título de la Tarea:</label>
                <input
                  type="text"
                  name="task_title"
                  id="edit_task_title"
                  value={editTaskData.task_title}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_task_description">Descripción:</label>
                <textarea
                  name="task_description"
                  id="edit_task_description"
                  value={editTaskData.task_description}
                  onChange={handleChangeEdit}
                  required
                  style={styles.textarea}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_due_date">Fecha Límite:</label>
                <input
                  type="date"
                  name="due_date"
                  id="edit_due_date"
                  value={
                    editTaskData.due_date
                      ? new Date(editTaskData.due_date).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleChangeEdit}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_epic_id">Épica:</label>
                <select
                  name="epic_id"
                  id="edit_epic_id"
                  value={editTaskData.epic_id || ''}
                  onChange={handleChangeEdit}
                  style={styles.input}
                >
                  <option value="">Selecciona una épica (opcional)</option>
                  {epics.map((epic) => (
                    <option key={epic.epic_id} value={epic.epic_id}>
                      {epic.epic_name}
                    </option>
                  ))}
                </select>
              </div>
              {userRole === 'ADMIN' && (
                <div style={styles.inputGroup}>
                    <label htmlFor="edit_assigned_users">Asignar a:</label>
                    <select
                    name="assigned_users"
                    id="edit_assigned_users"
                    value={editTaskData.assigned_users || []}
                    onChange={handleChangeEditAssignedUsers}
                    multiple
                    style={styles.input}
                    >
                    {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                        {user.name} ({user.username})
                        </option>
                    ))}
                    </select>
                </div>
                )}


              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={handleCancelEditTask} style={styles.button}>
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

      {/* Drag and Drop Context */}
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={styles.board}>
        {taskStates.map((state) => (
      <Droppable droppableId={state.state_name} key={state.state_name}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={styles.column}
              >
                <h3>{state.state_name}</h3>
                  {tasksByState[state.state_name] &&
                    tasksByState[state.state_name].map((task, index) => (
                      <Draggable
                        key={task.task_id}
                        draggableId={task.task_id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...styles.card,
                              ...provided.draggableProps.style,
                            }}
                          >
                            <h4>{task.task_title}</h4>
                            <p>{task.task_description}</p>
                            <p>
                              <strong>Épica:</strong> {task.epic_name || 'Sin épica'}
                            </p>
                            <p>
                            <strong>Asignada a:</strong>{' '}
                              {task.assigned_users_names
                                ? task.assigned_users_names.join(', ')
                                : 'Sin asignar'}
                            </p>
                            <p>
                              <strong>Fecha Límite:</strong>{' '}
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'Sin fecha límite'}
                            </p>
                            <button
                              onClick={() => handleEditTask(task)}
                              style={styles.button}
                            >
                              Editar
                            </button>
                            {userRole === 'ADMIN' && (
                            <button
                            onClick={() => handleDeleteTask(task)}
                            style={styles.deleteButton}
                          >
                            Eliminar
                          </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>

        {/* Modal de confirmación de eliminación*/} 
        {taskToDelete && (
        <>
            <div style={styles.overlay} onClick={cancelDeleteTask}></div>
            <div style={styles.modal}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar esta tarea?</p>
            <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={cancelDeleteTask} style={styles.button}>
                Cancelar
                </button>
                <button type="button" onClick={confirmDeleteTask} style={styles.deleteButton}>
                Eliminar
                </button>
            </div>
            </div>
        </>
        )}

      <Link to="/dashboard" style={styles.link}>
        Volver al Dashboard
      </Link>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  button: {
    margin: '10px 5px',
    padding: '10px',
  },
  form: {
    // Puedes agregar estilos adicionales aquí si lo deseas
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
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  link: {
    display: 'block',
    marginTop: '20px',
    textDecoration: 'none',
    color: 'blue',
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
  board: {
    display: 'flex',
    alignItems: 'flex-start',
    overflowX: 'auto',
  },
  column: {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    margin: '10px',
    minWidth: '250px',
    borderRadius: '5px',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  deleteButton: {
    padding: '10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    marginLeft: '5px',
  },
};

export default ProjectTasks;
