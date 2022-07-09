const { response } = require("express");
const { ObjectId } = require("mongoose").Types;

const { Caja } = require("../../models");

const getAll = async (req, res = response) => {
  const { limite = 10, desde = 0, paginado = true, estado = true } = req.query;
  const query = { estado };

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Caja.countDocuments(query),
      Caja.find(query)
        .populate("sucursal", "descripcion")
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
    const data = await Caja.find(query)
      .populate("sucursal", "descripcion")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Caja.findById(id)
    .populate("sucursal", "descripcion")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const add = async (req, res = response) => {
  const descripcion = req.body.descripcion.toUpperCase();

  const modelDB = await Caja.findOne({ descripcion });

  if (modelDB) {
    return res.status(400).json({
      msg: `La caja ${modelDB.descripcion}, ya existe`,
    });
  }
  req.body.descripcion = descripcion;
  req.body.usuarioAlta = req.usuario._id;

  const newModel = new Caja(req.body);

  // Guardar DB
  await newModel.save();

  res.json(newModel);
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { estado, ...data } = req.body;

  const descripcion = data.descripcion.toUpperCase();

  console.log(id);
  const modelDB = await Caja.findOne({
    descripcion,
  });

  if (modelDB && modelDB._id != id) {
    return res.status(400).json({
      msg: `La caja ${modelDB.descripcion}, ya existe`,
    });
  }

  data.descripcion = descripcion;
  data.usuarioModif = req.usuario._id;
  data.fechaModif = Date.now();

  const newModel = await Caja.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(newModel);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Caja.findByIdAndUpdate(
    id,
    { estado: status },
    { new: true }
  );

  res.json(modelBorrado);
};

module.exports = {
  add,
  getAll,
  getById,
  update,
  changeStatus,
};
