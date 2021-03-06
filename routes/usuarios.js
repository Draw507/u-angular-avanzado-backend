var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ============================================
// Obtener todos los usuarios
// ============================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(15)
        .exec(
            (error, usuarios) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: error
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    response.status(200).json({
                        ok: true,
                        usuarios,
                        total: conteo
                    });
                })
            });
});


// ============================================
// Crear un nuevo usuario
// ============================================

app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: error
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});

// ============================================
// Actualizar usuario
// ============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: error
            });
        }

        var body = req.body;

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '******';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});

// ============================================
// Borrar un usuario por el id
// ============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;