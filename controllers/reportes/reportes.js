const { response } = require("express");
const { ObjectId } = require("mongoose").Types;
const dayjs = require("dayjs");
const { Pedido, EstadisticaVentas } = require("../../models");
const { EstadoPedido } = require("../../helpers/constants");

const getEstadisticaVentas = async (req, res = response) => {
  const { fechaDesde, fechaHasta, sucursalId } = req.query;

  const query = {
    $and: [
      {
        fecha: {
          $gte: dayjs(fechaDesde).hour(23).minute(59).format(),
          $lt: dayjs(fechaHasta).hour(23).minute(59).format(),
        },
      },
      {
        $or: [
          { estadoPedido: EstadoPedido.PAGADO },
          { estadoPedido: EstadoPedido.FACTURADO },
        ],
      },
      sucursalId
        ? {
            sucursal: ObjectId(sucursalId),
          }
        : {},
    ],
  };

  const resp = await Pedido.aggregate([
    {
      $match: {
        $or: [
          {
            estadoPedido: {
              $in: [EstadoPedido.PAGADO, EstadoPedido.FACTURADO],
            },
          },
          {
            fecha: {
              $gte: dayjs(fechaDesde).hour(23).minute(59).format(),
              $lt: dayjs(fechaHasta).hour(23).minute(59).format(),
            },
          },
        ],
        $and: [
          {
            sucursal: sucursalId
              ? { $eq: ObjectId(sucursalId) }
              : { $ne: null },
          },
        ],
      },
    },
    {
      $addFields: {
        cantArticulos: {
          $sum: "$detalles.cantidad",
        },
        montoEfectivo: {
          $sum: "$metodosPago.importe", // TODO: filtrar por tipo de metodo de pago
        },
        montoDeposito: {
          $sum: "$metodosPago.importe", // TODO: filtrar por tipo de metodo de pago
        },
      },
    },
    {
      $group: {
        _id: null,
        cantPedidos: { $sum: 1 },
        montoVendido: { $sum: "$importeTotal" },
        cantArticulos: {
          $sum: "$cantArticulos",
        },
        ventaPromedio: {
          $avg: "$importeTotal",
        },
        //cantArticulos: { count: { $size: "$detalles" } },
      },
    },
  ]);

  const efectivo = await Pedido.find({
    query,
  });
  const deposito = await Pedido.find({
    "metodosPago.descripcion": { $ne: "EFECTIVO" },
  });

  const sumEfectivo = efectivo
    .map((p) => p.metodosPago)
    .map((m) => m)
    .reduce((prev, next) => prev[0]?.importe + next[0]?.importe);

  const sumDeposito = deposito
    .map((p) => p.metodosPago)
    .map((m) => m)
    .reduce((prev, next) => prev[0]?.importe + next[0]?.importe);

  res.json({
    montoEfectivo: sumEfectivo || 0,
    montoDeposito: sumDeposito || 0,
    ...resp[0],
  });
};

const getPedidos = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    fechaDesde,
    fechaHasta,
    sucursalId,
  } = req.query;

  const query = {
    $and: [
      {
        fecha: {
          $gte: dayjs(fechaDesde).hour(23).minute(59).format(),
          $lt: dayjs(fechaHasta).hour(23).minute(59).format(),
        },
      },
      {
        $or: [
          { estadoPedido: EstadoPedido.PAGADO },
          { estadoPedido: EstadoPedido.FACTURADO },
        ],
      },
      sucursalId
        ? {
            sucursal: ObjectId(sucursalId),
          }
        : {},
    ],
  };

  const [total, data] = await Promise.all([
    Pedido.countDocuments(query),
    Pedido.find(query)
      .populate({
        path: "cliente",
        select: "-__v",
        populate: {
          path: "persona",
          select: "-__v",
        },
      })
      .populate({
        path: "detalles",
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
      .populate("sucursal", "descripcion")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .skip(Number(desde))
      .limit(Number(limite))
      .sort({ ["fechaAlta"]: -1 }),
  ]);

  res.json({
    total,
    data,
  });
};

module.exports = {
  getEstadisticaVentas,
  getPedidos,
};
