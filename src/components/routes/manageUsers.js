// src/ManageUsers.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    name: '',
    role: 'USER', // Valor predeterminado
    password_hash: '',
  });
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user.role;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';


  const fetchUsers = useCallback(() => {
    axios
      .get(`${API_URL}/api/users`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los usuarios', error);
      });
  }, [API_URL]);

  useEffect(() => {
    if (userRole !== 'ADMIN') {
      // Si el usuario no es ADMIN, lo redirigimos al dashboard
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [userRole, navigate, fetchUsers]);

  const handleChange = (e) => {
    setNewUserData({
      ...newUserData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitNewUser = (e) => {
    e.preventDefault();

    axios
      .post(`${API_URL}/api/users/register`, newUserData)
      .then(() => {
        fetchUsers();
        setNewUserData({
          username: '',
          email: '',
          name: '',
          role: 'USER',
          password_hash: '',
        });
        setShowCreateUserForm(false);
      })
      .catch((error) => {
        console.error('Error al crear el usuario', error);
      });
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
  };

  const confirmDeleteUser = () => {
    axios
      .delete(`${API_URL}/api/users/${userToDelete}`)
      .then(() => {
        fetchUsers();
        setUserToDelete(null);
      })
      .catch((error) => {
        console.error('Error al eliminar el usuario', error);
      });
  };

  const cancelDeleteUser = () => {
    setUserToDelete(null);
  };

  const handleEditUser = (user) => {
    setEditUserData(user);
  };

  const handleChangeEdit = (e) => {
    setEditUserData({
      ...editUserData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEditUser = (e) => {
    e.preventDefault();

    axios
      .put(`${API_URL}/api/users/${editUserData.user_id}`, editUserData)
      .then(() => {
        fetchUsers();
        setEditUserData(null);
      })
      .catch((error) => {
        console.error('Error al actualizar el usuario', error);
      });
  };

  const handleCancelEditUser = () => {
    setEditUserData(null);
  };

  const handleCancelCreateUser = () => {
    setShowCreateUserForm(false);
    setNewUserData({
      username: '',
      email: '',
      name: '',
      role: 'USER',
      password_hash: '',
    });
  };

  return (
    <div style={styles.container}>
      <h2>Gestionar Usuarios</h2>
      <button onClick={() => setShowCreateUserForm(true)} style={styles.button}>
        Crear Nuevo Usuario
      </button>

      {showCreateUserForm && (
        <>
          <div style={styles.overlay} onClick={handleCancelCreateUser}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitNewUser} style={styles.form}>
              <h3>Crear Nuevo Usuario</h3>
              <div style={styles.inputGroup}>
                <label htmlFor="username">Nombre de Usuario:</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={newUserData.username}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="email">Correo Electrónico:</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={newUserData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="name">Nombre Completo:</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newUserData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="role">Rol:</label>
                <select
                  name="role"
                  id="role"
                  value={newUserData.role}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="password_hash">Contraseña:</label>
                <input
                  type="password"
                  name="password_hash"
                  id="password_hash"
                  value={newUserData.password_hash}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={handleCancelCreateUser} style={styles.button}>
                  Cancelar
                </button>
                <button type="submit" style={styles.button}>
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <h3>Lista de Usuarios</h3>
      {users.length === 0 ? (
        <p>No hay usuarios disponibles.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre Completo</th>
              <th style={styles.th}>Nombre de Usuario</th>
              <th style={styles.th}>Correo Electrónico</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem.user_id}>
                <td style={styles.td}>{userItem.name}</td>
                <td style={styles.td}>{userItem.username}</td>
                <td style={styles.td}>{userItem.email}</td>
                <td style={styles.td}>{userItem.role}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEditUser(userItem)}
                    style={styles.button}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(userItem.user_id)}
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

      {editUserData && (
        <>
          <div style={styles.overlay} onClick={handleCancelEditUser}></div>
          <div style={styles.modal}>
            <form onSubmit={handleSubmitEditUser} style={styles.form}>
              <h3>Editar Usuario</h3>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_username">Nombre de Usuario:</label>
                <input
                  type="text"
                  name="username"
                  id="edit_username"
                  value={editUserData.username}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_email">Correo Electrónico:</label>
                <input
                  type="email"
                  name="email"
                  id="edit_email"
                  value={editUserData.email}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_name">Nombre Completo:</label>
                <input
                  type="text"
                  name="name"
                  id="edit_name"
                  value={editUserData.name}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="edit_role">Rol:</label>
                <select
                  name="role"
                  id="edit_role"
                  value={editUserData.role}
                  onChange={handleChangeEdit}
                  required
                  style={styles.input}
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              {/* Opcional: Permitir cambiar la contraseña */}
              <div style={styles.inputGroup}>
                <label htmlFor="edit_password_hash">Contraseña (opcional):</label>
                <input
                  type="password"
                  name="password_hash"
                  id="edit_password_hash"
                  value={editUserData.password_hash || ''}
                  onChange={handleChangeEdit}
                  style={styles.input}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={handleCancelEditUser}
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

      {userToDelete && (
        <>
          <div style={styles.overlay} onClick={cancelDeleteUser}></div>
          <div style={styles.modal}>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={cancelDeleteUser} style={styles.button}>
                Cancelar
              </button>
              <button type="button" onClick={confirmDeleteUser} style={styles.deleteButton}>
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
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
};

export default ManageUsers;