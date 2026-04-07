import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Usuarios
export const getUsuarios = () => api.get('/usuarios');
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);

// Dispositivos
export const getDispositivos = () => api.get('/dispositivos');
export const getDispositivo = (id) => api.get(`/dispositivos/${id}`);
export const createDispositivo = (data) => {
    return axios.post(`${API_URL}/dispositivos`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
export const updateDispositivo = (id, data) => api.put(`/dispositivos/${id}`, data);
export const deleteDispositivo = (id) => api.delete(`/dispositivos/${id}`);

// Salidas
export const getSalidas = () => api.get('/salidas');
export const createSalida = (data) => api.post('/salidas', data);
export const deleteSalida = (id) => api.delete(`/salidas/${id}`);
// Buscar dispositivo por serial
export const getDispositivoBySerial = (serial) => 
  api.get(`/dispositivos/serial/${serial}`);

// Prestamos
export const getPrestamos = () => api.get('/prestamos');
export const getPrestamo = (id) => api.get(`/prestamos/${id}`);
export const createPrestamo = (data) => api.post('/prestamos', data);
export const updatePrestamo = (id, data) => api.put(`/prestamos/${id}`, data);
export const deletePrestamo = (id) => api.delete(`/prestamos/${id}`);

// Mantenimiento
export const getMantenimientos = () => api.get('/mantenimiento');
export const getMantenimiento = (id) => api.get(`/mantenimiento/${id}`);
export const createMantenimiento = (data) => api.post('/mantenimiento', data);
export const updateMantenimiento = (id, data) => api.put(`/mantenimiento/${id}`, data);
export const deleteMantenimiento = (id) => api.delete(`/mantenimiento/${id}`);

export const getCorreos = () => api.get('/correo');

export default api;
