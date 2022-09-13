const { response } = require("express");
const { Cliente, Persona } = require("../../models");
const { updatePersona, obtenerPersonaByNroDoc } = require("./personas");
const ObjectId = require("mongoose").Types.ObjectId;

const { skipAcentAndSpace } = require("../../helpers/strings-helper");

const getAll = async (req, res = response) => {
  const {
    limite = 10,
    desde = 0,
    paginado = true,
    orderBy = "persona.nombreApellido",
    direction = -1,
    estado = true,
    search = "",
  } = req.query;

  let query = {};

  if (estado && estado !== "all") query.estado = estado;

  if (search) {
    const regex = {
      $regex: ".*" + skipAcentAndSpace(search) + ".*",
      $options: "i",
    };

    const results = await Cliente.find(query)
      .populate("persona", "-__v")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username")
      .sort({ [orderBy]: direction })
      .then(async (customers) => {
        let clientes = [];

        await Promise.all(
          customers.map(async (d) => {
            const persona = await Persona.findOne({
              _id: d.persona,
              $or: [{ nombreApellido: regex }, { nroDoc: regex }],
            });
            if (persona) clientes.push(d);
          })
        );

        console.log("clientes encontrados", clientes.length);
        return clientes;
      });

    return res.json({
      total: results.length,
      data: results,
    });
  }

  if (paginado) {
    const [total, data] = await Promise.all([
      Cliente.countDocuments(query),
      Cliente.find(query)
        .populate("persona", "-__v")
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
    const data = await Cliente.find(query)
      .populate("persona", "-__v")
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");
    res.json(data);
  }
};

const getById = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Cliente.findById(id)
    .populate("persona", "-__v")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json(modelDB);
};

const getByPersonaId = async (req, res = response) => {
  const { id } = req.params;
  const modelDB = await Cliente.findOne({ persona: ObjectId(id) })
    .populate("persona", "-__v")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  if (!modelDB) {
    return res.status(404).json({
      msg: `La personas con id ${id} no es cliente`,
    });
  }

  res.json(modelDB);
};

const getByPersonaDoc = async (req, res = response) => {
  const { doc } = req.params;

  const persona = await obtenerPersonaByNroDoc(doc);
  if (!persona) {
    return res.status(404).json({
      msg: `El Cliente con doc ${doc} no existe`,
    });
  }
  console.log(persona);
  const modelDB = await Cliente.findOne({ persona: persona._id })
    .populate("persona", "-__v")
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  if (!modelDB) {
    return res.status(404).json({
      msg: `El Cliente con doc ${doc} no existe`,
    });
  }

  res.json(modelDB);
};

const add = async (req, res = response) => {
  try {
    const { _id } = req.body;
    if (_id) {
      const modelDB = await Cliente.findById(_id);
      if (modelDB) {
        return res.status(400).json({
          msg: `El Cliente ${modelDB.persona.nombreApellido}, ya existe`,
        });
      }
    }

    // Generar la data a guardar
    let personaData = req.body.persona;
    personaData.usuarioAlta = req.usuario._id;
    personaData.nombreApellido = req.body.persona.nombreApellido.toUpperCase();

    console.log(req.body.persona.nroDoc.toUpperCase());
    // buscar si ya existe un cliente con esa persona
    const personaClienteDB = await Persona.findOne({
      nroDoc: req.body.persona.nroDoc.toUpperCase(),
    });
    if (personaClienteDB) {
      console.log("Encontro la persona", personaClienteDB._id);
      // Verificar si la persona existe
      personaData._id = personaClienteDB._id;
    }

    let idCliente;
    if (!personaData._id) {
      console.log("Insertando persona");
      let newPersona = new Persona(personaData);
      await newPersona.save();
    } else {
      console.log("Ya existe la persona");
      // actualizar persona
      const personaUpdated = await Persona.findByIdAndUpdate(
        personaData._id,
        personaData,
        { new: true }
      );
      const clienteDB = await Cliente.findOne({
        persona: ObjectId(personaUpdated._id),
      });
      if (clienteDB) {
        idCliente = clienteDB._id;
        console.log("Existe el cliente, setear el id ");
      }
    }

    const persona = await Persona.findOne({ nroDoc: personaData.nroDoc });
    if (idCliente) {
      // actualizar
      const clienteData = {
        _id: idCliente,
        ...req.body,
        persona: persona._id,
        usuarioAlta: req.usuario._id,
      };
      res.json(
        await Cliente.findByIdAndUpdate(idCliente, clienteData, { new: true })
      );
    } else {
      console.log("Insertando el cliente ");

      const clienteData = {
        ...req.body,
        _id: new ObjectId(),
        persona: persona._id,
        usuarioAlta: req.usuario._id,
      };

      if (persona.direccion) {
        console.log("Armando la direccion");
        const direccion = {
          direccion: persona.direccion,
          ciudad: persona.ciudad,
          predeterminado: true,
          contacto: persona.celular,
          obs: persona.obs,
        };
        clienteData.direcciones = [direccion];
      }
      const newModel = new Cliente(clienteData);

      // Guardar DB
      await newModel.save();

      res.json(newModel);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: `Hable con el administrador`,
    });
  }
};

const update = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { usuarioAlta, fechaAlta, nroDoc, tipoDoc, ...data } = req.body;

    data.usuarioModif = req.usuario._id;
    data.fechaModif = Date.now();

    await updatePersona(data.persona, req.usuario._id);

    if (data.persona.direccion) {
      console.log("Armando la direccion");
      const direccion = {
        direccion: data.persona.direccion,
        ciudad: data.persona.ciudad,
        predeterminado: true,
        contacto: data.persona.celular,
        obs: data.persona.obs,
      };
      data.direcciones = [direccion];
    }

    const newModel = await Cliente.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);
  } catch (error) {
    res.status(400).json({ msg: `Error al actualizar el cliente: ${error}` });
  }
};

const updateDirecciones = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { direcciones = [] } = req.body;

    const data = await Cliente.findById(id);
    data.usuarioModif = req.usuario._id;
    data.fechaModif = Date.now();
    data.direcciones = direcciones;

    if (data.direcciones.filter((d) => d.predeterminado).length > 1) {
      data.direcciones.forEach((d) => (d.predeterminado = false));
      data.direcciones[0].predeterminado = true;
    }

    const newModel = await Cliente.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);
  } catch (error) {
    res.status(400).json({
      msg: `Error al actualizar las direcciones del cliente: ${error}`,
    });
  }
};

const changeStatus = async (req, res = response) => {
  const { id, status } = req.params;
  const modelBorrado = await Cliente.findByIdAndUpdate(
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
  getByPersonaId,
  update,
  changeStatus,
  getByPersonaDoc,
  updateDirecciones,
};
