const { response } = require("express");
const { Perfil } = require("../../models");

const getAll = async (req, res = response) => {
  const { limite = 10, desde = 0, paginado = true } = req.query;
  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Perfil.countDocuments(),
      Perfil.find().skip(Number(desde)).limit(Number(limite)),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await Perfil.find();
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Perfil.findById(id);

  res.json(modelDB);
};

const add = async (req, res = response) => {
  const descripcion = req.body.descripcion.toUpperCase();

  const modelDB = await Perfil.findOne({ descripcion });

  if (modelDB) {
    return res.status(400).json({
      msg: `El perfil ${modelDB.descripcion}, ya existe`,
    });
  }

  // Generar la data a guardar
  const data = {
    descripcion,
  };

  const newModel = new Perfil(data);

  // Guardar DB
  await newModel.save();

  res.json(newModel);
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { estado, usuario, ...data } = req.body;

  data.descripcion = data.descripcion.toUpperCase();

  const newModel = await Perfil.findByIdAndUpdate(id, data, { new: true });

  res.json(newModel);
};

const inactivate = async (req, res = response) => {
  const { id } = req.params;
  const modelBorrado = await Perfil.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json(modelBorrado);
};

module.exports = {
  add,
  getAll,
  getById,
  update,
  inactivate,
};
