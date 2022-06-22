const { response } = require('express');
const { Marca } = require('../../models');


const getAll = async(req, res = response) => {

    const { limite = 10, desde = 0, paginado = true } = req.query;

    if (paginado == true) {

        const [total, data] = await Promise.all([
            Marca.countDocuments(),
            Marca.find()
            .skip(Number(desde))
            .limit(Number(limite))
        ]);

        res.json({
            total,
            data
        });
    } else {
        const data = await Marca.find();
        res.json(
            data
        );
    }
};

const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Marca.findById(id);

    res.json(modelDB);

};

const add = async(req, res = response) => {

    const descripcion = req.body.descripcion.toUpperCase();

    const modelDB = await Marca.findOne({ descripcion });

    if (modelDB) {
        return res.status(400).json({
            msg: `La marca ${ modelDB.descripcion }, ya existe`
        });
    }
    const data = {
        descripcion,

    };

    const newModel = new Marca(data);

    // Guardar DB
    await newModel.save();

    res.json(newModel);

};

const update = async(req, res = response) => {

    const { id } = req.params;
    const { estado, ...data } = req.body;


    data.descripcion = data.descripcion.toUpperCase();
    //  data.usuario = req.usuario._id;

    const newModel = await Marca.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);

};


module.exports = {
    add,
    getAll,
    getById,
    update,
};