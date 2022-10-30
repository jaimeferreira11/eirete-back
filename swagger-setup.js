const swaggerDefinition = {
  swagger: "2.0",
  info: {
    description: "Documentacion de APIs",
    version: "1.0.6",
    title: "Proyecto Eirete",
    license: {
      name: "Apache 2.0",
      url: "http://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  host: "localhost:8080",
  basePath: "/api",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "x-token",
      scheme: "bearer",
      in: "header",
    },
  },
  security: [{ bearerAuth: [] }],

  tags: [
    {
      name: "Seguridad",
      description: "Modulos de acceso y seguridad",
    },
    {
      name: "Catastro",
      description: "",
    },
    {
      name: "Stock",
      description: " ",
    },
    {
      name: "Tesoreria",
      description: "",
    },
    {
      name: "Reportes",
      description: "",
    },
  ],
  schemes: ["http"],

  definitions: {
    Articulo: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        codigoBarra: {
          type: "string",
        },
        codigo: {
          type: "integer",
          format: "int64",
        },
        unidadMedida: {
          type: "string",
          enum: [
            "UNIDAD",
            "GRAMO",
            "KILOGRAMO",
            "MILILITRO",
            "LITRO",
            "CENTIMETRO",
            "METRO",
            "PAQUETE",
            "CAJA",
          ],
        },
        precioVenta: {
          type: "integer",
          format: "int64",
        },
        lineaArticulo: {
          $ref: "#/definitions/LineaArticulo",
        },
        tipoImpuesto: {
          type: "integer",
          format: "int64",
          enum: [0, 5, 10],
        },
        estado: {
          type: "boolean",
        },
      },
    },
    ApiResponse: {
      type: "object",
      properties: {
        code: {
          type: "integer",
          format: "int32",
        },
        type: {
          type: "string",
        },
        message: {
          type: "string",
        },
      },
    },
    Perfil: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    LineaArticulo: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    Sucursal: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    Caja: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    Usuario: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        username: {
          type: "string",
        },
        nombreApellido: {
          type: "string",
        },
        password: {
          type: "string",
        },
        rol: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
        sucursal: {
          $ref: "#/definitions/Sucursal",
        },
        perfiles: {
          type: "array",
          items: {
            $ref: "#/definitions/Perfil",
          },
        },
        caja: {
          $ref: "#/definitions/Caja",
        },
        correo: {
          type: "string",
        },
        celular: {
          type: "string",
        },
        img: {
          type: "string",
        },
      },
    },
    Persona: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        nroDoc: {
          type: "string",
        },
        nombreApellido: {
          type: "string",
        },
        tipoDoc: {
          type: "string",
          enum: ["CI", "RUC", "DNI"],
        },
        sexo: {
          type: "string",
          enum: ["F", "M"],
        },
        fechaNacimiento: {
          type: "date",
          pattern: "/([0-9]{4})-(?:[0-9]{2})-([0-9]{2})/",
          example: "2000-01-01",
        },
        direccion: {
          type: "string",
        },
        ciudad: {
          type: "string",
        },
        correo: {
          type: "string",
        },
        celular: {
          type: "string",
        },
        ruc: {
          type: "string",
        },
        obs: {
          type: "string",
        },
      },
    },
    Cliente: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        persona: {
          $ref: "#/definitions/Persona",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    Ciudad: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    CategoriaMovimiento: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
        esGasto: {
          type: "boolean",
        },
        esIngreso: {
          type: "boolean",
        },
        afectaArqueo: {
          type: "boolean",
        },
        visibleCaja: {
          type: "boolean",
        },
        afectaEstadistica: {
          type: "boolean",
        },
      },
    },
    Movimiento: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        descripcion: {
          type: "string",
        },
        monto: {
          type: "integer",
          format: "int64",
        },
        categoria: {
          $ref: "#/definitions/CategoriaMovimiento",
        },
        esGasto: {
          type: "boolean",
        },
        esIngreso: {
          type: "boolean",
        },
      },
    },
    Turno: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        nro: {
          type: "integer",
          format: "int64",
        },
        fechaApertura: {
          type: "date",
          pattern: "/([0-9]{4})-(?:[0-9]{2})-([0-9]{2})/",
          example: "2000-01-01",
        },
        fechaCierre: {
          type: "date",
          pattern: "/([0-9]{4})-(?:[0-9]{2})-([0-9]{2})/",
          example: "2000-01-01",
        },
        sucursal: {
          $ref: "#/definitions/Sucursal",
        },
        caja: {
          $ref: "#/definitions/Caja",
        },
        usuario: {
          $ref: "#/definitions/Usuario",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    Arqueo: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        turno: {
          $ref: "#/definitions/Turno",
        },
        stock: {
          type: "array",
        },
        monedas: {
          type: "array",
        },
        billetes: {
          type: "array",
        },
        totalEfectivo: {
          type: "integer",
          format: "int64",
        },
        totalDeposito: {
          type: "integer",
          format: "int64",
        },
        responsable: {
          type: "string",
        },
        estado: {
          type: "boolean",
        },
      },
    },
    UserCredencials: {
      type: "object",
      properties: {
        username: {
          type: "string",
          required: true,
        },
        password: {
          type: "string",
          required: true,
        },
      },
    },
    EstadisticaVentas: {
      type: "object",
      properties: {
        montoTotalVendido: {
          type: "integer",
          format: "int64",
        },
        montoTotalEfectivo: {
          type: "integer",
          format: "int64",
        },
        montoTotalDeposito: {
          type: "integer",
          format: "int64",
        },
        ventaPromedio: {
          type: "integer",
          format: "int64",
        },
        cantPedidos: {
          type: "integer",
          format: "int64",
        },
        cantArticulos: {
          type: "integer",
          format: "int64",
        },
      },
    },
  },
};

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./routes/*.js"],
};

const setup = (app) =>
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerJsDoc(swaggerOptions))
  );

module.exports = setup;
