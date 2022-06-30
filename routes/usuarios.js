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
} = require("../helpers/db-validators");

const {
  getById,
  usuariosGet,
  usuariosPut,
  usuariosPost,
  usuariosDelete,
  activate,
} = require("../controllers/seguridad/usuarios");

const router = Router();

router.get("/", [validarJWT, validarCampos], usuariosGet);

router.get(
  "/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  getById
);

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
    // check('rol').custom( esRoleValido ),
    validarCampos,
  ],
  usuariosPut
);

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
    validarCampos,
  ],
  usuariosPost
);

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
  activate
);

router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    validarCampos,
  ],
  usuariosDelete
);

module.exports = router;
