const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  changeStatus,
} = require("../controllers/tesoreria/arqueos");
const {
  existeTurnoPorId,
  existeArticuloPorId,
  existeArqueoPorId,
} = require("../helpers/db-validators");
const {
  EfectivoMoneda,
  EfectivobilleteMoneda,
} = require("../helpers/constants");

const router = Router();

/**
 * @swagger
 * /arqueos:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene todos los arqueos
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Arqueo"
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
 * /arqueos/{arqueoId}:
 *  get:
 *    tags: ["Tesoreria"]
 *    summary: Obtiene arqueo por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: arqueoId
 *        in: "path"
 *        description: "Id de la arqueo"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Arqueo"
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
    check("id").custom(existeArqueoPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /arqueos:
 *  post:
 *    tags: ["Tesoreria"]
 *    summary: Crear una nuevo arqueo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Arqueo"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Arqueo"
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
    // va buscar el turno activo del usuario
    //check("turno._id", "No es un id de Mongo").isMongoId(),
    //check("turno._id").custom(existeTurnoPorId),

    // el stock se va controlar en el backend
    // check("stock", "La lista de stock es obligatoria").notEmpty().isArray(),
    // check("stock.*.articulo", "El articulo es obligatoria").not().isEmpty(),
    // check("stock.*.articulo._id", "No es un id de Mongo válido").isMongoId(),
    // check("stock.*.articulo._id").custom(existeArticuloPorId),
    // check("stock.*.stock", "La cantidad es obligatoria")
    //   .notEmpty()
    //   .isNumeric(),
    check("monedas", "La lista de monedas es obligatoria")
      .notEmpty()
      .isArray({ min: 4, max: 4 }),
    check("monedas.*.cantidad", "La cantidad debe ser numerico")
      .notEmpty()
      .isNumeric(),
    check("monedas.*.descripcion", "No es una moneda valida").isIn([
      EfectivoMoneda[50],
      EfectivoMoneda[100],
      EfectivoMoneda[500],
      EfectivoMoneda[1000],
    ]),
    check(
      "billetes",
      "La lista de billtes es obligatoria y debe tener 6 elementos"
    )
      .notEmpty()
      .isArray({ min: 6, max: 6 }),
    check("billetes.*.cantidad", "La cantidad debe ser numerico")
      .notEmpty()
      .isNumeric(),
    check("billetes.*.descripcion", "No es un billete valido").isIn([
      EfectivobilleteMoneda[2000],
      EfectivobilleteMoneda[5000],
      EfectivobilleteMoneda[10000],
      EfectivobilleteMoneda[20000],
      EfectivobilleteMoneda[50000],
      EfectivobilleteMoneda[100000],
    ]),
    check("totalEfectivo", "El total es obligatorio").notEmpty().isNumeric(),
    check("totalDeposito", "El total es obligatorio").notEmpty().isNumeric(),
    check("responsable", "El responsable es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /arqueos/{arqueoId}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Actualizar un arqueo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: arqueoId
 *        in: "path"
 *        description: "Id del arqueo"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Arqueo"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Arqueo"
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
    check("id").custom(existeArqueoPorId),
    check("turno._id", "No es un id de Mongo").isMongoId(),
    check("turno._id").custom(existeTurnoPorId),
    check("stock", "La lista de stock es obligatoria").notEmpty().isArray(),
    check("stock.*.articulo", "El articulo es obligatoria").not().isEmpty(),
    check("stock.*.stock", "La cantidad es obligatoria").notEmpty().isNumeric(),
    check("monedas", "La lista de monedas es obligatoria").notEmpty().isArray(),
    check("billetes", "La lista de billtes es obligatoria")
      .notEmpty()
      .isArray(),
    check("monedas.*.cantidad", "La cantidad debe ser numerico")
      .notEmpty()
      .isNumeric(),
    check("monedas.*.descripcion", "No es una moneda valida").isIn([
      EfectivoMoneda[50],
      EfectivoMoneda[100],
      EfectivoMoneda[500],
      EfectivoMoneda[1000],
    ]),
    check("billetes.*.cantidad", "La cantidad debe ser numerico")
      .notEmpty()
      .isNumeric(),
    check("billetes.*.descripcion", "No es un billete valido").isIn([
      EfectivobilleteMoneda[2000],
      EfectivobilleteMoneda[5000],
      EfectivobilleteMoneda[10000],
      EfectivobilleteMoneda[20000],
      EfectivobilleteMoneda[50000],
      EfectivobilleteMoneda[100000],
    ]),
    check("totalEfectivo", "El total es obligatorio").notEmpty().isNumeric(),
    check("totalDeposito", "El total es obligatorio").notEmpty().isNumeric(),
    check("responsable", "El articulo es obligatoria").not().isEmpty(),

    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /arqueos/change-status/{arqueoId}/{estado}:
 *  put:
 *    tags: ["Tesoreria"]
 *    summary: Cambiar el estado de una arqueo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: arqueoId
 *        in: "path"
 *        description: "Id de laarqueo"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado de la arqueo"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Arqueo"
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
    check("id").custom(existeArqueoPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
