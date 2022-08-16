const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  getByPersonaId,
  getByPersonaDoc,
  update,
  changeStatus,
} = require("../controllers/catastro/clientes");
const {
  existeClientePorId,
  existePersonaPorId,
} = require("../helpers/db-validators");

const router = Router();

/**
 * {{url}}/api/clientes
 */

/**
 * @swagger
 * /clientes:
 *  get:
 *    tags: ["Catastro"]
 *    summary: Obtiene todos los clientes
 *    description: ""
 *    produces: ["application/json"]
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/definitions/Cliente"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get("/", [validarJWT, validarCampos], getAll);

/**
 * @swagger
 * /clientes/{clienteId}:
 *  get:
 *    tags: ["Catastro"]
 *    summary: Obtiene cliente por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: clienteId
 *        in: "path"
 *        description: "Id del cliente"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Cliente"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
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

/**
 * @swagger
 * /clientes/search/persona/{personaId}:
 *  get:
 *    tags: ["Catastro"]
 *    summary: Obtiene cliente por id de la persona
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: personaId
 *        in: "path"
 *        description: "Id de la persona"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Persona"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/search/persona/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    validarCampos,
  ],
  getByPersonaId
);

/**
 * @swagger
 * /clientes/search/persona/nrodoc/{doc}:
 *  get:
 *    tags: ["Catastro"]
 *    summary: Obtiene cliente por numero de documento de la persona
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: doc
 *        in: "path"
 *        description: "Nro documento"
 *        required: true
 *        type: string
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Persona"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/search/persona/nrodoc/:doc",
  [
    validarJWT,
    check("doc", "El documento es obligatoria").not().isEmpty(),
    check("doc", "El documento debe de al menos 6 digitos").isLength({
      min: 6,
    }),
    validarCampos,
  ],
  getByPersonaDoc
);

/**
 * @swagger
 * /clientes:
 *  post:
 *    tags: ["Catastro"]
 *    summary: Crear un nuevo cliente
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Cliente"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Cliente"
 *      '401':
 *        description: Acceso Prohibido
 *      '400':
 *        description: Petición incorrecta
 *      '500':
 *        description: Error inesperado
 */
router.post(
  "/",
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
    check("direcciones.*.direccion", "La direccion es obligatoria")
      .not()
      .isEmpty(),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /clientes/{clienteId}:
 *  put:
 *    tags: ["Catastro"]
 *    summary: Actualizar un cliente
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: clienteId
 *        in: "path"
 *        description: "Id del cliente"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: body
 *        in: body
 *        description: "Objecto a guardar"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Cliente"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Cliente"
 *      '401':
 *        description: Acceso Prohibido
 *      '400':
 *        description: Petición incorrecta
 *      '500':
 *        description: Error inesperado
 */
router.put(
  "/:id",
  [
    validarJWT,
    check("persona._id", "No es un id de Mongo válido").isMongoId(),
    check("persona._id").custom(existePersonaPorId),
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

/**
 * @swagger
 * /clientes/change-status/{clienteId}/{estado}:
 *  put:
 *    tags: ["Catastro"]
 *    summary: Cambiar el estado de un cliente
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: clienteId
 *        in: "path"
 *        description: "Id del cliente"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estado
 *        in: "path"
 *        description: "Nuevo estado del cliente"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Cliente"
 *      '401':
 *        description: Acceso Prohibido
 *      '400':
 *        description: Petición incorrecta
 *      '500':
 *        description: Error inesperado
 */
router.put(
  "/change-status/:id/:status",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeClientePorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "El estado debe ser boolean").isBoolean(),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
