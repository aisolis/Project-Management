import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [message, setMessage] = useState('');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';


    // Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Maneja el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Realiza la solicitud POST al endpoint de autenticación
            const response = await axios.post(`${API_URL}/api/auth/login`, formData);

            // Maneja la respuesta exitosa
            setMessage(response.data.message);

            // Puedes guardar la información del usuario en el estado o en el almacenamiento local si es necesario
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');

        } catch (error) {
            // Maneja errores de autenticación
            if (error.response && error.response.status === 401) {
                setMessage('Credenciales inválidas');
            } else {
                setMessage('Error al iniciar sesión');
            }
        }
    };

    return (
        <div style={styles.container}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="username">Nombre de Usuario:</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Ingresar</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '300px',
        margin: '50px auto',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
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
    button: {
        padding: '10px',
    },
    message: {
        marginTop: '20px',
        color: 'red',
    },
};

export default Login;
