const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { dbConnection } = require("../database/config");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    this.paths = {
      auth: "/api/auth",
      buscar: "/api/buscar",
      perfiles: "/api/perfiles",
      menus: "/api/menus",
      usuarios: "/api/usuarios",
      uploads: "/api/uploads",
      personas: "/api/personas",
      clientes: "/api/clientes",
      sucursales: "/api/sucursales",
      lineaArticulos: "/api/linea-articulos",
      familiaArticulos: "/api/familia-articulos",
      articulos: "/api/articulos",
    };

    // Conectar a base de datos
    this.conectarDB();

    // Middlewares
    this.middlewares();

    // Rutas de mi aplicación
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Lectura y parseo del body
    this.app.use(express.json());

    // Directorio Público
    this.app.use(express.static("public"));

    // Fileupload - Carga de archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    );
  }

  routes() {
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.buscar, require("../routes/buscar"));
    this.app.use(this.paths.menus, require("../routes/menus"));
    this.app.use(this.paths.perfiles, require("../routes/perfiles"));
    this.app.use(this.paths.usuarios, require("../routes/usuarios"));
    this.app.use(this.paths.clientes, require("../routes/clientes"));
    this.app.use(this.paths.personas, require("../routes/personas"));
    this.app.use(this.paths.sucursales, require("../routes/sucursales"));
    this.app.use(this.paths.uploads, require("../routes/uploads"));
    this.app.use(
      this.paths.lineaArticulos,
      require("../routes/linea-articulos")
    );
    this.app.use(
      this.paths.familiaArticulos,
      require("../routes/familia-articulos")
    );
    this.app.use(this.paths.articulos, require("../routes/articulos"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Servidor corriendo en puerto", this.port);
    });
  }
}

module.exports = Server;
