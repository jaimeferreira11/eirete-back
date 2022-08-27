const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  changeStatus,
} = require("../controllers/tesoreria/movimiento");
const {
  existeMovimientoPorId,
  existeCategoriaMovimientoPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * @swagger
 * /movimientos:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene todos los movimientos
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Movimiento"
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
 * /movimientos/{categoraId}:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene movimiento por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: categoraId
 *        in: "path"
 *        description: "Id de la movimiento"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Movimiento"
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
    check("id").custom(existeMovimientoPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /movimientos:
 *  post:
 *    tags: ["Tesoreria"]
 *    summary: Crear una nuevo movimiento
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Movimiento"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Movimiento"
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
    check("categoria._id", "No es un id de Mongo").isMongoId(),
    check("categoria._id").custom(existeCategoriaMovimientoPorId),
    check("monto", "El monto es obligatorio").not().isEmpty(),
    check("monto", "El monto debe tener al menos 3 digitos").isLength({
      min: 3,
    }),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /movimientos/{movimientoId}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Actualizar un movimiento
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: movimientoId
 *        in: "path"
 *        description: "Id del movimiento"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Movimiento"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Movimiento"
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
    check("id").custom(existeMovimientoPorId),
    check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
    check("categoria._id", "No es un id de Mongo").isMongoId(),
    check("categoria._id").custom(existeCategoriaMovimientoPorId),
    check("monto", "El monto es obligatorio").not().isEmpty(),
    check("monto", "El monto debe tener al menos 3 digitos").isLength({
      min: 3,
    }),
    validarCampos,
  ],
  update
);

module.exports = router;
