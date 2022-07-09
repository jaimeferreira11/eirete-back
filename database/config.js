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
      {
        name: "addCiudades",
        operation: insertCiudades,
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

async function insertCiudades(db) {
  const ciudadesCollections = await db.collection("ciudads");

  await ciudadesCollections.insertMany([
    { descripcion: "ASUNCIÓN", estado: true },
    { descripcion: "CIUDAD DEL ESTE", estado: true },
    { descripcion: "LUQUE", estado: true },
    { descripcion: "SAN LORENZO", estado: true },
    { descripcion: "CAPIATÁ", estado: true },
    { descripcion: "LAMBARÉ", estado: true },
    { descripcion: "FERNANDO DE LA MORA", estado: true },
    { descripcion: "LIMPIO", estado: true },
    { descripcion: "ÑEMBY", estado: true },
    { descripcion: "ENCARNACIÓN", estado: true },
    { descripcion: "CAAGUAZÚ", estado: true },
    { descripcion: "CORONEL OVIEDO", estado: true },
    { descripcion: "PEDRO JUAN CABALLERO", estado: true },
    { descripcion: "ITAUGUÁ", estado: true },
    { descripcion: "PRESIDENTE FRANCO", estado: true },
    { descripcion: "MARIANO ROQUE ALONSO", estado: true },
    { descripcion: "MINGA GUAZÚ", estado: true },
    { descripcion: "CONCEPCIÓN", estado: true },
    { descripcion: "ITÁ", estado: true },
    { descripcion: "VILLA ELISA", estado: true },
    { descripcion: "HERNANDARIAS", estado: true },
    { descripcion: "AREGUÁ", estado: true },
    { descripcion: "VILLARRICA", estado: true },
    { descripcion: "SAN ANTONIO", estado: true },
    { descripcion: "HORQUETA", estado: true },
    { descripcion: "CAMBYRETÁ", estado: true },
    { descripcion: "CURUGUATY", estado: true },
    { descripcion: "YPANÉ", estado: true },
    { descripcion: "CAACUPÉ", estado: true },
    { descripcion: "SAN ESTANISLAO", estado: true },
    { descripcion: "JULIÁN AUGUSTO SALDÍVAR", estado: true },
    { descripcion: "VILLA HAYES", estado: true },
    { descripcion: "CAPIIBARY", estado: true },
    { descripcion: "SANTA ROSA DEL AGUARAY", estado: true },
    { descripcion: "VILLETA", estado: true },
    { descripcion: "SALTO DEL GUAIRÁ", estado: true },
    { descripcion: "SAN JUAN NEPOMUCENO", estado: true },
    { descripcion: "GUARAMBARÉ", estado: true },
    { descripcion: "DOCTOR JUAN EULOGIO ESTIGARRIBIA", estado: true },
    { descripcion: "ITAKYRY", estado: true },
    { descripcion: "CARAPEGUÁ", estado: true },
    { descripcion: "SANTA RITA", estado: true },
    { descripcion: "SAN PEDRO DE YCUAMANDIYÚ", estado: true },
    { descripcion: "SAN IGNACIO GUAZÚ", estado: true },
    { descripcion: "YHÚ", estado: true },
    { descripcion: "YBY YAÚ", estado: true },
    { descripcion: "SAN PEDRO DEL PARANÁ", estado: true },
    { descripcion: "TOBATÍ", estado: true },
    { descripcion: "REPATRIACIÓN", estado: true },
    { descripcion: "PILAR", estado: true },
    { descripcion: "ABAÍ", estado: true },
    { descripcion: "YAGUARÓN", estado: true },
    { descripcion: "GUAYAIBÍ", estado: true },
    { descripcion: "PIRIBEBUY", estado: true },
    { descripcion: "MARISCAL JOSÉ FÉLIX ESTIGARRIBIA", estado: true },
    { descripcion: "CHORÉ", estado: true },
    { descripcion: "TOMÁS ROMERO PEREIRA", estado: true },
    { descripcion: "YPACARAÍ", estado: true },
    { descripcion: "TENIENTE PRIMERO MANUEL IRALA FERNÁNDEZ", estado: true },
    { descripcion: "YASY CAÑY", estado: true },
    { descripcion: "INDEPENDENCIA", estado: true },
    { descripcion: "PASO YOBÁI", estado: true },
    { descripcion: "JUAN EMILIANO O'LEARY", estado: true },
    { descripcion: "CAAZAPÁ", estado: true },
    { descripcion: "ARROYOS Y ESTEROS", estado: true },
    { descripcion: "YBYCUÍ", estado: true },
    { descripcion: "LIBERACIÓN", estado: true },
    { descripcion: "DOCTOR JUAN MANUEL FRUTOS", estado: true },
    { descripcion: "GENERAL ISIDORO RESQUÍN", estado: true },
    { descripcion: "EUSEBIO AYALA", estado: true },
    { descripcion: "SAN JUAN BAUTISTA", estado: true },
    { descripcion: "EDELIRA", estado: true },
    { descripcion: "PARAGUARÍ", estado: true },
    { descripcion: "GENERAL ELIZARDO AQUINO", estado: true },
    { descripcion: "YUTY", estado: true },
    { descripcion: "SAN RAFAEL DEL PARANÁ", estado: true },
    { descripcion: "DOCTOR JUAN LEÓN MALLORQUÍN", estado: true },
    { descripcion: "QUIINDY", estado: true },
    { descripcion: "CORONEL JOSÉ FÉLIX BOGADO", estado: true },
    { descripcion: "BENJAMÍN ACEVAL", estado: true },
    { descripcion: "NATALIO", estado: true },
    { descripcion: "EMBOSCADA", estado: true },
    { descripcion: "SAN JOSÉ DE LOS ARROYOS", estado: true },
    { descripcion: "TRES DE MAYO", estado: true },
    { descripcion: "CARLOS ANTONIO LÓPEZ", estado: true },
    { descripcion: "FILADELFIA", estado: true },
    { descripcion: "AYOLAS", estado: true },
    { descripcion: "TAVAÍ", estado: true },
    { descripcion: "CAPITÁN BADO", estado: true },
    { descripcion: "LORETO", estado: true },
    { descripcion: "SANTA ROSA DE LIMA", estado: true },
    { descripcion: "ALTO VERÁ", estado: true },
    { descripcion: "SAN JOAQUÍN", estado: true },
    { descripcion: "PIRAYÚ", estado: true },
    { descripcion: "BELLA VISTA NORTE", estado: true },
    { descripcion: "VILLA YGATIMÍ", estado: true },
    { descripcion: "OBLIGADO", estado: true },
    { descripcion: "RAÚL ARSENIO OVIEDO", estado: true },
    { descripcion: "LOMA PLATA", estado: true },
    { descripcion: "ATYRÁ", estado: true },
    { descripcion: "ITAPÚA POTY", estado: true },
    { descripcion: "YRYBUCUÁ", estado: true },
    { descripcion: "TACUATÍ", estado: true },
    { descripcion: "ACAHAY", estado: true },
    { descripcion: "CARAYAÓ", estado: true },
    { descripcion: "HOHENAU", estado: true },
    { descripcion: "MAYOR OTAÑO", estado: true },
    { descripcion: "MINGA PORÁ", estado: true },
    { descripcion: "BELLA VISTA", estado: true },
    { descripcion: "TEMBIAPORÁ", estado: true },
    { descripcion: "CAPITÁN MEZA", estado: true },
    { descripcion: "ALTOS", estado: true },
    { descripcion: "MBUYAPEY", estado: true },
    { descripcion: "CAPITÁN MIRANDA", estado: true },
    { descripcion: "YBYRAROBANÁ", estado: true },
    { descripcion: "CARAGUATAY", estado: true },
    { descripcion: "YATYTAY", estado: true },
    { descripcion: "BELÉN", estado: true },
    { descripcion: "GENERAL ARTIGAS", estado: true },
    { descripcion: "SANTA ROSA DEL MBUTUY", estado: true },
    { descripcion: "NUEVA ESPERANZA", estado: true },
    { descripcion: "NUEVA ITALIA", estado: true },
    { descripcion: "SAN ROQUE GONZÁLEZ DE SANTA CRUZ", estado: true },
    { descripcion: "YATAITY DEL NORTE", estado: true },
    { descripcion: "SAN BERNARDINO", estado: true },
    { descripcion: "LIMA", estado: true },
    { descripcion: "PUERTO PINASCO", estado: true },
    { descripcion: "GENERAL FRANCISCO CABALLERO ÁLVAREZ", estado: true },
    { descripcion: "SAN LÁZARO", estado: true },
    { descripcion: "VAQUERÍA", estado: true },
    { descripcion: "YBY PYTÁ", estado: true },
    { descripcion: "SAN ALBERTO", estado: true },
    { descripcion: "ITACURUBÍ DEL ROSARIO", estado: true },
    { descripcion: "JOSÉ DOMINGO OCAMPOS", estado: true },
    { descripcion: "YGUAZÚ", estado: true },
    { descripcion: "SAN CRISTÓBAL", estado: true },
    { descripcion: "CAPITÁN MAURICIO JOSÉ TROCHE", estado: true },
    { descripcion: "ITACURUBÍ DE LA CORDILLERA", estado: true },
    { descripcion: "FRAM", estado: true },
    { descripcion: "VILLA DEL ROSARIO", estado: true },
    { descripcion: "SAN COSME Y DAMIÁN", estado: true },
    { descripcion: "BORJA", estado: true },
    { descripcion: "LOS CEDRALES", estado: true },
    { descripcion: "25 DE DICIEMBRE", estado: true },
    { descripcion: "TRES DE FEBRERO", estado: true },
    { descripcion: "TRINIDAD", estado: true },
    { descripcion: "SAN JUAN DEL PARANÁ", estado: true },
    { descripcion: "CORPUS CHRISTI", estado: true },
    { descripcion: "DOCTOR RAÚL PEÑA", estado: true },
    { descripcion: "REGIMIENTO DE INFANTERÍA TRES CORRALES", estado: true },
    { descripcion: "ALBERDI", estado: true },
    { descripcion: "PIRAPÓ", estado: true },
    { descripcion: "AZOTEY", estado: true },
    { descripcion: "ÑACUNDAY", estado: true },
    { descripcion: "CARMEN DEL PARANÁ", estado: true },
    { descripcion: "SANTA MARÍA DE FE", estado: true },
    { descripcion: "LA PALOMA DEL ESPÍRITU SANTO", estado: true },
    { descripcion: "MBOCAYATY DEL GUAIRÁ", estado: true },
    { descripcion: "YPEJHÚ", estado: true },
    { descripcion: "ITURBE", estado: true },
    { descripcion: "KATUETÉ", estado: true },
    { descripcion: "MBARACAYÚ", estado: true },
    { descripcion: "ESCOBAR", estado: true },
    { descripcion: "GENERAL EUGENIO ALEJANDRINO GARAY", estado: true },
    { descripcion: "TAVAPY", estado: true },
    { descripcion: "CAAPUCÚ", estado: true },
    { descripcion: "DOCTOR CECILIO BÁEZ", estado: true },
    { descripcion: "GENERAL DELGADO", estado: true },
    { descripcion: "ZANJA PYTÁ", estado: true },
    { descripcion: "ISLA PUCÚ", estado: true },
    { descripcion: "ITAPÉ", estado: true },
    { descripcion: "NUEVA ALBORADA", estado: true },
    { descripcion: "SANTA ROSA DEL MONDAY", estado: true },
    { descripcion: "QUYQUYHÓ", estado: true },
    { descripcion: "YBYTYMÍ", estado: true },
    { descripcion: "NUEVA GERMANIA", estado: true },
    { descripcion: "CORONEL MARTÍNEZ", estado: true },
    { descripcion: "GENERAL BERNARDINO CABALLERO", estado: true },
    { descripcion: "UNIÓN", estado: true },
    { descripcion: "SARGENTO JOSÉ FÉLIX LÓPEZ", estado: true },
    { descripcion: "MARISCAL FRANCISCO SOLANO LÓPEZ", estado: true },
    { descripcion: "VALENZUELA", estado: true },
    { descripcion: "JUAN DE MENA", estado: true },
    { descripcion: "JOSÉ A. FASSARDI", estado: true },
    { descripcion: "FULGENCIO YEGROS", estado: true },
    { descripcion: "SAPUCAI", estado: true },
    { descripcion: "PUERTO CASADO", estado: true },
    { descripcion: "PRIMERO DE MARZO", estado: true },
    { descripcion: "SANTIAGO", estado: true },
    { descripcion: "SIMÓN BOLÍVAR", estado: true },
    { descripcion: "FÉLIX PÉREZ CARDOZO", estado: true },
    { descripcion: "JESÚS", estado: true },
    { descripcion: "GENERAL HIGINIO MORÍNIGO", estado: true },
    { descripcion: "IRUÑA", estado: true },
    { descripcion: "BUENA VISTA", estado: true },
    { descripcion: "SAN MIGUEL", estado: true },
    { descripcion: "NANAWA", estado: true },
    { descripcion: "SAN JUAN BAUTISTA DEL ÑEEMBUCÚ", estado: true },
    { descripcion: "SAN ALFREDO", estado: true },
    { descripcion: "NARANJAL", estado: true },
    { descripcion: "DOCTOR MOISÉS SANTIAGO BERTONI", estado: true },
    { descripcion: "LA COLMENA", estado: true },
    { descripcion: "CERRITO", estado: true },
    { descripcion: "DOMINGO MARTÍNEZ DE IRALA", estado: true },
    { descripcion: "KARAPAÍ", estado: true },
    { descripcion: "LA PASTORA", estado: true },
    { descripcion: "NATALICIO TALAVERA", estado: true },
    { descripcion: "NUEVA TOLEDO", estado: true },
    { descripcion: "SANTA ELENA", estado: true },
    { descripcion: "NUEVA LONDRES", estado: true },
    { descripcion: "MACIEL", estado: true },
    { descripcion: "YATAITY DEL GUAIRÁ", estado: true },
    { descripcion: "JOSÉ LEANDRO OVIEDO", estado: true },
    { descripcion: "TEBICUARYMÍ", estado: true },
    { descripcion: "CAPITÁN CARMELO PERALTA", estado: true },
    { descripcion: "FUERTE OLIMPO", estado: true },
    { descripcion: "SAN JOSÉ OBRERO", estado: true },
    { descripcion: "ANTEQUERA", estado: true },
    { descripcion: "MAYOR JOSÉ MARTÍNEZ", estado: true },
    { descripcion: "JOSÉ FALCÓN", estado: true },
    { descripcion: "MBOCAYATY DEL YHAGUY", estado: true },
    { descripcion: "PASO BARRETO", estado: true },
    { descripcion: "SANTA FE DEL PARANÁ", estado: true },
    { descripcion: "GENERAL JOSÉ EDUVIGIS DÍAZ", estado: true },
    { descripcion: "TACUARAS", estado: true },
    { descripcion: "NUEVA COLOMBIA", estado: true },
    { descripcion: "VILLA OLIVA", estado: true },
    { descripcion: "VILLA FLORIDA", estado: true },
    { descripcion: "SAN PATRICIO", estado: true },
    { descripcion: "SAN PABLO", estado: true },
    { descripcion: "LOMA GRANDE", estado: true },
    { descripcion: "LAURELES", estado: true },
    { descripcion: "TENIENTE ESTEBAN MARTÍNEZ", estado: true },
    { descripcion: "ITANARÁ", estado: true },
    { descripcion: "ÑUMÍ", estado: true },
    { descripcion: "GENERAL JOSÉ MARÍA BRUGUEZ", estado: true },
    { descripcion: "LA PAZ", estado: true },
    { descripcion: "TEBICUARY", estado: true },
    { descripcion: "HUMAITÁ", estado: true },
    { descripcion: "ISLA UMBÚ", estado: true },
    { descripcion: "SAN SALVADOR", estado: true },
    { descripcion: "YABEBYRY", estado: true },
    { descripcion: "BAHÍA NEGRA", estado: true },
    { descripcion: "VILLALBÍN", estado: true },
    { descripcion: "GUAZÚ CUÁ", estado: true },
    { descripcion: "PASO DE PATRIA", estado: true },
    { descripcion: "DESMOCHADOS", estado: true },
    { descripcion: "DOCTOR BOTTRELL", estado: true },
    { descripcion: "VILLA FRANCA", estado: true },
    { descripcion: "SAN CARLOS DEL APA", estado: true },
    { descripcion: "MARACANÁ", estado: true },
    { descripcion: "MARÍA ANTONIA", estado: true },
    { descripcion: "SAN VICENTE PANCHOLO", estado: true },
    { descripcion: "ARROYITO", estado: true },
    { descripcion: "NUEVA ASUNCIÓN", estado: true },
    { descripcion: "PASO HORQUETA", estado: true },
    { descripcion: "CERRO CORÁ", estado: true },
    { descripcion: "CAMPO ACEVAL", estado: true },
    { descripcion: "LAUREL", estado: true },
    { descripcion: "SAN JOSÉ DEL ROSARIO", estado: true },
    { descripcion: "BOQUERÓN", estado: true },
  ]);
}

module.exports = {
  dbConnection,
};
