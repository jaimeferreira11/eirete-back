const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  changeStatus,
} = require("../controllers/catastro/ciudades");
const { existeCiudadPorId } = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/ciudades
 */

/**
 * @swagger
 * /ciudades:
 *  get:
 *    tags: ["Catastro"]
 *    summary: Obtiene todas las ciudades
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Ciudad"
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
 * /ciudades/{ciudadId}:
 *  get:
 *    tags: ["Catastro"]
 *    summary: Obtiene ciudad por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: ciudadId
 *        in: "path"
 *        description: "Id de la ciudad"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Ciudad"
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
    check("id").custom(existeCiudadPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /ciudades:
 *  post:
 *    tags: ["Catastro"]
 *    summary: Crear una nueva ciudad
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Ciudad"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Ciudad"
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
 * /ciudades/{ciudadId}:
 *  put:
 *    tags: ["Catastro"]
 *    summary: Actualizar una ciudad
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: ciudadId
 *        in: "path"
 *        description: "Id de la ciudad"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Ciudad"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Ciudad"
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
    check("id").custom(existeCiudadPorId),
    check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /ciudades/change-status/{ciudadId}/{estado}:
 *  put:
 *    tags: ["Catastro"]
 *    summary: Cambiar el estado de una ciudad
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: ciudadId
 *        in: "path"
 *        description: "Id de la ciudad"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado de la ciudad"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Ciudad"
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
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeCiudadPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
