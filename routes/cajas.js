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

//  Obtener todas las categorias - publico
router.get("/", [validarJWT, validarCampos], getAll);

// Obtener una categoria por id - publico
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

// Crear categoria - privado - cualquier persona con un token válido
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

// Actualizar - privado - cualquiera con token válido
router.put(
  "/:id",
  [
    validarJWT,
    check("descripcion", "La descripcion es obligatorio").not().isEmpty(),
    check("id").custom(existeCajaPorId),
    check("sucursal._id", "No es un id de Mongo").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    validarCampos,
  ],
  update
);

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
