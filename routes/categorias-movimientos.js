const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  changeStatus,
} = require("../controllers/tesoreria/categoria-movimientos");
const {
  existeSucursalPorId,
  existeCategoriaMovimientoPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * @swagger
 * /categorias-movimientos:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene todos los categorias
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/CategoriaMovimiento"
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
 * /categorias-movimientos/{categoraId}:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene categoria por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: categoraId
 *        in: "path"
 *        description: "Id de la categoria"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/CategoriaMovimiento"
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
    check("id").custom(existeCategoriaMovimientoPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /categorias-movimientos:
 *  post:
 *    tags: ["Tesoreria"]
 *    summary: Crear una nuevo categoria
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/CategoriaMovimiento"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/CategoriaMovimiento"
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
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("esEgreso", "El esGreso debe ser boolean").optional().isBoolean(),
    check("esIngreso", "El esIngreso debe ser boolean").optional().isBoolean(),
    check("visibleCaja", "El visibleCaja debe ser boolean")
      .optional()
      .isBoolean(),
    check("afectaArqueo", "El afectaArqueo debe ser boolean")
      .optional()
      .isBoolean(),
    check("afectaEstadistica", "El afectaEstadistica debe ser boolean")
      .optional()
      .isBoolean(),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /categorias-movimientos/{categoriaId}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Actualizar un categoria
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: categoriaId
 *        in: "path"
 *        description: "Id del categoria"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/CategoriaMovimiento"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/CategoriaMovimiento"
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
    check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
    check("id", "No es un id de Mongo").isMongoId(),
    check("id").custom(existeCategoriaMovimientoPorId),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /categorias-movimientos/change-status/{categoraId}/{estado}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Cambiar el estado de una categoria movimiento
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: categoraId
 *        in: "path"
 *        description: "Id de la categoria movimiento"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado de la categoria movimiento"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/CategoriaMovimiento"
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
    check("id").custom(existeCategoriaMovimientoPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
