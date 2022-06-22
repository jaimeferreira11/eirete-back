const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const { Usuario } = require('../../models');


const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Usuario.findById(id);

    if (!modelDB) {
        return res.status(404).json({
            msg: `No existe un usuario con el id ${ id }`
        });
    }

    res.json(modelDB);

};

const usuariosGet = async(req = request, res = response) => {

    const { limite = 10, desde = 0 } = req.query;
    const query = { estado: true };

    const [total, data] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
        .populate('perfiles', 'descripcion')
        .skip(Number(desde))
        .limit(Number(limite))

    ]);

    res.json({
        total,
        data
    });
};

const usuariosPost = async(req, res = response) => {

    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario(req.body);

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guardar en BD
    await usuario.save();

    res.json({
        usuario
    });
};

const usuariosPut = async(req, res = response) => {

    const { id } = req.params;
    const { _id, password, username, rol, ...resto } = req.body;

    if (password) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(password, salt);
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.json(usuario);
};


const usuariosDelete = async(req, res = response) => {

    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });


    res.json(usuario);
};




module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete,
    getById
};