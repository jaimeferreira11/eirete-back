const { response } = require('express');
const { LineaArticulo } = require('../../models');


const getAll = async(req, res = response) => {

    const { limite = 10, desde = 0, paginado = true } = req.query;
    const query = { estado: true };

    if (paginado == true) {

        const [total, data] = await Promise.all([
            LineaArticulo.countDocuments(query),
            LineaArticulo.find(query)
            .populate('familia', 'descripcion')
            .skip(Number(desde))
            .limit(Number(limite))
        ]);

        res.json({
            total,
            data
        });
    } else {
        const data = await LineaArticulo.find()
            .populate('familia', 'descripcion');
        res.json(
            data
        );
    }
};

const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await LineaArticulo.findById(id)
        .populate('familia', 'descripcion');

    res.json(modelDB);

};

const add = async(req, res = response) => {

    const descripcion = req.body.descripcion.toUpperCase();

    const modelDB = await LineaArticulo.findOne({ descripcion });

    if (modelDB) {
        return res.status(400).json({
            msg: `La LineaArticulo ${ modelDB.descripcion }, ya existe`
        });
    }
    req.body.descripcion = req.body.descripcion;


    const newModel = new LineaArticulo(req.body);

    // Guardar DB
    await newModel.save();

    res.json(newModel);

};

const update = async(req, res = response) => {

    const { id } = req.params;
    const { estado, ...data } = req.body;

    data.descripcion = data.descripcion.toUpperCase();
    //  data.usuario = req.usuario._id;

    const newModel = await LineaArticulo.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);

};

const inactivate = async(req, res = response) => {

    const { id } = req.params;
    const modelBorrado = await LineaArticulo.findByIdAndUpdate(id, { estado: false }, { new: true });

    res.json(modelBorrado);
};


module.exports = {
    add,
    getAll,
    getById,
    update,
    inactivate
};