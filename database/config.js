const mongoose = require("mongoose");
const changelog = require("mongodb-changelog");
const { Usuario } = require("../models");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CNN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //    useCreateIndex: true,
      //    useFindAndModify: false,
    });

    console.log("Base de datos online");

    const config = {
      mongoUrl: process.env.MONGODB_CNN,
      mongoConnectionConfig: { useUnifiedTopology: true },
    };
    const tasks = [
      {
        name: "initDB",
        operation: () => Promise.resolve(true),
      },
      {
        name: "addRoles",
        operation: addRoles,
      },
      {
        name: "addPerfiles",
        operation: addPerfiles,
      },
      {
        name: "insertAdminUser",
        operation: insertAdminUser,
      },
      {
        name: "addSucursal",
        operation: addSucursal,
      },
      // {
      //     name: 'addFormaPagos',
      //     operation: addFormaPagos
      // },
      // {
      //     name: 'addUnidadMedida',
      //     operation: addUnidadMedida
      // },
      //   {
      //     name: "insertMenus",
      //     operation: insertMenus,
      //   },
    ];

    changelog(config, tasks);
  } catch (error) {
    console.log(error);
    throw new Error("Error a la hora de iniciar la base de datos");
  }
};

async function addRoles(db) {
  const collection = db.collection("roles");
  await collection.insertOne({ rol: "ROOT_ROLE" });
  await collection.insertOne({ rol: "ADMIN_ROLE" });
  await collection.insertOne({ rol: "USER_ROLE" });
}

async function addPerfiles(db) {
  const collection = db.collection("perfils");
  await collection.insertOne({ descripcion: "ADMINISTRADOR DE SISTEMA" });
  await collection.insertOne({ descripcion: "ADMINISTRACION" });
}

async function addFormaPagos(db) {
  const collection = db.collection("formpagos");
  await collection.insertOne({ descripcion: "CONTADO", tipo: "EF" });
  await collection.insertOne({ descripcion: "CREDITO", tipo: "CR" });
  await collection.insertOne({ descripcion: "CREDITO CHEQUE", tipo: "CH" });
  await collection.insertOne({ descripcion: "CREDITO PAGARE", tipo: "PA" });
  await collection.insertOne({ descripcion: "CONSIGANACION", tipo: "CO" });
}

async function addUnidadMedida(db) {
  const collection = db.collection("unidadmedidas");
  await collection.insertOne({ descripcion: "UNIDAD" });
  await collection.insertOne({ descripcion: "KILOGRAMO" });
  await collection.insertOne({ descripcion: "GRAMO" });
  await collection.insertOne({ descripcion: "LITRO" });
  await collection.insertOne({ descripcion: "MILILITRO" });
  await collection.insertOne({ descripcion: "METRO" });
  await collection.insertOne({ descripcion: "CENTIMETRO" });
}

async function insertAdminUser(db) {
  const perfilesCollections = await db.collection("perfils");

  const usuariosCollections = await db.collection("usuarios");
  const idUserAdmin = mongoose.Types.ObjectId();

  const perfilAdmin = await perfilesCollections.findOne({
    descripcion: "ADMINISTRADOR DE SISTEMA",
  });

  await usuariosCollections.insertOne({
    _id: idUserAdmin,
    rol: "ROOT_ROLE",
    estado: true,
    perfiles: [perfilAdmin._id],
    username: "admin",
    nombreApellido: "Administrador",
    password: "$2a$10$Zn626WTlbVt3J2EVg0t7T.d32ZiE/zfFhiC4yiRqplgQr0YNxTQMm", // 123456
  });
}

async function addSucursal(db) {
  const collectionSuc = db.collection("sucursals");

  const usuarioCollection = await db.collection("usuarios");
  const usuario = await usuarioCollection.findOne({ username: "admin" });

  const idSucursal = mongoose.Types.ObjectId();
  const sucursalData = {
    _id: idSucursal,
    descripcion: "MATRIZ",
    direccion: "xxx",
    ciudad: "Asunción",
    timbrado: "12345678",
    establecimiento: 1,
    puntoExpedicion: 1,
    rangoFinal: 9999999,
    rangoInicial: 1,
    nroActual: 1,
    usuarioAlta: usuario._id,
    fechaAlta: new Date(),
    estado: true,
  };

  await collectionSuc.insertOne(sucursalData);
  await Usuario.findByIdAndUpdate(usuario._id, {
    sucursal: idSucursal,
    ...usuario,
  });
}

async function insertMenus(db) {
  const menusCollections = await db.collection("menus");
  const programasCollections = await db.collection("programas");
  const perfilesCollections = await db.collection("perfils");
  const perfilAdmin = await perfilesCollections.findOne({
    descripcion: "ADMINISTRADOR DE SISTEMA",
  });

  const idProgramaCliente = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaCliente,
    descripcion: "Clientes",
    icono: "users",
    url: "/dashboard/clientes",
    orden: 1,
    estado: true,
  });

  const idProgramaVehiculo = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaVehiculo,
    descripcion: "Vehículos",
    icono: "car",
    url: "/dashboard/vehiculos",
    orden: 2,
    estado: true,
  });

  const idProgramaAseguradoras = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaAseguradoras,
    descripcion: "Aseguradoras",
    icono: "shieldAlt",
    url: "",
    orden: 3,
    estado: true,
  });
  const idProgramaProveedores = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaProveedores,
    descripcion: "Proveedores",
    icono: "shippingFast",
    url: "",
    orden: 4,
    estado: true,
  });

  // insertar el menu
  await menusCollections.insertOne({
    descripcion: "Catastro",
    perfil: perfilAdmin._id,
    icono: "",
    orden: 1,
    programas: [
      idProgramaCliente,
      idProgramaVehiculo,
      idProgramaAseguradoras,
      idProgramaProveedores,
    ],
  });

  const idProgramaPresupuesto = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaPresupuesto,
    descripcion: "Presupuestos",
    icono: "file-invoice-dollar",
    url: "/dashboard/presupuestos",
    orden: 1,
    estado: true,
  });

  const idProgramaOT = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaOT,
    descripcion: "Orden de trabajo(OT)",
    icono: "building",
    url: "/dashboard/orden-trabajo",
    orden: 2,
    estado: true,
  });

  // insertar el menu
  await menusCollections.insertOne({
    descripcion: "Operativo",
    perfil: perfilAdmin._id,
    icono: "",
    orden: 2,
    programas: [idProgramaPresupuesto, idProgramaOT],
  });

  const idProgramaFactura = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaFactura,
    descripcion: "Facturar OT",
    icono: "file-invoice-dollar",
    url: "/dashboard/facturar-ot",
    orden: 1,
    estado: true,
  });

  const idProgramaVentaRapida = mongoose.Types.ObjectId();
  await programasCollections.insertOne({
    _id: idProgramaVentaRapida,
    descripcion: "Factura rápida",
    icono: "search-dollar",
    url: "/dashboard/venta-rapida",
    orden: 2,
    estado: true,
  });

  // insertar el menu
  await menusCollections.insertOne({
    descripcion: "Facturación",
    perfil: perfilAdmin._id,
    icono: "",
    orden: 3,
    programas: [idProgramaFactura, idProgramaVentaRapida],
  });
}

module.exports = {
  dbConnection,
};
