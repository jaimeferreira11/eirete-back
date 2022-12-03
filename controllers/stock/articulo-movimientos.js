const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const randomstring = require('randomstring');
const { EstadoMovimientoArticulo } = require('../../helpers/constants');

const { ArticuloMovimiento, ArticuloSucursal } = require('../../models');

const filter = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    sucursalOrigen,
    sucursalDestino,
    estado,
  } = req.query;
  const query = {};

  if (estado) {
    query.estado = estado;
  }
  if (sucursalOrigen) {
    query.sucursalOrigen = sucursalOrigen;
  }
  if (sucursalDestino) {
    query.sucursalDestino = sucursalDestino;
  }

  if (paginado || paginado == 'true') {
    const [total, data] = await Promise.all([
      ArticuloMovimiento.countDocuments(query),
      ArticuloMovimiento.find(query, { codigo: 0 })
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
        .populate('sucursalDestino', 'descripcion')
        .populate('sucursalOrigen', 'descripcion')
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username')
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await ArticuloMovimiento.find(query, { codigo: 0 })
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
      .populate('sucursalDestino', 'descripcion')
      .populate('sucursalOrigen', 'descripcion')
      .populate('usuarioAlta', 'username')
      .populate('usuarioModif', 'username');
    res.json(data);
  }
};

const enviar = async (req, res = response) => {
  const { body } = req;

  try {
    // evitar que se envie a la misma sucursal
    if (body.sucursalOrigen === body.sucursalDestino)
      return res.status(400).json({
        msg: `No se puede enviar a la misma sucursal`,
      });

    // revisar las cantidades
    const existeCero = body.detalles.some((d) => d.enviado <= 0);
    if (existeCero)
      return res.status(400).json({
        msg: `El monto enviado no puede ser cero`,
      });
    // revisar si hay stock
    const articuloSucursal = await ArticuloSucursal.findOne({ sucursal: body.sucursalOrigen });

    if (!articuloSucursal)
      return res.status(400).json({
        msg: `No se encontró articulos en esa sucursal`,
      });

    body.detalles.forEach((det) => {
      const artEnStock = articuloSucursal.articulos.find((a) => (a.articulo = det.articulo));
      if (!artEnStock)
        return res.status(400).json({
          msg: `No existe el articulo ${det.articulo} en la sucursal`,
        });

      if (artEnStock.stock < det.enviado)
        return res.status(400).json({
          msg: `No hay stock suficiente para el articulo ${artEnStock.articulo}`,
        });

      articuloSucursal.articulos.map((artS) => {
        if (artS.articulo == det.articulo._id) {
          artS.stockBloqueado += det.enviado;
        }
      });
    });

    const newModel = new ArticuloMovimiento({
      usuarioAlta: req.usuario._id,
      codigo: randomstring.generate({
        length: 6,
        charset: 'alphanumeric',
        capitalization: 'lowercase',
      }),
      estado: EstadoMovimientoArticulo.PENDIENTE,
      ...body,
    });

    await newModel.save();

    // Bloquear el articulo
    articuloSucursal.save();

    res.json(newModel);
  } catch (error) {
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
};

const recibir = async (req, res = response) => {
  const { id, codigo } = req.params;
  const { usuarioAlta, fechaAlta, ...body } = req.body;

  const artMovBd = await ArticuloMovimiento.findById(id);

  if (artMovBd.codigo !== codigo || body.estado !== EstadoMovimientoArticulo.RECHAZADO) {
    return res.status(400).json({
      msg: `El codigo de seguridad no coincide`,
    });
  }

  if (
    artMovBd.estado == EstadoMovimientoArticulo.RECHAZADO ||
    artMovBd.estado == EstadoMovimientoArticulo.FINALIZADO
  ) {
    return res.status(400).json({
      msg: `El movimiento ya tiene un estado finalizado`,
    });
  }

  artMovBd.usuarioModif = req.usuario._id;
  artMovBd.fechaModif = Date.now();

  const asOrigen = await ArticuloSucursal.findOne({ sucursal: artMovBd.sucursalOrigen });

  // si es rechazado
  if (body.estado === EstadoMovimientoArticulo.RECHAZADO) {
    artMovBd.estado = EstadoMovimientoArticulo.RECHAZADO;
    // devolver stock
    artMovBd.detalles.forEach((det) => {
      // desbloquear stock en origen
      asOrigen.articulos.map((art) => {
        if (art.articulo == det.articulo._id) {
          art.stockBloqueado -= det.recibido;
        }
      });
    });

    await ArticuloSucursal.findByIdAndUpdate(asOrigen._id, asOrigen);
    await ArticuloMovimiento.findByIdAndUpdate(id, artMovBd);

    return res.json({ msg: 'Movimiento Rechazado correctamente' });
  }

  //
  const asDestino = await ArticuloSucursal.findOne({ sucursal: body.sucursalDestino });

  let estaCompleto = true;
  artMovBd.estado = EstadoMovimientoArticulo.FINALIZADO;

  // actualizacion de stock en sucursales
  body.detalles.forEach((det) => {
    // controlar que no se reciba mas de lo que se envio
    if (det.recibido > det.enviado) {
      return res.status(400).json({
        msg: `No puedes recibir mas de lo que se envío`,
      });
    }

    if (det.recibido < det.enviado) estaCompleto = false;
    // aumenta stock en destino
    asDestino.articulos.map((art) => {
      if (art.articulo == det.articulo._id) {
        art.stock += det.recibido;
      }
    });

    // resta stock en origen
    asOrigen.articulos.map((art) => {
      if (art.articulo == det.articulo._id) {
        art.stock -= det.recibido;
        art.stockBloqueado -= det.recibido;
      }
    });
  });

  await ArticuloSucursal.findByIdAndUpdate(asDestino._id, asDestino);
  await ArticuloSucursal.findByIdAndUpdate(asOrigen._id, asOrigen);

  //
  if (!estaCompleto) {
    artMovBd.estado = EstadoMovimientoArticulo.ATENCION;
  }
  artMovBd.detalles = body.detalles;

  await ArticuloMovimiento.findByIdAndUpdate(id, artMovBd);

  return res.json({ msg: 'Movimiento de articulo actualizado' });
};

const reponer = async (req, res = response) => {
  const { id } = req.params;

  const artMovBd = await ArticuloMovimiento.findById(id);

  if (artMovBd.estado !== EstadoMovimientoArticulo.ATENCION)
    return res.status(400).json({
      msg: `No se puede reponer un movimiento con estado : ${artMovBd.estado}`,
    });

  const asOrigen = await ArticuloSucursal.findOne({ sucursal: artMovBd.sucursalOrigen });

  artMovBd.detalles.forEach((det) => {
    if (det.recibido < det.enviado) {
      // devolver estock al origen
      asOrigen.articulos.map((art) => {
        if (String(art.articulo) == String(det.articulo._id)) {
          art.stockBloqueado -= det.enviado - det.recibido;
        }
      });
    }
  });
  artMovBd.estado = EstadoMovimientoArticulo.FINALIZADO;
  await ArticuloSucursal.findByIdAndUpdate(asOrigen._id, asOrigen);
  await ArticuloMovimiento.findByIdAndUpdate(id, artMovBd);

  return res.json({ msg: 'Stock repuesto correctamente' });
};

module.exports = {
  filter,
  enviar,
  recibir,
  reponer,
};
