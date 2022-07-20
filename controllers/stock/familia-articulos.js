const { response } = require("express");
const { FamiliaArticulo } = require("../../models");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "descripcion",
    direction = -1,
    estado = true,
    search = "",
  } = req.query;
  const query = { estado };

  if (search)
    query.descripcion = { $regex: ".*" + search + ".*", $options: "i" };

  if (paginado === "true") {
    const [total, data] = await Promise.all([
      FamiliaArticulo.countDocuments(query),
      FamiliaArticulo.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ orderBy: direction }),
    ]);

    res.json({
      total,
      data,
    });
  } else {
    const data = await FamiliaArticulo.find(query).sort({ orderBy: direction });
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await FamiliaArticulo.findById(id);

  res.json(modelDB);
};

const add = async (req, res = response) => {
  const descripcion = req.body.descripcion.toUpperCase();

  const modelDB = await FamiliaArticulo.findOne({ descripcion });

  if (modelDB) {
    return res.status(400).json({
      msg: `La Familia ${modelDB.descripcion}, ya existe`,
    });
  }
  const data = {
    descripcion,
  };

  const newModel = new FamiliaArticulo(data);

  // Guardar DB
  await newModel.save();

  res.json(newModel);
};

const update = async (req, res = response) => {
  const { id } = req.params;
  const { estado, ...data } = req.body;

  data.descripcion = data.descripcion.toUpperCase();
  //  data.usuario = req.usuario._id;

  const newModel = await FamiliaArticulo.findByIdAndUpdate(id, data, {
    new: true,
  });

  res.json(newModel);
};

const inactivate = async (req, res = response) => {
  const { id } = req.params;
  const modelBorrado = await FamiliaArticulo.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json(modelBorrado);
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await FamiliaArticulo.findByIdAndUpdate(
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
  update,
  inactivate,
  changeStatus,
};
