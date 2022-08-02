const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  esAdminRole,
  tieneRole,
} = require("../middlewares");

const {
  esRoleValido,
  esPerfilValido,
  usernameExiste,
  existeUsuarioPorId,
  existeSucursalPorId,
  existeCajaPorId,
} = require("../helpers/db-validators");

const {
  getById,
  usuariosGet,
  usuariosPut,
  usuariosPost,
  usuariosDelete,
  changeStatus,
  usuarioByUsername,
} = require("../controllers/seguridad/usuarios");

const router = Router();

/**
 * @swagger
 * /usuarios:
 *  get:
 *    tags: ["Seguridad"]
 *    summary: Obtiene todos los usuarios
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Usuario"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get("/", [validarJWT, validarCampos], usuariosGet);

/**
 * @swagger
 * /usuarios/{usuarioId}:
 *  get:
 *    tags: ["Seguridad"]
 *    summary: Obtiene usuario por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: usuarioId
 *        in: "path"
 *        description: "Id del usuario"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Usuario"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  getById
);

/**
 * @swagger
 * /usuarios/username/{username}:
 *  get:
 *    tags: ["Seguridad"]
 *    summary: Obtiene usuario por el username
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: username
 *        in: "path"
 *        description: "username"
 *        required: true
 *        type: string
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Usuario"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/username/:username",
  [
    validarJWT,
    check("username", "No es un ID válido").not().isEmpty(),
    validarCampos,
  ],
  usuarioByUsername
);

/**
 * @swagger
 * /usuarios/{usuarioId}:
 *  put:
 *    tags: ["Seguridad"]
 *    summary: Actualizar un usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: usuarioId
 *        in: "path"
 *        description: "Id del usuario"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Usuario"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Usuario"
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
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    check("perfiles", "El perfil es obligatorio").not().isEmpty(),
    check("perfiles").custom(esPerfilValido),
    check("sucursal._id", "No es un id de Mongo válido").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    check("caja._id", "No es un id de Mongo válido").optional().isMongoId(),
    check("caja._id").optional().custom(existeCajaPorId),
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  usuariosPut
);

/**
 * @swagger
 * /usuarios:
 *  post:
 *    tags: ["Seguridad"]
 *    summary: Crear un nuevo usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Usuario"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Usuario"
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
    check("nombreApellido", "El nombre es obligatorio").not().isEmpty(),
    check("password", "El password debe de ser más de 6 letras").isLength({
      min: 6,
    }),
    check("username", "El username es obligatorio").not().isEmpty(),
    check("username").custom(usernameExiste),
    // check('correo', 'El correo no es válido')
    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    // check("rol").custom(esRoleValido),
    check("perfiles", "El perfil es obligatorio").not().isEmpty(),
    check("perfiles").custom(esPerfilValido),
    check("sucursal", "La sucursal es obligatoria").not().isEmpty(),
    check("sucursal._id", "No es un id de Mongo válido").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    check("caja._id", "No es un id de Mongo válido").optional().isMongoId(),
    check("caja._id").optional().custom(existeCajaPorId),
    validarCampos,
  ],
  usuariosPost
);

/**
 * @swagger
 * /usuarios/change-status/{usuarioId}/{estado}:
 *  put:
 *    tags: ["Seguridad"]
 *    summary: Cambiar el estado de un usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: usuarioId
 *        in: "path"
 *        description: "Id del usuario"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado del usuario"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Usuario"
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
    check("id").custom(existeUsuarioPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
