const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  getBySucursal,
  getFamiliasBySucursal,
  getLineasBySucursal,
  getArticulosBySucursal,
} = require("../controllers/stock/stock-sucursal");
const { existeSucursalPorId } = require("../helpers/db-validators");

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

module.exports = router;
