const { response } = require("express");
const { skipAcentAndSpace } = require("../../helpers");
const { Ciudad } = require("../../models");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    estado = true,
    search,
  } = req.query;
  const query = { estado };

  if (search)
    query.descripcion = { $regex: ".*" + search + ".*", $options: "i" };

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Ciudad.countDocuments(query),
      Ciudad.find(query)
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    data.map((c) => (c.descripcion = skipAcentAndSpace(c.descripcion)));

    res.json({
      total,
      data,
    });
  } else {
    const data = await Ciudad.find(query)
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");

    data.map((c) => (c.descripcion = skipAcentAndSpace(c.descripcion)));
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Ciudad.findById(id)
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  modelDB.descripcion = skipAcentAndSpace(modelDB.descripcion);
  res.json(modelDB);
};

const add = async (req, res = response) => {
  const descripcion = req.body.descripcion.toUpperCase();

  const modelDB = await Ciudad.findOne({ descripcion });

  if (modelDB) {
    return res.status(400).json({
      msg: `La ciudad ${modelDB.descripcion}, ya existe`,
    });
  }
  const data = {
    descripcion,
  };

  const newModel = new Ciudad(data);

  // Guardar DB
  await newModel.save();

  res.json(newModel);
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { estado, ...data } = req.body;

  data.descripcion = data.descripcion.toUpperCase();
  //  data.usuario = req.usuario._id;

  const newModel = await Ciudad.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(newModel);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Ciudad.findByIdAndUpdate(
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
