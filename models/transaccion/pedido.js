const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");

const PedidoCounterSchema = Schema({
  seq: { type: Number, default: 0 },
});

const pedidoCounterColleccion = model("pedidoCounter", PedidoCounterSchema);

const pedidoDetalle = new Schema({
  articulo: {
    type: Schema.Types.ObjectId,
    ref: "Articulo",
    required: [true, "El articulo es obligatorio"],
  },
  cantidad: {
    type: Number,
    required: [true, "La cantidad es obligatoria"],
    default: 1,
  },
  precioUnitario: {
    type: Number,
    required: [true, "El precio unitario es requerido"],
  },
  tipoImpuesto: {
    type: Number,
    required: true,
    default: 10,
    emun: [0, 5, 10],
  },
  impuesto: {
    type: Number,
    default: 0,
    required: [true, "El impuesto es requerido"],
  },
  subtotal: {
    type: Number,
    required: [true, "El subtotal es requerido"],
  },
});

const metodoPago = new Schema({
  importe: {
    type: Number,
    required: [true, "El precio unitario es requerido"],
  },
  descripcion: {
    type: String,
    required: true,
    default: "EFECTIVO",
    emun: ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "CHEQUE"],
  },
  referencia: {
    type: String,
  },
});

const direccionEnvio = new Schema({
  direccion: {
    type: Number,
    required: [true, "El precio unitario es requerido"],
  },
  contacto: {
    type: String,
  },
  obs: {
    type: String,
  },
});

const PedidoSchema = new Schema({
  nro: {
    type: Number,
    required: [true, "El nro de pedido es obligatorio"],
    unique: true,
  },
  cliente: {
    type: Schema.Types.ObjectId,
    ref: "Cliente",
    required: [true, "El cliente es obligatorio"],
  },
  fecha: {
    type: Date,
    require: true,
    default: Date.now,
  },
  sucursal: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: [true, "La sucursal es obligatoria"],
  },

  impuesto: {
    type: Number,
    required: [true, "El iva es obligatorio"],
  },
  estadoPedido: {
    type: String,
    required: true,
    default: "PENDIENTE",
    emun: [
      "PENDIENTE",
      "PAGADO",
      "FACTURADO", // se facturó
      "CANCELADO", // cancelado por el cliente
      "ANULADO", // anulado por la empresa
      "REVERSADO", // pago reversado
    ],
  },
  tipoFactura: {
    type: String,
    required: true,
    default: "CONTADO",
    emun: ["CONTADO", "CREDITO"],
  },
  tipoPedido: {
    type: String,
    required: true,
    default: "CAJA",
    emun: ["CAJA", "DELIVERY"],
  },
  estadoDelivery: {
    type: String,
    emun: ["EN ESPERA", "EN CAMINO", "ENTREGADO", "PERDIDO"],
  },
  direccionEnvio: {
    type: direccionEnvio,
  },
  obs: {
    type: String,
  },
  detalles: {
    type: [pedidoDetalle],
    default: [],
    required: [true, "Los detalles son obligatorios"],
  },
  metodosPago: {
    type: [metodoPago],
    required: [true, "Metodo de pago es obligatorio"],
  },
  importeTotal: {
    type: Number,
    required: [true, "El importe es obligatorio"],
  },
  montoPagado: {
    type: Number,
  },
  vuelto: {
    type: Number,
  },
  fechaAlta: {
    type: Date,
    require: true,
    default: Date.now,
  },
  usuarioAlta: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  fechaModif: {
    type: Date,
  },
  usuarioModif: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
});

PedidoSchema.plugin(diffHistory.plugin);

const Pedido = model("Pedido", PedidoSchema);

PedidoSchema.pre("save", async function (next) {
  let doc = this;

  let counterDoc = await pedidoCounterColleccion.findOne();
  if (!counterDoc) {
    counterDoc = new pedidoCounterColleccion({ seq: 1 });
  } else {
    counterDoc.seq++;
  }
  doc.nro = counterDoc.seq;
  counterDoc.save();

  next();
});

module.exports = {
  PedidoSchema,
  Pedido,
};
