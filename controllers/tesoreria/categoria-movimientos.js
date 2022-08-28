const { response } = require("express");
const { CategoriaMovimiento } = require("../../models");
const { skipAcentAndSpace } = require("../../helpers/strings-helper");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "descripcion",
    direction = -1,
    estado = true,
    search = "",
  } = req.query;

  let query = { estado };

  if (search) {
    const regex = {
      $regex: ".*" + skipAcentAndSpace(search) + ".*",
      $options: "i",
    };
    query = {
      $or: [{ descripcion: regex }],
      $and: [{ estado: true }],
    };
  }

  if (paginado == "true") {
    const [total, data] = await Promise.all([
      CategoriaMovimiento.countDocuments(query),
      CategoriaMovimiento.find(query)
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username")
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ [orderBy]: direction }),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await CategoriaMovimiento.find(query)
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ [orderBy]: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await CategoriaMovimiento.findById(id)
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const add = async (req, res = response) => {
  const descripcion = req.body.descripcion.toUpperCase();

  const modelDB = await CategoriaMovimiento.findOne({ descripcion });

  if (modelDB) {
    return res.status(400).json({
      msg: `La caja ${modelDB.descripcion}, ya existe`,
    });
  }
  req.body.descripcion = descripcion;
  req.body.usuarioAlta = req.usuario._id;

  const newModel = new CategoriaMovimiento(req.body);

  // Guardar DB
  await newModel.save();

  res.json(newModel);
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { nro, ...data } = req.body;

  const descripcion = data.descripcion.toUpperCase();
  const modelDB = await CategoriaMovimiento.findOne({
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

  const newModel = await CategoriaMovimiento.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(newModel);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await CategoriaMovimiento.findByIdAndUpdate(
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
