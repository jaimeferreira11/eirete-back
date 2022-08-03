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
} = require("../controllers/seguridad/perfiles");
const { existePerfilPorId } = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/perfiles
 */

/**
 * @swagger
 * /perfiles:
 *  get:
 *    tags: ["Seguridad"]
 *    summary: Obtiene todos los perfiles de usuario
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Perfil"
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
 * /perfiles/{perfilId}:
 *  get:
 *    tags: ["Seguridad"]
 *    summary: Obtiene perfil de usuario por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: perfilId
 *        in: "path"
 *        description: "Id del perfil"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Perfil"
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
    check("id").custom(existePerfilPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /perfiles:
 *  post:
 *    tags: ["Seguridad"]
 *    summary: Crear un nuevo perfil de usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Perfil"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Perfil"
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
 * /perfiles/{perfilId}:
 *  put:
 *    tags: ["Seguridad"]
 *    summary: Actualizar un perfil de usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: perfilId
 *        in: "path"
 *        description: "Id del perfil"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Perfil"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Perfil"
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
    check("descripcion", "la descripcion es obligatorio").not().isEmpty(),
    check("id").custom(existePerfilPorId),
    validarCampos,
  ],
  update
);

/**
 * @swagger
 * /perfiles/change-status/{perfilId}/{estado}:
 *  put:
 *    tags: ["Seguridad"]
 *    summary: Cambiar el estado de un perfil de usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: perfilId
 *        in: "path"
 *        description: "Id del perfil"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado del perfil"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Perfil"
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
    check("id").custom(existePerfilPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existePerfilPorId),
    validarCampos,
  ],
  inactivate
);

module.exports = router;
