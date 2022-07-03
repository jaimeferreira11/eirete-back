const { response } = require("express");
const { ArticuloSucursal } = require("../../models");

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

module.exports = {
  getBySucursal,
};
