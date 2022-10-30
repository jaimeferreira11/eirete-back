const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos } = require("../middlewares");

const {
  getEstadisticaVentas,
  getPedidos,
} = require("../controllers/reportes/reportes");

const router = Router();

/**
 * {{url}}/api/reportes
 */

/**
 * @swagger
 * /reportes/estadistica-ventas:
 *  get:
 *    tags: ["Reportes"]
 *    summary: Obtiene estadisitcas de ventas
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/EstadisticaVentas"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get("/estadistica-ventas", [validarCampos], getEstadisticaVentas);

/**
 * @swagger
 * /reportes/estadistica-pedidos:
 *  get:
 *    tags: ["Reportes"]
 *    summary: Obtiene estadisitcas de pedidos
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/EstadisticaVentas"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get("/estadistica-pedidos", [validarCampos], getPedidos);

module.exports = router;
