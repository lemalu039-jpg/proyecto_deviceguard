import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: agrega automáticamente el id del usuario logueado en cada petición
api.interceptors.request.use(config => {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.id) {
            config.headers['x-usuario-id'] = usuario.id;
        }
    } catch (_) {}
    return config;
});

// También para las peticiones multipart (createDispositivo usa axios directo)
const apiMultipart = axios.create({ baseURL: API_URL });
apiMultipart.interceptors.request.use(config => {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.id) config.headers['x-usuario-id'] = usuario.id;
    } catch (_) {}
    return config;
});

// Usuarios
export const getUsuarios = () => api.get('/usuarios');
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
export const toggleUsuarioStatus = (id, activo) => api.put(`/usuarios/${id}/status`, { activo });

// Dispositivos
export const getDispositivos = () => api.get('/dispositivos');
export const getDispositivo = (id) => api.get(`/dispositivos/${id}`);
export const createDispositivo = (data) => {
    return apiMultipart.post('/dispositivos', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

// Correos externos
export const getCorreos = () => api.get('/correo');
export const enviarCorreo = (data) => api.post('/correo/enviar', data);

// Mensajería interna
export const getMensajesContactos = (userId) => api.get(`/correo/mensajes/contactos/${userId}`);
export const getConversacion = (userId, contactId) => api.get(`/correo/mensajes/conversacion/${userId}/${contactId}`);
export const enviarMensaje = (data) => api.post('/correo/mensajes', data);

// Historial
export const getHistorial = (dispositivoId) => api.get(`/historial/${dispositivoId}`);
export const createObservacion = (dispositivoId, data) => api.post(`/historial/${dispositivoId}`, data);

export default api;
