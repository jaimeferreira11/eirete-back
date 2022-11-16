const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const randomstring = require('randomstring');

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

  console.log(paginado);

  if (paginado || paginado == 'true') {
    const [total, data] = await Promise.all([
      ArticuloMovimiento.countDocuments(query),
      ArticuloMovimiento.find(query)
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
    const data = await ArticuloMovimiento.find(query)
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

const add = async (req, res = response) => {
  const { body } = req;

  try {
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

      console.log(artEnStock);
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
      ...body,
    });

    await newModel.save();

    // Bloquear el articulo
    articuloSucursal.save();

    res.json(newModel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
};

module.exports = {
  filter,
  add,
};
