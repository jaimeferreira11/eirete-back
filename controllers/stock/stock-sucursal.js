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

const updateArticuloSucursal = async (req, res = response) => {
  const { id } = req.params;
  const { estado = true, ...body } = req.body;
  try {
    await ArticuloSucursal.findOne({
      sucursal: id,
    }).exec(async (err, doc = []) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          msg: `Hable con el administrador`,
        });
      }

      let data = doc.articulos.find((a) => a.articulo == body.articulo);
      if (!data) {
        return res.status(404).json({
          msg: `Articulo no encontrado en la sucursal`,
        });
      }

      // se agrega las propiedades que no se deben pisar
      body._id = data._id;
      body.usuarioAlta = data.usuarioAlta;
      body.fechaAlta = data.fechaAlta;
      body.usuarioModif = req.usuario._id;
      body.fechaModif = Date.now();
      body.estado = estado;

      // reemplazar el elemento en el array
      const updatedArray = doc.articulos.map((x) =>
        x._id === data._id ? body : x
      );

      // se setea el array actualizado
      doc.articulos = updatedArray;
      await ArticuloSucursal.findByIdAndUpdate(doc._id, doc, {
        new: true,
      });
      res.json({ _id: body._id, ...req.body });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
};

module.exports = {
  getBySucursal,
  getFamiliasBySucursal,
  getLineasBySucursal,
  getArticulosBySucursal,
  updateArticuloSucursal,
};
