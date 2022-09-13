const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  getTurnoActivoByUser,
  update,
  changeStatus,
} = require("../controllers/tesoreria/turnos");
const {
  existeSucursalPorId,
  existeTurnoPorId,
  existeUsuarioPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * @swagger
 * /turnos:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene todos los turnos
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Turno"
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
 * /turnos/{turnoId}:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene turno por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: turnoId
 *        in: "path"
 *        description: "Id de la turno"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Turno"
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
    check("id").custom(existeTurnoPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /turnos/usuario/activo:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene el turno activo del usuario logueado
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: turnoId
 *        in: "path"
 *        description: "Id de la turno"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Turno"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/usuario/activo",
  [validarJWT, validarCampos],
  getTurnoActivoByUser
);

/**
 * @swagger
 * /turnos:
 *  post:
 *    tags: ["Tesoreria"]
 *    summary: Crear una nuevo turno
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Turno"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Turno"
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
    // va tomar del login
    // check("sucursal._id", "No es un id de Mongo").isMongoId(),
    // check("sucursal._id").custom(existeSucursalPorId),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /turnos/{turnoId}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Actualizar un turno
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: turnoId
 *        in: "path"
 *        description: "Id del turno"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Turno"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Turno"
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
    check("id").custom(existeTurnoPorId),
    check("sucursal._id", "No es un id de Mongo").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    check("fechaCierre").notEmpty().isISO8601().toDate(),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /turnos/change-status/{turnoId}/{estado}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Cambiar el estado de una turno
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: turnoId
 *        in: "path"
 *        description: "Id de laturno"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado de la turno"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Turno"
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
    check("id").custom(existeTurnoPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
