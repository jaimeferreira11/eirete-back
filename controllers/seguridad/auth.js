const { response } = require('express');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const bcryptjs = require('bcryptjs');

const { Usuario, Perfil, Menu } = require('../../models');

const { generarJWT } = require('../../helpers/generar-jwt');
const { googleVerify } = require('../../helpers/google-verify');


const login = async(req, res = response) => {

    const { username, password } = req.body;
    console.log(`logueando ${username}`);

    try {


        // Verificar si el email existe
        let usuario = await Usuario.findOne({ username })
            .populate('perfiles', 'descripcion');

        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos '
            });
        }

        // SI el usuario está activo
        if (!usuario.estado) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        // Generar el JWT
        const token = await generarJWT(usuario.id);

        // Obtener los perfiles del usuario
        const menus = await Menu.find({
                perfil: new ObjectId(usuario.perfiles[0]._id),
            })
            .populate({
                // nombre del campo
                path: 'programas',
                // filtering field, you can use mongoDB syntax
                match: { estado: true },
                // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
                select: '-__v'
            })
            .sort({ 'orden': 1 });

        res.json({
            usuario,
            token,
            perfilActual: usuario.perfiles[0],
            menus,


        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

};


const googleSignin = async(req, res = response) => {

    const { id_token } = req.body;

    try {
        const { correo, nombre, img } = await googleVerify(id_token);

        let usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            // Tengo que crearlo
            const data = {
                nombre,
                correo,
                password: ':P',
                img,
                google: true
            };

            usuario = new Usuario(data);
            await usuario.save();
        }

        // Si el usuario en DB
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        // Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        });

    } catch (error) {

        res.status(400).json({
            msg: 'Token de Google no es válido'
        });

    }




};


const validarTokenUsuario = async(req, res = response) => {

    // Generar el JWT
    const token = await generarJWT(req.usuario._id);

    let usuario = await Usuario.findById(req.usuario._id)
        .populate('perfiles', 'descripcion');

    // Obtener los perfiles del usuario
    const menus = await Menu.find({
            perfil: new ObjectId(usuario.perfiles[0]._id),
        })
        .populate({
            // nombre del campo
            path: 'programas',
            // filtering field, you can use mongoDB syntax
            match: { estado: true },
            // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
            select: '-__v'
        })
        .sort({ 'orden': 1 });

    res.json({
        usuario: usuario,
        token: token,
        perfilActual: usuario.perfiles[0],
        menus,
    });

};

module.exports = {
    login,
    googleSignin,
    validarTokenUsuario
};