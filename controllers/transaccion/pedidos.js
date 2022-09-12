const { response } = require('express');
const mongoose = require('mongoose');

const ObjectId = require('mongoose').Types.ObjectId;
const conn = require('../../database/config');

const {
  Pedido,
  PedidoDetalle,
  ArticuloSucursal,
  Cliente,
  Persona,
  Turno,
} = require('../../models');
const { skipAcentAndSpace } = require('../../helpers/strings-helper');
const {
  ClienteOcasional,
  TipoPedido,
  EstadoPedido,
  EstadoDelivery,
  TipoImpuesto,
} = require('../../helpers/constants');
const { updatePersona, addPersona } = require('../catastro/personas');
const { obtenerOrCrearTurno } = require('../tesoreria/turnos');

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = 'true',
    orderBy = 'fechaAlta',
    direction = -1,
    search = '',
  } = req.query;

  let query = {};

  if (search) {
    // const regex = {
    //   $regex: ".*" + skipAcentAndSpace(search) + ".*",
    //   $options: "i",
    // };
    query = { nro: search };
  }

  if (paginado == 'true') {
    const [total, data] = await Promise.all([
      Pedido.countDocuments(query),
      Pedido.find(query)
        .populate({
          path: 'cliente',
          select: '-__v',
          populate: {
            path: 'persona',
            select: '-__v',
          },
        })
        .populate({
          path: 'detalles',
          select: '-__v',
          populate: {
            path: 'articulo',
            select: '-__v',
            populate: {
              path: 'lineaArticulo',
              select: '-__v',
            },
          },
        })
        .populate('sucursal', 'descripcion')
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username')
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
        path: 'cliente',
        select: '-__v',
        populate: {
          path: 'persona',
          select: '-__v',
        },
      })
      .populate({
        path: 'detalles',
        select: '-__v',
        populate: {
          path: 'articulo',
          select: '-__v',
          populate: {
            path: 'lineaArticulo',
            select: '-__v',
          },
        },
      })
      .populate('sucursal', 'descripcion')
      .populate('usuarioAlta', 'username')
      .populate('usuarioModif', 'username')
      .sort({ orderBy: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Pedido.findById(id)
    .populate({
      path: 'cliente',
      select: '-__v',
      populate: {
        path: 'persona',
        select: '-__v',
      },
    })
    .populate({
      path: 'detalles',
      select: '-__v',
      populate: {
        path: 'articulo',
        select: '-__v',
        populate: {
          path: 'lineaArticulo',
          select: '-__v',
        },
      },
    })
    .populate('sucursal', 'descripcion')
    .populate('usuarioAlta', 'username')
    .populate('usuarioModif', 'username');

  if (!modelDB) {
    return res.status(404).json({
      msg: `No se encontró el pedido con id: ${id} `,
    });
  }

  res.json(modelDB);
};

const getByNro = async (req, res = response) => {
  const { nro } = req.params;
  const modelDB = await Pedido.findOne({ nro })
    .populate({
      path: 'cliente',
      select: '-__v',
      populate: {
        path: 'persona',
        select: '-__v',
      },
    })
    .populate({
      path: 'detalles',
      select: '-__v',
      populate: {
        path: 'articulo',
        select: '-__v',
        populate: {
          path: 'lineaArticulo',
          select: '-__v',
        },
      },
    })
    .populate('sucursal', 'descripcion')
    .populate('usuarioAlta', 'username')
    .populate('usuarioModif', 'username');

  if (!modelDB) {
    return res.status(404).json({
      msg: `No se encontró el pedido nro: ${nro} `,
    });
  }

  res.json(modelDB);
};

const getByCliente = async (req, res = response) => {
  const { id } = req.params;
  const {
    limite = 10,
    desde = 0,
    paginado = 'true',
    orderBy = 'fecha',
    direction = -1,
  } = req.query;

  if (paginado == 'true') {
    const [total, data] = await Promise.all([
      Pedido.countDocuments({ cliente: id }),
      Pedido.find({ cliente: id })
        .populate({
          path: 'cliente',
          select: '-__v',
          populate: {
            path: 'persona',
            select: '-__v',
          },
        })
        .populate({
          path: 'detalles',
          select: '-__v',
          populate: {
            path: 'articulo',
            select: '-__v',
            populate: {
              path: 'lineaArticulo',
              select: '-__v',
            },
          },
        })
        .populate('turno', '-__v')
        .populate('sucursal', 'descripcion')
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username')
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ [orderBy]: direction }),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await Pedido.find({ cliente: id })
      .populate({
        path: 'cliente',
        select: '-__v',
        populate: {
          path: 'persona',
          select: '-__v',
        },
      })
      .populate({
        path: 'detalles',
        select: '-__v',
        populate: {
          path: 'articulo',
          select: '-__v',
          populate: {
            path: 'lineaArticulo',
            select: '-__v',
          },
        },
      })
      .populate('turno', '-__v')
      .populate('sucursal', 'descripcion')
      .populate('usuarioAlta', 'username')
      .populate('usuarioModif', 'username')
      .sort({ orderBy: direction });
    res.json(data);
  }
};

const getByEstadoDelivery = async (req, res = response) => {
  const { estadoDelivery } = req.params;
  const {
    limite = 10,
    desde = 0,
    paginado = 'true',
    orderBy = 'fechaAlta',
    direction = -1,
    search = '',
  } = req.query;

  let query = {
    estadoDelivery,
    estadoPedido: {
      $in: [
        EstadoPedido.PENDIENTE,
        EstadoPedido.PAGADO,
        EstadoPedido.FACTURADO,
      ],
    },
  };

  if (search) {
    query = { ...query, nro: search };
  }

  if (paginado == 'true') {
    const [total, data] = await Promise.all([
      Pedido.countDocuments(query),
      Pedido.find(query)
        .populate({
          path: 'cliente',
          select: '-__v',
          populate: {
            path: 'persona',
            select: '-__v',
          },
        })
        .populate({
          path: 'detalles',
          select: '-__v',
          populate: {
            path: 'articulo',
            select: '-__v',
            populate: {
              path: 'lineaArticulo',
              select: '-__v',
            },
          },
        })
        .populate('sucursal', 'descripcion')
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username')
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
        path: 'cliente',
        select: '-__v',
        populate: {
          path: 'persona',
          select: '-__v',
        },
      })
      .populate({
        path: 'detalles',
        select: '-__v',
        populate: {
          path: 'articulo',
          select: '-__v',
          populate: {
            path: 'lineaArticulo',
            select: '-__v',
          },
        },
      })
      .populate('sucursal', 'descripcion')
      .populate('usuarioAlta', 'username')
      .populate('usuarioModif', 'username')
      .sort({ orderBy: direction });
    res.json(data);
  }
};

const add = async (req, res = response) => {
  let { ...pedidoData } = req.body;

  /* Verificar cliente*/
  if (pedidoData.cliente.persona.nroDoc != ClienteOcasional) {
    const cliente = await Cliente.findById(pedidoData.cliente._id).populate(
      'persona',
      '-__v'
    );
    let crearNuevoCliente = true;
    if (!cliente) {
      // Buscar si ya existe persona
      let existePersona = await Persona.findOne({
        nroDoc: pedidoData.cliente.persona.nroDoc,
      });
      if (!existePersona) {
        console.log('No existe persona, crear....');
        // crea la persona
        const newPersonaModel = new Persona({ ...pedidoData.cliente.persona });
        existePersona = await addPersona(newPersonaModel, req.usuario._id);
      } else {
        console.log('Existe persona, verificar si ya es cliente...');
        const existeCliente = await Cliente.findOne({
          persona: existePersona._id,
        });
        if (existeCliente) {
          pedidoData.cliente = existeCliente;
          crearNuevoCliente = false;
        }
      }
      // crear el cliente
      if (crearNuevoCliente) {
        const newClienteData = new Cliente({
          persona: existePersona,
          usuarioAlta: req.usuario._id,
        });

        const clienteSaved = await newClienteData.save();
        pedidoData.cliente = clienteSaved;
      }
    } else {
      // si el cliente no tiene ruc registrado y el pedido viene con ruc
      // actualizar cliente
      if (!cliente.persona.ruc && pedidoData.cliente.persona.ruc) {
        cliente.persona.ruc = pedidoData.cliente.persona.ruc;
        console.log('Actualizando ruc del cliente', cliente.persona.ruc);

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
    if (pedidoData.tipoPedido == TipoPedido.DELIVERY) {
      // Si es Delivery, el pago se realiza en otro proceso
      pedidoData.estadoPedido = EstadoPedido.PENDIENTE;
      pedidoData.estadoDelivery = EstadoDelivery.EN_ESPERA;
    } else {
      // Si es Regular el pago se hizo en este proceso
      pedidoData.estadoPedido = EstadoPedido.PAGADO;
    }
    /** */

    /** Calucular los montos */
    pedidoData = calcularTotales(pedidoData);
    /** */

    pedidoData.usuarioAlta = req.usuario._id;
    const newModel = new Pedido(pedidoData);

    /** Buscar si existe un turno activo del usuario */
    const turnoActivo = await obtenerOrCrearTurno(req.usuario);

    pedidoData.turno = turnoActivo._id;

    /**/

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

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;

  const { motivoCancelacion = '' } = req.body;
  const modelBorrado = await Pedido.findByIdAndUpdate(
    id,
    { estadoPedido: status, motivoCancelacion },
    { new: true }
  );

  res.json(modelBorrado);
};

const changeEstadoDelivery = async (req, res = response) => {
  const { id, estadoDelivery } = req.params;

  const modelBorrado = await Pedido.findByIdAndUpdate(
    id,
    { estadoDelivery },
    { new: true }
  );

  res.json(modelBorrado);
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
        path: 'articulos',
        select: '-__v',
        populate: {
          path: 'articulo',
          select: '-__v',
        },
      });
      if (!articuloSucursal)
        throw new Error('No se encontro registros para la sucursal');

      const isFound = articuloSucursal.articulos.filter(
        (art) => art.articulo._id == detalle.articulo._id
      );

      if (!isFound || isFound.length == 0)
        throw new Error('El articulo no existe en la sucursal');

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
  getByNro,
  getByCliente,
  getByEstadoDelivery,
  changeStatus,
  changeEstadoDelivery,
};
