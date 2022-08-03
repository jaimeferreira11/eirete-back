const { Router } = require("express");
const { check, query } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  getByCodigo,
  changeStatus,
} = require("../controllers/stock/articulos");
const {
  existeArticuloPorId,
  codArticuloExiste,
  existeArticuloPorDescripcion,
  existeLineaArticuloPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/articulos
 */

/**
 * @swagger
 * /articulos:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene todos los articulos
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get("/", [validarJWT, validarCampos], getAll);

/**
 * @swagger
 * /articulos/{articuloId}:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene sucursal por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: articuloId
 *        in: "path"
 *        description: "Id del sucursal"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeArticuloPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /articulos/search/codigo-barra/{codigoBarra}:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene articulos codigo de barra
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: codigoBarra
 *        in: "path"
 *        description: "Codigo de barra"
 *        required: true
 *        type: string
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/search/codigo-barra/:codigo",
  [
    validarJWT,
    query("codigo", "El codigo es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  getByCodigo
);

/**
 * @swagger
 * /articulos:
 *  post:
 *    tags: ["Stock"]
 *    summary: Crear un nuevo sucursal
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '400':
 *        description: Petición incorrecta
 *      '500':
 *        description: Error inesperado
 */
router.post(
  "/",
  [
    validarJWT,
    check("codigoBarra", "El codigo de barra debe de al menos 2 digitos")
      .optional()
      .isLength({
        min: 2,
      }),
    check("codigoBarra").optional().custom(codArticuloExiste),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("descripcion", "La descripcion debe de ser más de 3 letras").isLength(
      { min: 3 }
    ),
    check("descripcion").custom(existeArticuloPorDescripcion),
    check("precioVenta", "El precio de venta es obligatorio").not().isEmpty(),
    check(
      "precioVenta",
      "El precio de venta debe de al menos 3 digitos"
    ).isLength({
      min: 3,
    }),
    check("unidadMedida", "No es tipo de codigo válido").isIn([
      "UNIDAD",
      "GRAMO",
      "KILOGRAMO",
      "MILILITRO",
      "LITRO",
      "CENTIMETRO",
      "METRO",
      "PAQUETE",
      "CAJA",
    ]),
    check("lineaArticulo._id", "No es un id de Mongo").isMongoId(),
    check("lineaArticulo._id").custom(existeLineaArticuloPorId),
    check("tipoImpuesto", "No es un sexo válido").optional().isIn([0, 5, 10]),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /articulos/{articuloId}:
 *  put:
 *    tags: ["Stock"]
 *    summary: Actualizar un sucursal
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: articuloId
 *        in: "path"
 *        description: "Id del sucursal"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '400':
 *        description: Petición incorrecta
 *      '500':
 *        description: Error inesperado
 */
router.put(
  "/:id",
  [
    validarJWT,

    check("id").custom(existeArticuloPorId),
    check("codigoBarra", "El codigo de barra debe de al menos 2 digitos")
      .optional()
      .isLength({
        min: 2,
      }),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("descripcion", "La descripcion debe de ser más de 3 letras").isLength(
      { min: 3 }
    ),
    check("precioVenta", "El precio de venta es obligatorio").not().isEmpty(),
    check(
      "precioVenta",
      "El precio de venta debe de al menos 3 digitos"
    ).isLength({
      min: 3,
    }),
    check("unidadMedida", "No es tipo de codigo válido").isIn([
      "UNIDAD",
      "GRAMO",
      "KILOGRAMO",
      "MILILITRO",
      "LITRO",
      "CENTIMETRO",
      "METRO",
      "PAQUETE",
      "CAJA",
    ]),
    check("lineaArticulo._id", "No es un id de Mongo").isMongoId(),
    check("lineaArticulo._id").custom(existeLineaArticuloPorId),
    check("tipoImpuesto", "No es un sexo válido").optional().isIn([0, 5, 10]),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /articulos/change-status/{articuloId}/{estado}:
 *  put:
 *    tags: ["Stock"]
 *    summary: Cambiar el estado de un sucursal
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: articuloId
 *        in: "path"
 *        description: "Id del sucursal"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado del sucursal"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '400':
 *        description: Petición incorrecta
 *      '500':
 *        description: Error inesperado
 */
router.put(
  "/change-status/:id/:status",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeArticuloPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
