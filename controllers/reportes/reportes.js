const { response } = require("express");
const { ObjectId } = require("mongoose").Types;
const dayjs = require("dayjs");
const { Pedido, EstadisticaVentas, PedidoDetalle } = require("../../models");
const { EstadoPedido, MetodoPago } = require("../../helpers/constants");

const getEstadisticaVentas = async (req, res = response) => {
  const { fechaDesde, fechaHasta, sucursalId } = req.query;

  let query = {
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
      {
        sucursal: sucursalId ? { $eq: ObjectId(sucursalId) } : { $ne: null },
      },
    ],
  };

  // Metodos de pago
  let sumEfectivo = 0;
  let sumDeposito = 0;
  let contEfectivo = 0;
  let contDeposito = 0;
  let montoVuelto = 0;
  let cantPedidos = 0;
  let cantArticulos = 0;

  await Pedido.find(query).then(async (listaPedidos) => {
    listaPedidos.map((pedido = Pedido) => {
      pedido.metodosPago.map((m) => {
        if (m.descripcion == MetodoPago.EFECTIVO) {
          sumEfectivo += m.importe;
          contEfectivo++;
        } else {
          contDeposito++;
          sumDeposito += m.importe;
        }
      });

      pedido.detalles.map((pd = PedidoDetalle) => {
        cantArticulos += pd.cantidad;
      });
      montoVuelto += pedido.vuelto || 0;
    });
    cantPedidos = listaPedidos.length;
  });

  res.json({
    montoTotalEfectivo: sumEfectivo - montoVuelto,
    montoTotalDeposito: sumDeposito,
    montoPromedioEfectivo: contEfectivo == 0 ? 0 : sumEfectivo / contEfectivo,
    montoPromedioDeposito: contDeposito == 0 ? 0 : sumDeposito / contDeposito,
    montoPromedioVuelto: montoVuelto == 0 ? 0 : montoVuelto / cantPedidos,
    cantPedidos,
    montoTotalVendido: sumEfectivo - montoVuelto + sumDeposito,
    ventaPromedio: (sumEfectivo + sumDeposito) / cantPedidos || 0,
    cantArticulos,
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
