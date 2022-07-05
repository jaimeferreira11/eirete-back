const { response } = require("express");
const { ObjectId } = require("mongoose").Types;

const { ArticuloSucursal, LineaArticulo, Articulo } = require("../../models");

const getBySucursal = async (req, res = response) => {
  const { id } = req.params;
  const { limite = 10, desde = 0, paginado = true, estado = true } = req.query;
  const query = {
    sucursal: id,
  };

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      ArticuloSucursal.countDocuments(query),
      ArticuloSucursal.find(query)
        .populate({
          path: "articulos",
          select: "-__v",
          populate: {
            path: "articulo",
            select: "-__v",
            populate: {
              path: "lineaArticulo",
              select: "-__v",
              populate: {
                path: "familia",
                select: "-__v",
              },
            },
          },
        })
        .populate("sucursal", "descripcion")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await ArticuloSucursal.find(query)
      .populate({
        path: "lineaArticulo",
        select: "-__v",
        populate: {
          path: "familia",
          select: "-__v",
        },
      })
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");
    res.json(data);
  }
};

// FIXME: Mejorar la logica
const getFamiliasBySucursal = async (req, res = response) => {
  const { id } = req.params;
  const { estado = true } = req.query;

  return await ArticuloSucursal.find({ sucursal: id }).then(async (list) => {
    let familias = [];

    await Promise.all(
      list.map(async (d = ArticuloSucursal) => {
        await Promise.all(
          d.articulos.map(async (a = Articulo) => {
            await Articulo.findOne({
              _id: a.articulo,
              estado,
            })
              .populate({
                path: "lineaArticulo",
                select: "-__v",
                populate: {
                  path: "familia",
                  select: "-__v",
                },
              })
              .then((articulo) => {
                if (!articulo) return;
                const isFound = familias.some(
                  (f) =>
                    f.descripcion === articulo.lineaArticulo.familia.descripcion
                );
                if (!isFound) familias.push(articulo.lineaArticulo.familia);
              });
          })
        );
      })
    );
    res.json(familias);
  });
};

// FIXME: Mejorar la logica
const getLineasBySucursal = async (req, res = response) => {
  const { id, idFamilia } = req.params;
  const { estado = true } = req.query;

  return await ArticuloSucursal.find({ sucursal: id }).then(async (list) => {
    let lineas = [];
    await Promise.all(
      list.map(async (d = ArticuloSucursal) => {
        await Promise.all(
          d.articulos.map(async (a = Articulo) => {
            await Articulo.findOne({
              _id: a.articulo,
              estado,
            })
              .populate({
                path: "lineaArticulo",
                select: "-__v",
                populate: {
                  path: "familia",
                  select: "_id",
                },
              })
              .then((articulo) => {
                if (
                  !articulo ||
                  articulo.lineaArticulo.familia._id != idFamilia
                )
                  return;
                const isFound = lineas.some(
                  (l) => l.descripcion === articulo.lineaArticulo.descripcion
                );
                if (!isFound) lineas.push(articulo.lineaArticulo);
              });
          })
        );
      })
    );
    res.json(lineas);
  });
};

// FIXME: Mejorar la logica
const getArticulosBySucursal = async (req, res = response) => {
  const { id, idLinea } = req.params;
  const { estado = true } = req.query;

  return await ArticuloSucursal.find({ sucursal: id }).then(async (list) => {
    let articulos = [];
    await Promise.all(
      list.map(async (d = ArticuloSucursal) => {
        await Promise.all(
          d.articulos.map(async (a = Articulo) => {
            await Articulo.findOne({
              _id: a.articulo,
              estado,
              lineaArticulo: idLinea,
            })
              .populate({
                path: "lineaArticulo",
                select: "-__v",
                populate: {
                  path: "familia",
                  select: "_id",
                },
              })
              .then((articulo) => {
                if (!articulo) return;
                const isFound = articulos.some(
                  (art) => art._id == articulo._id
                );
                if (!isFound) articulos.push(articulo);
              });
          })
        );
      })
    );
    res.json(articulos);
  });
};

module.exports = {
  getBySucursal,
  getFamiliasBySucursal,
  getLineasBySucursal,
  getArticulosBySucursal,
};
