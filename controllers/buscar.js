const { response } = require("express");
const { ObjectId } = require("mongoose").Types;

const {
  Usuario,
  Cliente,
  Caja,
  Persona,
  Articulo,
  LineaArticulo,
  Sucursal,
  Ciudad,
} = require("../models");

const coleccionesPermitidas = [
  "usuarios",
  "articulos",
  "perfiles",
  "clientes",
  "sucursales",
  "linea-articulos",
  "cajas",
  "ciudades",
];

const buscarUsuarios = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const usuario = await Usuario.findById(termino);
    return res.json({
      data: usuario ? [usuario] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const usuarios = await Usuario.find({
    $or: [{ nombreApellido: regex }, { username: regex }],
    $and: [{ estado: true }],
  });

  res.json({
    data: usuarios,
  });
};

const buscarClientes = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const data = await Cliente.findById(termino);
    return res.json({
      data: data ? [data] : [],
    });
  }

  console.log("Buscando el cliente con el termino", termino);

  const regex = new RegExp(termino, "i");

  const results = await Cliente.find({ estado: true })
    .populate("persona", "-__v")
    .then(async (customers) => {
      let clientes = [];

      await Promise.all(
        customers.map(async (d) => {
          const persona = await Persona.findOne({
            _id: d.persona,
            $or: [{ nombreApellido: regex }, { nroDoc: regex }, { ruc: regex }],
          });
          if (persona) clientes.push(d);
        })
      );

      console.log(clientes.length);
      return clientes;
    });

  res.json({
    data: results,
  });
};

const buscarVehiculos = async (tipo, termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const vehiculo = await Vehiculo.findById(termino);
    return res.json({
      data: vehiculo ? [vehiculo] : [],
    });
  }

  const regex = new RegExp(termino, "i");

  let results = [];
  switch (tipo) {
    case "chapa":
      console.log(`buscando por chapa`);
      this.results = await Vehiculo.find({ chapa: regex })
        .populate({
          path: "cliente",
          select: "-__v",
          populate: {
            path: "persona",
            select: "-__v",
          },
        })
        .populate("tipoVehiculo", "descripcion")
        .populate({
          path: "aseguradora",
          select: "-__v",
          populate: {
            path: "cliente",
            select: "-__v",
            populate: {
              path: "persona",
              select: "-__v",
            },
          },
        })
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username");

      break;

    case "cliente":
      this.results = await Vehiculo.find()
        .populate({
          path: "cliente",
          select: "-__v",
          populate: {
            path: "persona",
            select: "-__v",
          },
        })
        .populate("tipoVehiculo", "descripcion")
        .populate({
          path: "aseguradora",
          select: "-__v",
          populate: {
            path: "cliente",
            select: "-__v",
            populate: {
              path: "persona",
              select: "-__v",
            },
          },
        })
        .populate("usuarioAlta", "username")
        .populate("usuarioModif", "username")
        .then(async (vehiculos) => {
          let aux = [];

          console.log(`vehiculos ${vehiculos.length}`);
          await Promise.all(
            vehiculos.map(async (v) => {
              await Cliente.find({ estado: true, _id: v.cliente })
                .populate("persona", "-__v")
                .then(async (clientes) => {
                  console.log(`clientes: ${clientes.length}`);
                  let personas = [];

                  await Promise.all(
                    clientes.map(async (c) => {
                      const persona = await Persona.findOne({
                        _id: c.persona,
                        $or: [
                          { nombreApellido: regex },
                          { nroDoc: regex },
                          { ruc: regex },
                        ],
                      });
                      if (persona) aux.push(v);
                    })
                  );

                  return personas;
                });
            })
          );

          console.log("aux: " + aux.length);
          return aux;
        });

      break;
    default:
      break;
  }

  res.json({
    data: this.results,
  });
};

const buscarArticulos = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const articulo = await Articulo.findById(termino)
      .populate({
        path: "lineaArticulo",
        select: "-__v",
      })
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");

    return res.json({
      data: articulo ? [articulo] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const articulos = await Articulo.find({
    descripcion: regex,
    estado: true,
  })
    .populate({
      path: "lineaArticulo",
      select: "-__v",
    })
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json({
    data: articulos ? [articulos] : [],
  });
};

const buscarPerfiles = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const data = await Perfil.findById(termino);
    return res.json({
      data: data ? [data] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const lista = await Perfil.find({
    descripcion: regex,
  });

  res.json({
    data: lista ? [lista] : [],
  });
};
const buscarLineaArticulos = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino); // TRUE

  if (esMongoID) {
    const data = await LineaArticulo.findById(termino);

    return res.json({
      data: data ? [data] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const lista = await LineaArticulo.find({
    descripcion: regex,
    estado: true,
  });

  res.json({
    data: lista ? [lista] : [],
  });
};

const buscarSucursales = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino);

  if (esMongoID) {
    const data = await Sucursal.findById(termino);

    return res.json({
      data: data ? [data] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const lista = await Sucursal.find({
    $or: [{ descripcion: regex }, { ciudad: regex }, { direccion: regex }],
    $and: [{ estado: true }],
  });

  res.json({
    data: lista ? [lista] : [],
  });
};

const buscarCajas = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino);

  if (esMongoID) {
    const data = await Caja.findById(termino)
      .populate("usuarioAlta", "username")
      .populate("sucursal", "descripcion")
      .populate("usuarioModif", "username");

    return res.json({
      data: data ? [data] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const lista = await Caja.find({
    $or: [{ descripcion: regex }, { nro: regex }],
    $and: [{ estado: true }],
  })
    .populate("usuarioAlta", "username")
    .populate("sucursal", "descripcion")
    .populate("usuarioModif", "username");

  res.json({
    data: lista ? [lista] : [],
  });
};

const buscarCiudades = async (termino = "", res = response) => {
  const esMongoID = ObjectId.isValid(termino);

  if (esMongoID) {
    const data = await Ciudad.findById(termino)
      .populate("usuarioAlta", "username")
      .populate("usuarioModif", "username");

    return res.json({
      data: data ? [data] : [],
    });
  }

  const regex = new RegExp(termino, "i");
  const lista = await Ciudad.find({
    $or: [{ descripcion: regex }],
    $and: [{ estado: true }],
  })
    .populate("usuarioAlta", "username")
    .populate("usuarioModif", "username");

  res.json({
    data: lista ? [lista] : [],
  });
};

const buscar = (req, res = response) => {
  const { coleccion, termino, tipo } = req.params;

  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`,
    });
  }

  switch (coleccion) {
    case "usuarios":
      buscarUsuarios(termino, res);
      break;
    case "articulos":
      buscarArticulos(termino, res);
      break;
    case "clientes":
      buscarClientes(termino, res);
      break;
    case "linea-articulos":
      buscarLineaArticulos(termino, res);
      break;
    case "sucursales":
      buscarSucursales(termino, res);
      break;
    case "perfiles":
      buscarPerfiles(termino, res);
      break;
    case "cajas":
      buscarCajas(termino, res);
      break;
    case "ciudades":
      buscarCiudades(termino, res);
      break;

    default:
      res.status(500).json({
        msg: "Se le olvido hacer esta búsquda",
      });
  }
};

module.exports = {
  buscar,
};
