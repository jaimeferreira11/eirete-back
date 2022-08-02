const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  inactivate,
  changeStatus,
} = require("../controllers/stock/sucursales");
const {
  existeSucursalPorId,
  existeSucursalPorDescripcion,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/sucursales
 */

/**
 * @swagger
 * /sucursales:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene todos los sucursales
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Sucursal"
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
 * /sucursales/{sucursalId}:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene sucursal por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: sucursalId
 *        in: "path"
 *        description: "Id del sucursal"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Sucursal"
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
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /sucursales:
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
 *          $ref: "#/definitions/Sucursal"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Sucursal"
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
    check("descripcion").custom(existeSucursalPorDescripcion),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("direccion", "La direccion es obligatoria").not().isEmpty(),
    check("ciudad", "La ciudad es obligatoria").not().isEmpty(),
    check("timbrado", "El timbrado es obligatorio").not().isEmpty(),
    check("timbrado", "El timbrado debe tener 8 digitos").isLength({
      min: 8,
      max: 8,
    }),
    check("establecimiento", "El establecimiento es obligatorio")
      .not()
      .isEmpty(),
    check(
      "establecimiento",
      "El establecimiento debe tener hasta 3 digitos"
    ).isLength({
      min: 1,
      max: 3,
    }),
    check("puntoExpedicion", "El punto de expedición es obligatorio")
      .not()
      .isEmpty(),
    check(
      "puntoExpedicion",
      "El punto de expedicion debe tener hasta 3 digitos"
    ).isLength({
      min: 1,
      max: 3,
    }),
    check("rangoInicial", "El rango inicial es obligatorio").not().isEmpty(),
    check(
      "rangoInicial",
      "El rango inicial puede tener hasta 7 digitos"
    ).isLength({
      max: 7,
    }),
    check("rangoFinal", "El rango final es obligatorio").not().isEmpty(),
    check("rangoFinal", "El rango final debe tener 7 digitos").isLength({
      min: 7,
      max: 7,
    }),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /sucursales/{sucursalId}:
 *  put:
 *    tags: ["Stock"]
 *    summary: Actualizar un sucursal
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: sucursalId
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
 *          $ref: "#/definitions/Sucursal"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Sucursal"
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
    check("id").custom(existeSucursalPorId),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("direccion", "La direccion es obligatoria").not().isEmpty(),
    check("ciudad", "La ciudad es obligatoria").not().isEmpty(),
    check("timbrado", "El timbrado es obligatorio").not().isEmpty(),
    check("timbrado", "El timbrado debe tener 8 digitos").isLength({
      min: 8,
      max: 8,
    }),
    check("establecimiento", "El establecimiento es obligatorio")
      .not()
      .isEmpty(),
    check(
      "establecimiento",
      "El establecimiento debe tener hasta 3 digitos"
    ).isLength({
      min: 1,
      max: 3,
    }),
    check("puntoExpedicion", "El punto de expedición es obligatorio")
      .not()
      .isEmpty(),
    check(
      "puntoExpedicion",
      "El punto de expedicion debe tener hasta 3 digitos"
    ).isLength({
      min: 1,
      max: 3,
    }),
    check("rangoInicial", "El rango inicial es obligatorio").not().isEmpty(),
    check(
      "rangoInicial",
      "El rango inicial puede tener hasta 7 digitos"
    ).isLength({
      max: 7,
    }),
    check("rangoFinal", "El rango final es obligatorio").not().isEmpty(),
    check("rangoFinal", "El rango final debe tener 7 digitos").isLength({
      min: 7,
      max: 7,
    }),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /sucursales/change-status/{sucursalId}/{estado}:
 *  put:
 *    tags: ["Stock"]
 *    summary: Cambiar el estado de un sucursal
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: sucursalId
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
 *          $ref: "#/definitions/Sucursal"
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
    check("id").custom(existeSucursalPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

// Borrar una categoria - Admin
router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  inactivate
);

module.exports = router;
