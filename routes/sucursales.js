const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  inactivate,
  activate,
} = require("../controllers/stock/sucursales");
const { existeSucursalPorId } = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/sucursales
 */

//  Obtener todas las categorias - publico
router.get("/", [validarJWT, validarCampos], getAll);

// Obtener una categoria por id - publico
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

// Crear categoria - privado - cualquier persona con un token válido
router.post(
  "/",
  [
    validarJWT,
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

// Actualizar - privado - cualquiera con token válido
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
  activate
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
