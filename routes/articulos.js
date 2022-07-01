const { Router } = require("express");
const { check, query } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  update,
  getByCodigo,
  changeStatus,
} = require("../controllers/stock/articulos");
const {
  existeArticuloPorId,
  codArticuloExiste,
  existeMarcaPorId,
  existeArticuloPorDescripcion,
  existeLineaArticuloPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/categorias
 */

//  Obtener todas las categorias - publico
router.get("/", [validarJWT, validarCampos], getAll);

// Obtener una categoria por id
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeArticuloPorId),
    validarCampos,
  ],
  getById
);

// Obtener una categoria por id
router.get(
  "/search/codigo",
  [
    validarJWT,
    query("codigo", "El codigo es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  getByCodigo
);

// Crear categoria - privado - cualquier persona con un token válido
router.post(
  "/",
  [
    validarJWT,
    check("codigoBarra", "El codigo de barra debe de al menos 2 digitos")
      .optional()
      .isLength({
        min: 2,
      }),
    check("codigoBarra").optional().custom(codArticuloExiste),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("descripcion", "La descripcion debe de ser más de 3 letras").isLength(
      { min: 3 }
    ),
    check("descripcion").custom(existeArticuloPorDescripcion),
    check("precioVenta", "El precio de venta es obligatorio").not().isEmpty(),
    check(
      "precioVenta",
      "El precio de venta debe de al menos 3 digitos"
    ).isLength({
      min: 3,
    }),
    check("unidadMedida", "No es tipo de codigo válido").isIn([
      "UNIDAD",
      "GRAMO",
      "KILOGRAMO",
      "MILILITRO",
      "LITRO",
      "CENTIMETRO",
      "METRO",
      "PAQUETE",
      "CAJA",
    ]),
    check("lineaArticulo._id", "No es un id de Mongo").isMongoId(),
    check("lineaArticulo._id").custom(existeLineaArticuloPorId),
    check("tipoImpuesto", "No es un sexo válido").optional().isIn([0, 5, 10]),
    validarCampos,
  ],
  add
);

// Actualizar - privado - cualquiera con token válido
router.put(
  "/:id",
  [
    validarJWT,

    check("id").custom(existeArticuloPorId),
    check("codigoBarra", "El codigo de barra debe de al menos 2 digitos")
      .optional()
      .isLength({
        min: 2,
      }),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("descripcion", "La descripcion debe de ser más de 3 letras").isLength(
      { min: 3 }
    ),
    check("precioVenta", "El precio de venta es obligatorio").not().isEmpty(),
    check(
      "precioVenta",
      "El precio de venta debe de al menos 3 digitos"
    ).isLength({
      min: 3,
    }),
    check("unidadMedida", "No es tipo de codigo válido").isIn([
      "UNIDAD",
      "GRAMO",
      "KILOGRAMO",
      "MILILITRO",
      "LITRO",
      "CENTIMETRO",
      "METRO",
      "PAQUETE",
      "CAJA",
    ]),
    check("lineaArticulo._id", "No es un id de Mongo").isMongoId(),
    check("lineaArticulo._id").custom(existeLineaArticuloPorId),
    check("tipoImpuesto", "No es un sexo válido").optional().isIn([0, 5, 10]),
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
    check("id").custom(existeArticuloPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
