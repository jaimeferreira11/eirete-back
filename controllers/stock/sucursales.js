const { response } = require('express');
const ObjectId = require('mongoose').Types.ObjectId;

const { Sucursal, Articulo, ArticuloSucursal } = require('../../models');
const sucursal = require('../../models/stock/sucursal');
const { createArticuloSucursal } = require('./stock-sucursal');

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    estado = true,
    search,
  } = req.query;

  let query = { estado };

  if (search)
    query.descripcion = { $regex: '.*' + search + '.*', $options: 'i' };

  if (paginado === 'true') {
    const [total, data] = await Promise.all([
      Sucursal.countDocuments(query),
      Sucursal.find(query)
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username')
        .populate(
          'articulos',
          '-__v -fechaAlta -usuarioAlta -fechaModif -usuarioModif'
        )
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await Sucursal.find(query)
      .populate('usuarioAlta', 'username')
      .populate('usuarioModif', 'username')
      .populate(
        'articulos',
        '-__v -fechaAlta -usuarioAlta -fechaModif -usuarioModif'
      );
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Sucursal.findById(id)
    .populate('usuarioAlta', 'username')
    .populate('usuarioModif', 'username');

  res.json(modelDB);
};

const add = async (req, res = response) => {
  try {
    const { _id } = req.body;
    if (_id) {
      const modelDB = await Sucursal.findById(_id);
      if (modelDB) {
        return res.status(400).json({
          msg: `La sucursal ${modelDB.descripcion}, ya existe`,
        });
      }
    }

    req.body.descripcion = req.body.descripcion.toUpperCase();
    if (await Sucursal.findOne({ descripcion: req.body.descripcion })) {
      return res.status(400).json({
        msg: `La sucursal  ${req.body.descripcion}, ya existe`,
      });
    }

    // punto de expedicion
    if (await Sucursal.findOne({ establecimiento: req.body.establecimiento })) {
      return res.status(400).json({
        msg: `El establecimiento ${req.body.establecimiento}, ya está registrado`,
      });
    }

    const sucursalData = {
      usuarioAlta: req.usuario._id,
      ...req.body,
    };

    const newModel = new Sucursal(sucursalData);

    // Guardar DB
    await newModel.save();

    //
    // cuando se crea una sucursal, se crea articulo-sucursal con los articulos existentes
    await createArticuloSucursal(newModel._id, req.usuario._id);

    res.json(newModel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { _id, estado, usuarioAlta, fechaAlta, nroActual, articulos, ...data } =
    req.body;

  // punto de expedicion
  const model = await Sucursal.findOne({
    establecimiento: req.body.establecimiento,
  });
  if (model && model._id != id) {
    return res.status(400).json({
      msg: `El establecimiento ${req.body.establecimiento}, ya está registrado en la sucursal ${model.descripcion}`,
    });
  }

  data.descripcion = data.descripcion.toUpperCase();
  data.usuarioModif = req.usuario._id;

  data.fechaModif = Date.now();

  const newModel = await Sucursal.findByIdAndUpdate(id, data, { new: true });

  res.json(newModel);
};

const inactivate = async (req, res = response) => {
  const { id } = req.params;
  const modelBorrado = await Sucursal.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json(modelBorrado);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Sucursal.findByIdAndUpdate(
    id,
    { estado: status },
    { new: true }
  );

  res.json(modelBorrado);
};

const aumentarNroFactura = async (id) => {
  let sucursalDB = await Sucursal.findById(id);

  sucursalDB.nroActual = sucursalDB.nroActual + 1;

  await Sucursal.findByIdAndUpdate(id, sucursalDB);
};

module.exports = {
  add,
  getAll,
  getById,
  update,
  inactivate,
  changeStatus,
  aumentarNroFactura,
};
