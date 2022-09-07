const { response } = require("express");
const { Turno, Usuario } = require("../../models");
const { skipAcentAndSpace } = require("../../helpers/strings-helper");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "fechaAlta",
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
      $or: [{ nro: search }],
      $and: [{ estado: true }],
    };
  }

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Turno.countDocuments(query),
      Turno.find(query)
        .populate("sucursal", "descripcion")
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
    const data = await Turno.find(query)
      .populate("sucursal", "descripcion")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ [orderBy]: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Turno.findById(id)
    .populate("sucursal", "descripcion")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const getTurnoActivoByUser = async (req, res = response) => {
  const modelDB = await Turno.findOne({
    usuarioAlta: req.usuario._id,
    estado: true,
  })
    .populate("sucursal", "descripcion")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const add = async (req, res = response) => {
  try {
    const newModel = await agregarTurno(req.usuario);

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
  const { nro, fechaApertura, fechaAlta, usuarioAlta, ...data } = req.body;

  data.usuarioModif = req.usuario._id;
  data.fechaModif = Date.now();

  const newModel = await Turno.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(newModel);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Turno.findByIdAndUpdate(
    id,
    { estado: status },
    { new: true }
  );

  res.json(modelBorrado);
};

// metodos sin response
const agregarTurno = async (usuario = Usuario) => {
  try {
    // buscar y cerrar todos los turnos activos del usuario y desactivar
    const resUpdated = await Turno.updateMany(
      { usuarioAlta: usuario._id, estado: true },
      {
        $set: {
          estado: false,
          usuarioModif: usuario._id,
          fechaModif: Date.now(),
        },
      }
    );

    console.log(
      `Se encontró ${resUpdated.matchedCount} y se modificaron ${resUpdated.modifiedCount} registros`
    );

    const newModel = new Turno({
      sucursal: usuario.sucursal,
      fechaCierre: null,
      usuarioAlta: usuario._id,
    });

    // Guardar DB
    return await newModel.save();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const obtenerOrCrearTurno = async (usuario = Usuario) => {
  const turnoActivo = await Turno.findOne({
    usuarioAlta: usuario._id,
    estado: true,
  });

  if (turnoActivo) {
    return turnoActivo;
  }

  return await agregarTurno(usuario);
};

module.exports = {
  add,
  getAll,
  getById,
  getTurnoActivoByUser,
  update,
  changeStatus,
  agregarTurno,
  obtenerOrCrearTurno,
};
