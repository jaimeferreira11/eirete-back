const { response } = require("express");
const { Sucursal } = require("../../models");

const getAll = async (req, res = response) => {
  const { limite = 10, desde = 0, paginado = true, estado = true } = req.query;
  const query = { estado };

  console.log(paginado);
  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Sucursal.countDocuments(query),
      Sucursal.find(query)
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await Sucursal.find(query)
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Sucursal.findById(id)
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

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
    const sucursalData = {
      ...req.body,
      usuarioAlta: req.usuario._id,
    };

    const newModel = new Sucursal(sucursalData);

    // Guardar DB
    await newModel.save();

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
  const { estado, usuarioAlta, fechaAlta, nroActual, ...data } = req.body;

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

const activate = async (req, res = response) => {
  const { id } = req.params;
  const modelBorrado = await Sucursal.findByIdAndUpdate(
    id,
    { estado: true },
    { new: true }
  );

  res.json(modelBorrado);
};

const aumentarNroFactura = async (id) => {
  let sucursalDB = await Sucursal.findById(id);

  sucursalDB.nroActual = sucursalDB.nroActual + 1;

  await Presupuesto.findByIdAndUpdate(id, sucursalDB);
};

module.exports = {
  add,
  getAll,
  getById,
  update,
  inactivate,
  activate,
  aumentarNroFactura,
};
