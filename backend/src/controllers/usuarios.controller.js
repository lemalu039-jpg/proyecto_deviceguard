const UsuarioModel = require('../models/usuarios.model');

exports.getAll = async (req, res) => {
    try {
        const usuarios = await UsuarioModel.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const usuario = await UsuarioModel.findById(req.params.id);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const insertId = await UsuarioModel.create(req.body);
        res.status(201).json({ id: insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affectedRows = await UsuarioModel.update(req.params.id, req.body);
        if (affectedRows > 0) {
            res.json({ message: 'Usuario actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affectedRows = await UsuarioModel.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Usuario eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        const usuario = await UsuarioModel.findByEmail(correo);

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Comparación simple de contraseña (en producción usar bcrypt)
        if (usuario.contrasena !== contrasena) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // No enviar la contraseña en la respuesta
        const { contrasena: _, ...usuarioSinContrasena } = usuario;

        res.json({
            message: 'Login exitoso',
            usuario: usuarioSinContrasena
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.cambiarCorreo = async (req, res) => {
    try {

        const { id, correo } = req.body;

        const affectedRows = await UsuarioModel.update(id, {
            nombre: "",
            correo: correo,
            rol: "usuario"
        });

        if (affectedRows > 0) {
            res.json({ message: "Correo actualizado correctamente" });
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

