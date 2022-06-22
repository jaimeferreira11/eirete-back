const { response } = require('express');
const { Menu } = require('../../models');


const getAll = async(req, res = response) => {

    const { limite = 10, desde = 0 } = req.query;

    const [total, data] = await Promise.all([
        Menu.countDocuments(),
        Menu.find()
        .populate('programas', '-__v')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({
        total,
        data
    });
};

const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Menu.findById(id);
    // .populate('usuario', 'nombre');

    res.json(modelDB);

};

const add = async(req, res = response) => {

    const { id } = req.body;
    if (id) {
        const modelDB = await Menu.findById(id);
        if (modelDB) {
            return res.status(400).json({
                msg: `El Menu ${ modelDB.descripcion }, ya existe`
            });
        }

    }
    // Generar la data a guardar
    req.body._id = null;
    const menu = new Menu(req.body);

    // Guardar DB
    await Menu.save();

    res.json(Menu);

};

const update = async(req, res = response) => {

    const { id } = req.params;
    const { estado, ...data } = req.body;

    //  data.usuario = req.usuario._id;

    const newModel = await Menu.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);

};

const inactivate = async(req, res = response) => {

    const { id } = req.params;
    const modelBorrado = await Menu.findByIdAndUpdate(id, { estado: false }, { new: true });

    res.json(modelBorrado);
};




module.exports = {
    add,
    getAll,
    getById,
    update,
    inactivate
};