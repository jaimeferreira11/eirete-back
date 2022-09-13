const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos } = require("../middlewares");

const { getEstadisticaVentas } = require("../controllers/reportes/reportes");

const router = Router();

router.get("/estadistica-ventas", [validarCampos], getEstadisticaVentas);

module.exports = router;
