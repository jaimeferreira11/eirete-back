const { response } = require("express");
const { ObjectId } = require("mongoose").Types;
const dayjs = require("dayjs");
const { Pedido, EstadisticaVentas } = require("../../models");
const { EstadoPedido } = require("../../helpers/constants");

const getEstadisticaVentas = async (req, res = response) => {
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

  const resp = await Pedido.aggregate([
    {
      $match: {
        $or: [
          {
            estadoPedido: {
              $in: [
                EstadoPedido.PAGADO,
                EstadoPedido.FACTURADO,
                EstadoPedido.PENDIENTE,
              ],
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
          $sum: "$metodosPago.importe",
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
        montoEfectivo: {
          $sum: "$montoEfectivo",
        },
        //cantArticulos: { count: { $size: "$detalles" } },
      },
    },
  ]);

  console.log(resp);

  console.log(query);

  const [total, data] = await Promise.all([
    Pedido.countDocuments(query),
    Pedido.find(query)
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .skip(Number(desde))
      .limit(Number(limite))
      .sort({ ["fechaAlta"]: -1 }),
  ]);

  const estadistica = new EstadisticaVentas();
  estadistica.cantPedidos = total;

  res.json(resp);
};

module.exports = {
  getEstadisticaVentas,
};
