const { Router } = require("express");
const { check, oneOf } = require("express-validator");

const { validarJWT, validarCampos, esAdminRole } = require("../middlewares");

const {
  add,
  getAll,
  getById,
  getByNro,
  getByCliente,
  changeStatus,
} = require("../controllers/transaccion/pedidos");
const {
  existeArticuloPorId,
  existPedidoPorId,
  existeSucursalPorId,
  existeClientePorId,
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
 *            $ref: "#/definitions/Pedido"
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
 * /pedidos/{pedidoId}:
 *  get:
 *    tags: ["Transaccion"]
 *    summary: Obtiene pedido por id
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: pedidoId
 *        in: "path"
 *        description: "Id del pedido"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Pedido"
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
    check("id").custom(existPedidoPorId),
    validarCampos,
  ],
  getById
);

/**
 * @swagger
 * /pedidos/search/nro/{nro}:
 *  get:
 *    tags: ["Transaccion"]
 *    summary: Obtiene pedido por el nro de orden
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: nro
 *        in: "path"
 *        description: "Número del pedido"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Pedido"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/search/nro/:nro",
  [
    validarJWT,
    check("nro", "El nro a buscar es obligatorio y numerico")
      .notEmpty()
      .isNumeric(),
    validarCampos,
  ],
  getByNro
);
/**
 * @swagger
 * /pedidos/search/cliente/{clienteId}:
 *  get:
 *    tags: ["Transaccion"]
 *    summary: Obtiene historial de pedidos del cliente
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: clienteId
 *        in: "path"
 *        description: "Número del pedido"
 *        required: true
 *        type: integer
 *        format: int64
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Pedido"
 *      '401':
 *        description: Acceso Prohibido
 *      '404':
 *        description: Sin resultados
 *      '500':
 *        description: Error inesperado
 */
router.get(
  "/search/cliente/:id",
  [
    validarJWT,
    check("id", "No es un id de Mongo válido").isMongoId(),
    check("id").custom(existeClientePorId),
    validarCampos,
  ],
  getByCliente
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
 *          $ref: "#/definitions/Pedido"
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Pedido"
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
    // va insertar cuando el cliente no existe
    // check("cliente._id", "No es un id de Mongo válido").isMongoId(),
    //  check("cliente._id").custom(existeClientePorId),
    check("cliente.persona.nroDoc", "El documento es obligatoria")
      .not()
      .isEmpty(),

    check(
      "cliente.persona.nroDoc",
      "El documento debe de al menos 6 digitos"
    ).isLength({ min: 6 }),
    //  check("cliente.persona.nroDoc").custom(existeClientePorDoc),
    check("cliente.persona.nombreApellido", "La razon social es obligatoria")
      .not()
      .isEmpty(),
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
    check("tipoPedido", "Tipo de pedio no valido").isIn([
      TipoPedido.DELIVERY,
      TipoPedido.REGULAR,
    ]),
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
    oneOf([
      [
        check("tipoPedido", "Es delivery").equals(TipoPedido.DELIVERY),
        check(
          "direccionEnvio",
          "La informacion de direccion de envio es obligatoria para el tipo de Delivery"
        )
          .not()
          .isEmpty(),
        check("direccionEnvio.direccion", "La direccion es obligatoria")
          .not()
          .isEmpty(),
        check("direccionEnvio.ciudad", "La ciudad es obligatoria")
          .not()
          .isEmpty(),
      ],
      [
        check("tipoPedido", "No es por delivery")
          .not()
          .equals(TipoPedido.DELIVERY),
      ],
    ]),
    validarCampos,
  ],
  add
);

/**
 * @swagger
 * /pedidos/change-status/{pedidoId}/{estadoPedido}:
 *  put:
 *    tags: ["Transaccion"]
 *    summary: Cambiar el estado de un pedido
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: pedidoId
 *        in: "path"
 *        description: "Id del pedido"
 *        required: true
 *        type: integer
 *        format: int64
 *      - name: estadoPedido
 *        in: "path"
 *        description: "Nuevo estado del pedido"
 *        required: true
 *        type: boolean
 *    responses:
 *      '200':
 *        description: Operación exitosa
 *        schema:
 *          $ref: "#/definitions/Pedido"
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
    check("id").custom(existPedidoPorId),
    check("status", "El estado es obligatorio").not().isEmpty(),
    check("status", "Estado de pedido no valido").isIn([
      EstadoPedido.PENDIENTE,
      EstadoPedido.FACTURADO,
      EstadoPedido.FACTURADO,
      EstadoPedido.CANCELADO,
      EstadoPedido.ANULADO,
      EstadoPedido.REVERSADO,
    ]),
    validarCampos,
  ],
  changeStatus
);

module.exports = router;
