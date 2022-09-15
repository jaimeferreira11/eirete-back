const { response } = require("express");
const { ObjectId } = require("mongoose").Types;
const dayjs = require("dayjs");

const {
  Arqueo,
  Turno,
  ArticuloSucursal,
  Movimiento,
  Pedido,
} = require("../../models");
const { skipAcentAndSpace } = require("../../helpers/strings-helper");
const { toDate } = require("../../helpers/format-helper");
const { EstadoPedido } = require("../../helpers/constants");
const { obtenerOrCrearTurno } = require("./turnos");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "fechaAlta",
    direction = -1,
    estado = true,
    search = "",
    fechaDesde,
    fechaHasta,
    sucursalId,
  } = req.query;

  let query = { estado };

  if (search) {
    const regex = {
      $regex: ".*" + skipAcentAndSpace(search) + ".*",
      $options: "i",
    };
    query = {
      $or: [{ descripcion: regex }],
      $and: [{ estado: estado }],
    };
  }

  if (fechaDesde && fechaHasta) {
    query.fechaAlta = {
      $gte: dayjs(fechaDesde).hour(23).minute(59).format(),
      $lt: dayjs(fechaHasta).hour(23).minute(59).format(),
    };
  }
  if (sucursalId) query.sucursal = ObjectId(sucursalId);

  console.log(query);

  if (paginado == "true") {
    const [total, data] = await Promise.all([
      Arqueo.countDocuments(query),
      Arqueo.find(query)
        .populate({
          path: "stock",
          select: "-__v",
          populate: {
            path: "articulo",
            select: "-__v",
            populate: {
              path: "lineaArticulo",
              select: "-__v",
            },
          },
        })
        .populate("turno", "-__v")
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
    const data = await Arqueo.find(query)
      .populate({
        path: "stock",
        select: "-__v",
        populate: {
          path: "articulo",
          select: "-__v",
          populate: {
            path: "lineaArticulo",
            select: "-__v",
          },
        },
      })
      .populate("turno", "-__v")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ [orderBy]: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Arqueo.findById(id)
    .populate({
      path: "stock",
      select: "-__v",
      populate: {
        path: "articulo",
        select: "-__v",
        populate: {
          path: "lineaArticulo",
          select: "-__v",
        },
      },
    })
    .populate("turno", "-__v")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const getLastByUser = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Arqueo.findOne({ usuarioAlta: req.usuario._id })
    .sort({ fechaAlta: -1 })
    .populate({
      path: "stock",
      select: "-__v",
      populate: {
        path: "articulo",
        select: "-__v",
        populate: {
          path: "lineaArticulo",
          select: "-__v",
        },
      },
    })
    .populate("turno", "-__v")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const add = async (req, res = response) => {
  try {
    req.body.usuarioAlta = req.usuario._id;

    const turnoActivo = await obtenerOrCrearTurno(req.usuario);

    if (!turnoActivo) {
      return res.status(400).json({
        msg: `El usuario no tiene un turno activo`,
      });
    }

    /* Buscar el stock actual  */
    let stock = [];
    const articuloSucursal = await ArticuloSucursal.findOne({
      sucursal: req.usuario.sucursal,
    });
    articuloSucursal.articulos.forEach((a) => {
      stock.push({ articulo: a.articulo, stock: a.stock });
    });
    /**/

    /* Buscar los movimientos  */
    const movimientos = await Movimiento.find({ turno: turnoActivo._id });
    /**/

    /* Calcular el total egresado  */
    let totalEgreso = 0;
    if (movimientos && movimientos.length > 0) {
      movimientos
        .filter((m) => m.esEgreso && m.afectaArqueo)
        .map((m) => (totalEgreso += m.monto));
    }
    /**/

    /* Buscar los pedidos realizados  */
    const pedidosRealizados = await Pedido.find({
      turno: turnoActivo._id,
      estadoPedido: {
        $in: [
          EstadoPedido.PENDIENTE,
          EstadoPedido.FACTURADO,
          EstadoPedido.PAGADO,
        ],
      },
    });
    /**/

    /* Buscar los pedidos cancelados */
    const pedidosCancelados = await Pedido.find({
      turno: turnoActivo._id,
      estadoPedido: {
        $in: [
          EstadoPedido.CANCELADO,
          EstadoPedido.ANULADO,
          EstadoPedido.REVERSADO,
        ],
      },
    });
    /**/

    const newModel = new Arqueo({
      turno: turnoActivo._id,
      sucursal: req.usuario.sucursal,
      stock,
      movimientos: movimientos || [],
      totalEgreso,
      pedidosRealizados: pedidosRealizados || [],
      pedidosCancelados: pedidosCancelados || [],
      ...req.body,
    });

    // debe cerrar el turno actual
    console.log("Cerrar el turno activo");
    await Turno.findByIdAndUpdate(turnoActivo._id, {
      fechaCierre: Date.now(),
      estado: false,
      fechaModif: Date.now(),
      usuarioModif: req.usuario._id,
    });

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
  const { nro, ...data } = req.body;

  data.usuarioModif = req.usuario._id;
  data.fechaModif = Date.now();

  const newModel = await Arqueo.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(newModel);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Arqueo.findByIdAndUpdate(
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
  getLastByUser,
  update,
  changeStatus,
};
