const { response } = require("express");
const { Movimiento, CategoriaMovimiento } = require("../../models");
const { skipAcentAndSpace } = require("../../helpers/strings-helper");
const { obtenerOrCrearTurno } = require("./turnos");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "fechaAlta",
    direction = -1,
    esIngreso,
    esGasto,
  } = req.query;

  const query = {
    $and: [{ esIngreso: esIngreso }, { esGasto: esGasto }],
  };

  console.log(query);

  if (paginado == "true") {
    const [total, data] = await Promise.all([
      Movimiento.countDocuments(query),
      Movimiento.find(query)
        .populate("categoria", "descripcion")
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
    const data = await Movimiento.find(query)
      .populate("categoria", "descripcion")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ [orderBy]: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Movimiento.findById(id)
    .populate("categoria", " descripcion ")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const add = async (req, res = response) => {
  const descripcion = req.body.descripcion.toUpperCase();

  const modelDB = await Movimiento.findOne({ descripcion });

  if (modelDB) {
    return res.status(400).json({
      msg: `La caja ${modelDB.descripcion}, ya existe`,
    });
  }
  const categoria = await CategoriaMovimiento.findById(req.body.categoria._id);
  req.body.descripcion = descripcion;
  req.body.usuarioAlta = req.usuario._id;
  req.body.esGasto = categoria.esGasto;
  req.body.esIngreso = categoria.esIngreso;

  const turnoActivo = await obtenerOrCrearTurno(req.usuario);

  console.log("categoria", categoria);

  const newModel = new Movimiento({
    turno: turnoActivo._id,
    ...req.body,
  });
  newModel.esGasto = categoria.esGasto;
  newModel.esIngreso = categoria.esIngreso;
  console.log("newModel", newModel);

  // Guardar DB
  await newModel.save();

  res.json(newModel);
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { nro, ...data } = req.body;

  console.log(data);

  const descripcion = data.descripcion.toUpperCase();

  const categoria = await CategoriaMovimiento.findById(req.body.categoria._id);
  data.descripcion = descripcion;
  data.usuarioModif = req.usuario._id;
  data.fechaModif = Date.now();

  const newModel = await Movimiento.findByIdAndUpdate(
    id,
    { esGasto: categoria.esGasto, esIngreso: categoria.esIngreso, ...data },
    {
      new: true,
    }
  );

  res.json(newModel);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Movimiento.findByIdAndUpdate(
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
