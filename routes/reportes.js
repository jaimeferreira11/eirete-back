const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos } = require("../middlewares");

const {
  getEstadisticaVentas,
  getPedidos,
} = require("../controllers/reportes/reportes");

const router = Router();

router.get("/estadistica-ventas", [validarCampos], getEstadisticaVentas);

router.get("/estadistica-pedidos", [validarCampos], getPedidos);

module.exports = router;
