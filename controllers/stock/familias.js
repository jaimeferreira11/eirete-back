const { response } = require('express');
const { Familia } = require('../../models');


const getAll = async(req, res = response) => {

    const { limite = 10, desde = 0, paginado = true } = req.query;
    const query = { estado: true };

    if (paginado == true) {

        const [total, data] = await Promise.all([
            Familia.countDocuments(query),
            Familia.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
        ]);

        res.json({
            total,
            data
        });
    } else {
        const data = await Familia.find();
        res.json(
            data
        );
    }
};

const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Familia.findById(id);

    res.json(modelDB);

};

const add = async(req, res = response) => {

    const descripcion = req.body.descripcion.toUpperCase();

    const modelDB = await Familia.findOne({ descripcion });

    if (modelDB) {
        return res.status(400).json({
            msg: `La Familia ${ modelDB.descripcion }, ya existe`
        });
    }
    const data = {
        descripcion,

    };

    const newModel = new Familia(data);

    // Guardar DB
    await newModel.save();

    res.json(newModel);

};

const update = async(req, res = response) => {

    const { id } = req.params;
    const { estado, ...data } = req.body;

    data.descripcion = data.descripcion.toUpperCase();
    //  data.usuario = req.usuario._id;

    const newModel = await Familia.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);

};

const inactivate = async(req, res = response) => {

    const { id } = req.params;
    const modelBorrado = await Familia.findByIdAndUpdate(id, { estado: false }, { new: true });

    res.json(modelBorrado);
};


module.exports = {
    add,
    getAll,
    getById,
    update,
    inactivate
};