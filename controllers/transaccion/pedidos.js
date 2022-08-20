const { response } = require("express");
const mongoose = require("mongoose");

const ObjectId = require("mongoose").Types.ObjectId;
const conn = require("../../database/config");

const {
  Pedido,
  PedidoDetalle,
  ArticuloSucursal,
  Cliente,
  Persona,
} = require("../../models");
const { skipAcentAndSpace } = require("../../helpers/strings-helper");
const {
  ClienteOcasional,
  TipoPedido,
  EstadoPedido,
  EstadoDelivery,
  TipoImpuesto,
} = require("../../helpers/constants");
const { updatePersona, addPersona } = require("../catastro/personas");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "fechaAlta",
    direction = -1,
    search = "",
  } = req.query;

  let query = {};

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

  if (paginado === "true") {
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
    const data = await Pedido.find(query)
      .populate({
        path: "cliente",
        select: "-__v",
        populate: {
          path: "persona",
          select: "-__v",
        },
      })
      .populate("sucursal", "descripcion")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ orderBy: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Pedido.findById(id)
    .populate({
      path: "cliente",
      select: "-__v",
      populate: {
        path: "persona",
        select: "-__v",
      },
    })
    .populate("sucursal", "descripcion")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const add = async (req, res = response) => {
  let { ...pedidoData } = req.body;

  /* Verificar cliente*/
  if (pedidoData.cliente.persona.nroDoc != ClienteOcasional) {
    const cliente = await Cliente.findById(pedidoData.cliente._id).populate(
      "persona",
      "-__v"
    );
    if (!cliente) {
      // crear el cliente
      const newPersonaModel = new Persona({ ...pedidoData.cliente.persona });
      const personaSaved = await addPersona(newPersonaModel, req.usuario._id);
      const newClienteData = new Cliente({
        persona: personaSaved,
        usuarioAlta: req.usuario._id,
      });

      const clienteSaved = await newClienteData.save();

      pedidoData.cliente = clienteSaved;
    } else {
      // si el cliente no tiene ruc registrado y el pedido viene con ruc
      // actualizar cliente
      if (!cliente.persona.ruc && pedidoData.cliente.persona.ruc) {
        cliente.persona.ruc = pedidoData.cliente.persona.ruc;
        console.log("Actualizando ruc del cliente", cliente.persona.ruc);

        await updatePersona(cliente.persona, req.usuario._id);
      }
    }
  }
  /** */
  //
  const session = await mongoose.startSession();

  try {
    const { _id } = req.body;
    if (_id) {
      const modelDB = await Pedido.findById(_id);
      if (modelDB) {
        return res.status(400).json({
          msg: `El Pedido ${modelDB.nro}, ya existe`,
        });
      }
    }

    session.startTransaction();
    /* Verificar articulos*/
    try {
      await verificarStockPedido(
        pedidoData.detalles,
        pedidoData.sucursal._id,
        session
      );
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return res.status(403).json({
        msg: `${error}`,
      });
    }
    /** */

    /* Verificar el tipo de pedido: */
    if (pedidoData.tipoPedido == TipoPedido.REGULAR) {
      // Si es Regular el pago se hizo en este proceso
      pedidoData.estadoPedido = EstadoPedido.PAGADO;
    } else {
      // Si es Delivery, el pago se realiza en otro proceso
      pedidoData.estadoPedido = EstadoPedido.PENDIENTE;
      pedidoData.estadoDelivery = EstadoDelivery.EN_ESPERA;
    }
    /** */

    /** Calucular los montos */
    pedidoData = calcularTotales(pedidoData);
    /** */

    pedidoData.usuarioAlta = req.usuario._id;
    const newModel = new Pedido(pedidoData);

    // Guardar DB
    await newModel.save({ session });
    await session.commitTransaction();

    res.json(newModel);
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  } finally {
    session.endSession();
  }
};

/// Metodos internos
const calcularTotales = (pedido = Pedido) => {
  const { detalles = [PedidoDetalle] } = pedido;
  let importeTotal = 0;
  let impuestoTotal = 0;
  detalles.map((detalle) => {
    const importe = detalle.cantidad * detalle.precioUnitario;
    const impuesto = importe / TipoImpuesto[detalle.tipoImpuesto].dividendo;

    detalle.subtotal = importe;
    detalle.impuesto = impuesto;

    importeTotal += importe;
    impuestoTotal += impuesto == Infinity ? 0 : impuesto;
  });

  return {
    ...pedido,
    importeTotal,
    impuesto: impuestoTotal,
    vuelto: pedido.montoRecibido - importeTotal,
  };
};

const verificarStockPedido = async (detalles, sucursalId, session) => {
  await Promise.all(
    detalles.map(async (detalle) => {
      const articuloSucursal = await ArticuloSucursal.findOne({
        sucursal: sucursalId,
      }).populate({
        path: "articulos",
        select: "-__v",
        populate: {
          path: "articulo",
          select: "-__v",
        },
      });
      if (!articuloSucursal)
        throw new Error("No se encontro registros para la sucursal");

      const isFound = articuloSucursal.articulos.filter(
        (art) => art.articulo._id == detalle.articulo._id
      );

      if (!isFound || isFound.length == 0)
        throw new Error("El articulo no existe en la sucursal");

      const stockDisponible = isFound[0].stock - isFound[0].stockBloqueado;
      if (stockDisponible < detalle.cantidad) {
        throw new Error(
          `No hay stock suficiente para el articulo: ${isFound[0].articulo.descripcion}, cantidad disponible: ${stockDisponible}`
        );
      }
      const nuevoStock = isFound[0].stock - detalle.cantidad;
      isFound[0].stock = nuevoStock;

      articuloSucursal.articulos = articuloSucursal.articulos.map((artsuc) =>
        artsuc._id !== isFound[0]._id ? artsuc : isFound[0]
      );

      await articuloSucursal.save({ session });
    })
  );
};

module.exports = {
  add,
  getAll,
  getById,
};