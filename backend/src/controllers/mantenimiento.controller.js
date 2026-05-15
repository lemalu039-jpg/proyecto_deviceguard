const MantenimientoModel = require('../models/mantenimiento.model');

exports.getAll = async (req, res) => {
    try {
        const mantenimiento = await MantenimientoModel.findAll();
        res.json(mantenimiento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const mtnto = await MantenimientoModel.findById(req.params.id);
        if (mtnto) {
            res.json(mtnto);
        } else {
            res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const tecnico_id = req.headers['x-usuario-id'] ? parseInt(req.headers['x-usuario-id']) : null;

        const data = {
            ...req.body,
            tecnico_id,
            estado_mantenimiento: 'En Proceso',
            fecha_inicio: new Date()
        };

        const insertId = await MantenimientoModel.create(data);

        res.status(201).json({ id: insertId, ...data });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { estado_mantenimiento } = req.body;

        let data = { ...req.body };

        // 🔥 Si se completa → cerrar mantenimiento
        if (estado_mantenimiento === 'Completado') {
            data.fecha_fin = new Date();
        }

        const affectedRows = await MantenimientoModel.update(req.params.id, data);

        if (affectedRows > 0) {
            res.json({ message: 'Mantenimiento actualizado exitosamente' });
        } else {
            res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Registrar costo del mantenimiento activo de un dispositivo
// Si no existe mantenimiento activo, lo crea automáticamente
exports.registrarCosto = async (req, res) => {
    try {
        const { dispositivo_id, costo } = req.body;
        const tecnico_id = req.headers['x-usuario-id'] ? parseInt(req.headers['x-usuario-id']) : null;

        console.log(`[registrarCosto] Iniciando... dispositivo_id=${dispositivo_id}, costo=${costo}, tecnico_id=${tecnico_id}`);

        if (!dispositivo_id || costo === undefined || costo === null) {
            console.log(`[registrarCosto] ❌ Falta dispositivo_id o costo`);
            return res.status(400).json({ error: 'dispositivo_id y costo son requeridos' });
        }

        const costoNum = parseFloat(costo);
        if (isNaN(costoNum) || costoNum < 0) {
            console.log(`[registrarCosto] ❌ Costo inválido: ${costo}`);
            return res.status(400).json({ error: 'El costo debe ser un número positivo' });
        }

        let mant = await MantenimientoModel.findActivoByDispositivo(dispositivo_id);
        console.log(`[registrarCosto] Búsqueda de mantenimiento activo: ${mant ? `Encontrado (id=${mant.id})` : 'NO encontrado'}`);

        // Si no existe mantenimiento activo, crear uno
        if (!mant) {
            console.log(`[registrarCosto] 🔧 Creando nuevo mantenimiento...`);
            const nuevoId = await MantenimientoModel.create({
                dispositivo_id,
                descripcion: 'Mantenimiento registrado en salida',
                costo: costoNum,
                estado_mantenimiento: 'En Proceso',
                tecnico_id,
                estado_pago: 'Pendiente',
                referencia_pago: null
            });

            mant = await MantenimientoModel.findById(nuevoId);
            console.log(`[registrarCosto] ✅ Mantenimiento CREADO: id=${nuevoId}, estado=${mant.estado_mantenimiento}, costo=${mant.costo}`);

            return res.status(201).json({
                message: 'Mantenimiento creado y costo registrado exitosamente',
                mantenimiento: mant,
                creado: true
            });
        }

        // Si existe, solo actualizar el costo
        console.log(`[registrarCosto] 📝 Actualizando mantenimiento existente (id=${mant.id})...`);
        await MantenimientoModel.update(mant.id, {
            descripcion:          mant.descripcion,
            costo:                costoNum,
            estado_mantenimiento: mant.estado_mantenimiento,
            tecnico_id:           mant.tecnico_id,
            estado_pago:          'Pendiente',
            referencia_pago:      mant.referencia_pago || `MANT-${mant.id}`
        });

        const actualizado = await MantenimientoModel.findById(mant.id);
        console.log(`[registrarCosto] ✅ Mantenimiento ACTUALIZADO: id=${mant.id}, costo=${actualizado.costo}`);

        res.json({
            message: 'Costo registrado exitosamente',
            mantenimiento: actualizado,
            creado: false
        });

    } catch (error) {
        console.error('[registrarCosto] ❌ ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affectedRows = await MantenimientoModel.delete(req.params.id);
        if (affectedRows > 0) {
            res.json({ message: 'Mantenimiento eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Mantenimiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
