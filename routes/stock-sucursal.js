const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  getBySucursal,
  getLineasBySucursal,
  getArticulosBySucursal,
  updateArticuloSucursal,
  getArticulosByQuery,
} = require("../controllers/stock/stock-sucursal");
const {
  existeSucursalPorId,
  existeArticuloPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/stock
 */

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
  "/sucursal/:id/lineas",
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

/**
 * @swagger
 * /sucursal/:id/search/articulos-con-lineas:
 *  get:
 *    tags: ["Stock"]
 *    summary: Obtiene articulos por el termino introducido agrupados en linea de articulo
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: search
 *        in: "query"
 *        description: "Termino a  buscar"
 *        required: true
 *        type: string
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Articulo"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/sucursal/:id/search/articulos-con-lineas",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeSucursalPorId),
    validarCampos,
  ],
  getArticulosByQuery
);

module.exports = router;
