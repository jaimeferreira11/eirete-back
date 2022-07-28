const { response } = require("express");
const ObjectId = require("mongoose").Types.ObjectId;

const { Sucursal, Articulo, ArticuloSucursal } = require("../../models");
const sucursal = require("../../models/stock/sucursal");
const { createArticuloSucursal } = require("./stock-sucursal");

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

  if (search)
    query.descripcion = { $regex: ".*" + search + ".*", $options: "i" };

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Sucursal.countDocuments(query),
      Sucursal.find(query)
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username")
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ orderBy: direction }),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await Sucursal.find(query)
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ orderBy: direction });
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
    if (await Sucursal.findOne({ descripcion: req.body.descripcion })) {
      return res.status(400).json({
        msg: `La sucursal  ${req.body.descripcion}, ya existe`,
      });
    }

    // establecimiento y punto de expedicion
    if (
      await Sucursal.findOne({
        timbrado: req.body.timbrado,
        establecimiento: req.body.establecimiento,
      })
    ) {
      return res.status(400).json({
        msg: `El establecimiento "${req.body.establecimiento}" ya está registrado para el timbrado "${req.body.timbrado}"`,
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
  const { _id, usuarioAlta, fechaAlta, nroActual, articulos, ...data } =
    req.body;

  try {
    // punto de expedicion y timbrado
    const model = await Sucursal.findOne({
      establecimiento: req.body.establecimiento,
      timbrado: req.body.timbrado,
    });
    if (model && model._id != id) {
      return res.status(400).json({
        msg: `El establecimiento ${req.body.establecimiento}, ya está registrado en la sucursal ${model.descripcion} para el timbrado ${req.body.timbrado}`,
      });
    }

    // verificar descripcion
    data.descripcion = data.descripcion.toUpperCase();
    const modelDesc = await Sucursal.findOne({ descripcion: data.descripcion });
    if (modelDesc && modelDesc._id != id) {
      return res.status(400).json({
        msg: `La descripcion ${modelDesc}, ya está registrado en otra sucursal`,
      });
    }

    data.usuarioModif = req.usuario._id;
    data.fechaModif = Date.now();

    const newModel = await Sucursal.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
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
