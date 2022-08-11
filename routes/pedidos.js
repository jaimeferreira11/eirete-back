const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const { add, getAll, getById } = require("../controllers/transaccion/pedidos");
const {
  existeClientePorDoc,
  existePersonaPorId,
  nroDocExiste,
  existeArticuloPorId,
  existeClientePorId,
  existeSucursalPorId,
} = require("../helpers/db-validators");
const {
  TipoPedido,
  TipoFactura,
  EstadoPedido,
} = require("../helpers/constants");

const router = Router();

/**
 * {{url}}/api/pedidos
 */

/**
 * @swagger
 * /pedidos:
 *  get:
 *    tags: ["Transaccion"]
 *    summary: Obtiene todos los pedidos
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
 * /pedidos:
 *  post:
 *    tags: ["Transaccion"]
 *    summary: Crear un nuevo pedido
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
    check("cliente._id", "No es un id de Mongo válido").isMongoId(),
    check("cliente._id").custom(existeClientePorId),
    check("cliente.persona.nroDoc", "El documento es obligatoria")
      .not()
      .isEmpty(),
    check(
      "cliente.persona.nroDoc",
      "El documento debe de al menos 6 digitos"
    ).isLength({ min: 6 }),
    check("cliente.persona.nroDoc").custom(existeClientePorDoc),
    check("sucursal._id", "No es un id de Mongo").isMongoId(),
    check("sucursal._id").custom(existeSucursalPorId),
    check("impuesto", "El impuesto es obligatorio y numerico")
      .notEmpty()
      .isNumeric(),
    check("importeTotal", "El importe es obligatorio y numerico")
      .notEmpty()
      .isNumeric(),
    check("montoRecibido", "El monto recibido es obligatorio y numerico")
      .notEmpty()
      .isNumeric(),
    check("vuelto", "El vuelto es obligatorio y numerico")
      .notEmpty()
      .isNumeric(),
    check("tipoPedido", "Tipo de pedio no valido")
      .optional()
      .isIn([TipoPedido.DELIVERY, TipoPedido.REGULAR]),
    check("tipoFactura", "Tipo de factura no valido")
      .optional()
      .isIn([TipoFactura.CONTADO, TipoFactura.CREDITO]),
    check("estadoPedido", "Estado de pedido no valido")
      .optional()
      .isIn([
        EstadoPedido.PENDIENTE,
        EstadoPedido.FACTURADO,
        EstadoPedido.FACTURADO,
        EstadoPedido.CANCELADO,
        EstadoPedido.ANULADO,
        EstadoPedido.REVERSADO,
      ]),
    check("detalles", "La lista de detalles es obligatoria")
      .notEmpty()
      .isArray(),
    check("detalles.*.articulo", "El articulo es obligatorio").not().isEmpty(),
    check("detalles.*.articulo._id", "No es un id de Mongo").isMongoId(),
    check("detalles.*.articulo._id").custom(existeArticuloPorId),
    check("detalles.*.cantidad", "La cantidad es obligatoria").isNumeric(),
    check(
      "detalles.*.precioUnitario",
      "El precio unitario es obligatorio"
    ).isNumeric(),
    check("detalles.*.tipoImpuesto", "Tipo de impuesto no valido")
      .isNumeric()
      .isIn([0, 5, 10]),
    validarCampos,
  ],
  add
);

module.exports = router;
