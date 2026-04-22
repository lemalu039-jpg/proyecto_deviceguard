const UsuarioModel = require('../models/usuarios.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

        if (usuario.contrasena !== contrasena) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

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

        
        const usuario = await UsuarioModel.findById(id);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

      
        const affectedRows = await UsuarioModel.update(id, {
            nombre: usuario.nombre,
            correo: correo,
            rol: usuario.rol
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


exports.registro = async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol } = req.body;

     
        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
        }

        
        const usuarioExistente = await UsuarioModel.findByEmail(correo);
        if (usuarioExistente) {
            return res.status(409).json({ error: 'Este correo ya está registrado' });
        }

       
        const insertId = await UsuarioModel.create({
            nombre,
            correo,
            contrasena,
            rol: rol || 'usuario'
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            id: insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
    exports.cambiarContrasena = async (req, res) => {
    try {

        const { id, contrasena } = req.body;

        if (!id || !contrasena) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        const affectedRows = await UsuarioModel.cambiarContrasena(id, contrasena);

        if (affectedRows > 0) {
            res.json({ message: "Contraseña actualizada correctamente" });
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.solicitarRecuperacion = async (req, res) => {
    try {
        const { correo } = req.body;
        if (!correo) return res.status(400).json({ error: 'El correo es requerido' });

        const usuario = await UsuarioModel.findByEmail(correo);
        if (!usuario) {
            // Se responde éxito igual por seguridad (evitar enumeración de correos)
            return res.json({ message: 'Si el correo existe, se han enviado las instrucciones.' });
        }

        // Generar token y fecha de expiración (1 hora)
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora
        
        // Formatear la fecha para MySQL DATETIME: YYYY-MM-DD HH:MM:SS
        const expiresFormatted = expires.toISOString().slice(0, 19).replace('T', ' ');

        await UsuarioModel.guardarTokenRecuperacion(usuario.id, token, expiresFormatted);

        // Configurar nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Enlazar al frontend (el frontend corre en puerto 5173 usualmente)
        const resetLink = `http://localhost:5173/login?token=${token}`;

        await transporter.sendMail({
            from: `"DeviceGuard Soporte" <${process.env.EMAIL_USER}>`,
            to: usuario.correo,
            subject: 'Recuperación de Contraseña - DeviceGuard',
            html: `
                <h2>Recuperación de contraseña</h2>
                <p>Hola ${usuario.nombre},</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
                <a href="${resetLink}" style="padding: 10px 15px; background: #0A1172; color: #fff; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no fuiste tú, ignora este correo.</p>
            `
        });

        res.json({ message: 'Si el correo existe, se han enviado las instrucciones.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

exports.restablecerContrasena = async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;
        if (!token || !nuevaContrasena) {
            return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
        }

        const usuario = await UsuarioModel.findByResetToken(token);
        if (!usuario) {
            return res.status(400).json({ error: 'El enlace de recuperación es inválido o ha expirado' });
        }

        // Actualizar la contraseña usando el método existente
        await UsuarioModel.cambiarContrasena(usuario.id, nuevaContrasena);
        
        // Limpiar el token para que no se pueda volver a usar
        await UsuarioModel.borrarTokenRecuperacion(usuario.id);

        res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
};
