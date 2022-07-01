const { response } = require("express");
const { ArticuloSucursal } = require("../../models");

const getAllBySucursal = async (req, res = response) => {
  const { id } = req.params;
  const { limite = 10, desde = 0, paginado = true, estado = true } = req.query;
  const query = {
    sucursal: id,
    estado,
  };

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      ArticuloSucursal.countDocuments(query),
      ArticuloSucursal.find(query)
        .populate({
          path: "lineaArticulo",
          select: "-__v",
          populate: {
            path: "familia",
            select: "-__v",
          },
        })
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username")
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

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await ArticuloSucursal.findById(id)
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

  res.json(modelDB);
};

const getByCodigo = async (req, res = response) => {
  const { codigo } = req.query;
  console.log(`Buscando el Articul oSucursal por codigo  ${codigo}`);

  const modelDB = await existeArticuloByCodigo(codigo);
  if (!modelDB) {
    console.log(`No existe el articulo con codigo: ${codigo}`);
    return res.status(404).json({
      msg: `No existe el articulo con codigo: ${codigo}`,
    });
  }

  return res.json(modelDB);
};

const add = async (req, res = response) => {
  try {
    const { _id, codigo } = req.body;
    if (_id) {
      const modelDB = await ArticuloSucursal.findById(_id);
      if (modelDB) {
        return res.status(400).json({
          msg: `El articulo ${modelDB.codigo}, ya existe`,
        });
      }
    }

    if (await existeArticuloByCodigo(codigo)) {
      return res.status(400).json({
        msg: `Ya existe el articulo con codigo: ${codigo}`,
      });
    }
    // Generar la data a guardar
    req.body._id = null;

    const newModel = await addArticulo(new Articulo(req.body), req.usuario._id);
    res.json(newModel);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { usuarioAlta, fechaAlta, ...data } = req.body;

  data._id = id;
  const newModel = updateArticulo(data, req.usuario._id);

  res.json(newModel);
};

const existeArticuloByCodigo = async (codigo = "") => {
  return await Articulo.findOne({ codigo })
    .populate({
      path: "lineaArticulo",
      select: "-__v",
      populate: {
        path: "familia",
        select: "-__v",
      },
    })
    .populate("marca", "descripcion")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");
};

const addArticulo = async (newArticulo = Articulo, usuario_id = null) => {
  try {
    if (await existeArticuloByCodigo(newArticulo.codigo)) {
      throw new Error(
        `El articulo con codigo: ${newArticulo.codigo}, ya está registrado`
      );
    }

    newArticulo.usuarioAlta = usuario_id;
    newArticulo.descripcion = newArticulo.descripcion.toUpperCase();

    return await newArticulo.save();
  } catch (error) {
    console.log("Error al agregar el articulo", error);
    throw error;
  }
};

const updateArticulo = async (
  articuloUpdated = Articulo,
  usuario_id = null
) => {
  try {
    const { usuarioAlta, fechaAlta, codigo, ...data } = articuloUpdated;
    console.log(`Actualizando articulo: ${codigo}`);
    data.usuarioModif = usuario_id;
    data.fechaModif = Date.now();
    data.descripcion = data.descripcion.toUpperCase();
    return await Articulo.findByIdAndUpdate(data._id, data, { new: true });
  } catch (error) {
    console.log("Error al actualizar el articulo", error);
    throw error;
  }
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Articulo.findByIdAndUpdate(
    id,
    { estado: status },
    { new: true }
  );

  res.json(modelBorrado);
};

module.exports = {
  add,
  getAll,
  getById,
  getByCodigo,
  update,
  addArticulo,
  updateArticulo,
  existeArticuloByCodigo,
  changeStatus,
};
