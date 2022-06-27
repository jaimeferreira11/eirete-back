const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  getByPersonaId,
  update,
} = require("../controllers/catastro/clientes");
const {
  existeClientePorId,
  existeClientePorDoc,
  nroDocExiste,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/categorias
 */

//  Obtener todas las categorias - publico
router.get("/", [validarJWT, validarCampos], getAll);

//  Obtener todas las categorias - publico

// Obtener una categoria por id - publico
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeClientePorId),
    validarCampos,
  ],
  getById
);

router.get(
  "/search/persona/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  getByPersonaId
);

// Crear categoria - privado - cualquier persona con un token válido
router.post(
  "/",
  [
    validarJWT,
    check("persona.nroDoc", "El documento es obligatoria").not().isEmpty(),
    check("persona.nroDoc", "El documento debe de al menos 6 digitos").isLength(
      { min: 6 }
    ),
    // check('persona.nroDoc').custom(existeClientePorDoc), // va actualizar si existe
    check("persona.nombreApellido", "El nombre es obligatoria").not().isEmpty(),
    check(
      "persona.nombreApellido",
      "El nombre debe de ser más de 5 letras"
    ).isLength({ min: 5 }),
    check("persona.tipoDoc", "No es un rol válido")
      .optional()
      .isIn(["CI", "RUC", "DNI"]),
    check("persona.sexo", "No es un sexo válido").isIn(["M", "F"]),
    check("persona.tipoPersona", "No es un tipo persona válido")
      .optional()
      .isIn(["FISICA", "JURIDICA"]),
    validarCampos,
  ],
  add
);

// Actualizar - privado - cualquiera con token válido
router.put(
  "/:id",
  [
    validarJWT,
    check("persona.nroDoc", "El documento es obligatoria").not().isEmpty(),
    check("persona.nroDoc", "El documento debe de al menos 6 digitos").isLength(
      { min: 6 }
    ),
    check("persona.nombreApellido", "El nombre es obligatoria").not().isEmpty(),
    check(
      "persona.nombreApellido",
      "El nombre debe de ser más de 5 letras"
    ).isLength({ min: 5 }),
    check("persona.tipoDoc", "No es un rol válido")
      .optional()
      .isIn(["CI", "RUC", "DNI"]),
    check("persona.sexo", "No es un sexo válido").isIn(["M", "F"]),
    check("persona.tipoPersona", "No es un tipo persona válido")
      .optional()
      .isIn(["FISICA", "JURIDICA"]),
    check("id").custom(existeClientePorId),
    validarCampos,
  ],
  update
);

module.exports = router;
