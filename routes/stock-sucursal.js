const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  getBySucursal,
  getFamiliasBySucursal,
  getLineasBySucursal,
  getArticulosBySucursal,
  updateArticuloSucursal,
} = require("../controllers/stock/stock-sucursal");
const {
  existeSucursalPorId,
  existeArticuloPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/articulos-sucursal
 */

//  Obtener todas las categorias
router.get(
  "/sucursal/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getBySucursal
);

router.get(
  "/sucursal/:id/familias",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getFamiliasBySucursal
);

router.get(
  "/sucursal/:id/familia/:idFamilia/lineas",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getLineasBySucursal
);
router.get(
  "/sucursal/:id/linea/:idLinea/articulos",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getArticulosBySucursal
);

router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    check("articulo", "No es un id de Mongo válido").isMongoId(),
    check("articulo").custom(existeArticuloPorId),
    check("stock", "El stock es obligatorio").not().isEmpty().isNumeric(),
    check("stock", "El stock debe de al menos 1 digitos").isLength({ min: 1 }),
    validarCampos,
  ],
  updateArticuloSucursal
);

module.exports = router;
