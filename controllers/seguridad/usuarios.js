const { response, request } = require("express");
const bcryptjs = require("bcryptjs");

const { Usuario } = require("../../models");

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Usuario.findById(id);

  if (!modelDB) {
    return res.status(404).json({
      msg: `No existe un usuario con el id ${id}`,
    });
  }

  res.json(modelDB);
};

const usuariosGet = async (req = request, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "descripcion",
    direction = -1,
    estado = true,
    search = "",
  } = req.query;

  if (estado !== "all") query.estado = estado;

  if (search) {
    const regex = { $regex: ".*" + search + ".*", $options: "i" };
    query = {
      ...query,
      $or: [{ nombreApellido: regex }, { username: regex }],
      $and: [{ estado }],
    };
  }

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      Usuario.countDocuments(query),
      Usuario.find(query)
        .populate("perfiles", "descripcion")
        .populate("sucursal", "descripcion")
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ orderBy: direction }),
    ]);
    res.json({
      total,
      data,
    });
  } else {
    const data = await Usuario.find(query)
      .populate("perfiles", "descripcion")
      .populate("sucursal", "descripcion")
      .sort({ orderBy: direction });
    res.json(data);
  }
};

const usuariosPost = async (req, res = response) => {
  const { nombre, correo, password, rol } = req.body;
  const usuario = new Usuario(req.body);

  // Encriptar la contraseña
  const salt = bcryptjs.genSaltSync();
  usuario.password = bcryptjs.hashSync(password, salt);

  // Guardar en BD
  await usuario.save();

  res.json({
    usuario,
  });
};

const usuariosPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, password, username, rol, ...resto } = req.body;

  if (password) {
    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  const usuario = await Usuario.findByIdAndUpdate(id, resto);

  res.json(usuario);
};

const usuariosDelete = async (req, res = response) => {
  const { id } = req.params;
  const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

  res.json(usuario);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Usuario.findByIdAndUpdate(
    id,
    { estado: status },
    { new: true }
  );

  res.json(modelBorrado);
};

const usuarioByUsername = async (req, res = response) => {
  const { username } = req.params;

  const data = await Usuario.findOne({ username: username.toUpperCase() });

  if (!data) {
    return res.status(404).json({
      msg: `No existe el usuario: ${username}`,
    });
  } else {
    res.json(data);
  }
};

module.exports = {
  usuariosGet,
  usuariosPost,
  usuariosPut,
  usuariosDelete,
  getById,
  changeStatus,
  usuarioByUsername,
};
