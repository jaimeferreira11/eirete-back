const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  changeStatus,
} = require("../controllers/tesoreria/cajas");
const {
  existeSucursalPorId,
  existeCajaPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * @swagger
 * /cajas:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene todos los cajas
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Caja"
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
 * /cajas/{cajaId}:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene caja por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: cajaId
 *        in: "path"
 *        description: "Id de la caja"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Caja"
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
    check("id").custom(existeCajaPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /cajas:
 *  post:
 *    tags: ["Tesoreria"]
 *    summary: Crear una nuevo caja
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Caja"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Caja"
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
    check("sucursal._id", "No es un id de Mongo").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /cajas/{cajaId}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Actualizar un caja
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: cajaId
 *        in: "path"
 *        description: "Id del caja"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Caja"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Caja"
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
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeCajaPorId),
    check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
    check("sucursal._id", "No es un id de Mongo").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /cajas/change-status/{cajaId}/{estado}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Cambiar el estado de una caja
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: cajaId
 *        in: "path"
 *        description: "Id de lacaja"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado de la caja"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Caja"
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
    check("id").custom(existeCajaPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
