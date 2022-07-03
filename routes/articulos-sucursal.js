const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const { getBySucursal } = require("../controllers/stock/articulos-sucursal");
const { existeSucursalPorId } = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/articulos-sucursal
 */

//  Obtener todas las categorias
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getBySucursal
);

module.exports = router;
