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
} = require("../controllers/stock/linea-articulos");
const { existeLineaArticuloPorId } = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/linea-articulos
 */

/**
 * @swagger
 * /linea-articulos/{lineaArticuloId}:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene linea de articulo por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: lineaArticuloId
 *        in: "path"
 *        description: "Id de la linea de articulo"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
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
 * /linea-articulos/{lineaArticuloId}:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene linea de articulo por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: lineaArticuloId
 *        in: "path"
 *        description: "Id de la linea de articulo"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
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
    check("id").custom(existeLineaArticuloPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /linea-articulos:
 *  post:
 *    tags: ["Stock"]
 *    summary: Crear un nuevo linea de articulo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
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

    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /linea-articulos/{lineaArticuloId}:
 *  put:
 *    tags: ["Stock"]
 *    summary: Actualizar un linea de articulo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: lineaArticuloId
 *        in: "path"
 *        description: "Id de la linea de articulo"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
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
    check("id").custom(existeLineaArticuloPorId),

    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /linea-articulos/change-status/{lineaArticuloId}/{estado}:
 *  put:
 *    tags: ["Stock"]
 *    summary: Cambiar el estado de un linea de articulo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: lineaArticuloId
 *        in: "path"
 *        description: "Id de la linea de articulo"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado de la linea de articulo"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/LineaArticulo"
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
    check("id").custom(existeLineaArticuloPorId),
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
    check("id").custom(existeLineaArticuloPorId),
    validarCampos,
  ],
  inactivate
);

module.exports = router;
