const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");
const { EstadoDelivery } = require("../../helpers/constants");

const PedidoCounterSchema = Schema({
  seq: { type: Number, default: 0 },
});

const pedidoCounterColleccion = model("pedidoCounter", PedidoCounterSchema);

const PedidoDetalle = new Schema({
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
    type: String,
    required: [true, "La dirección es obligatoria"],
  },
  ciudad: {
    type: String,
    required: [true, "La ciudad es obligatoria"],
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
    default: 1,
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
    default: "REGULAR",
    emun: ["REGULAR", "DELIVERY"],
  },
  estadoDelivery: {
    type: String,
    emun: [
      EstadoDelivery.EN_ESPERA,
      EstadoDelivery.EN_CAMINO,
      EstadoDelivery.ENTREGADO,
      EstadoDelivery.PERDIDO,
    ],
  },
  direccionEnvio: {
    type: direccionEnvio,
  },
  obs: {
    type: String,
  },
  motivoCancelacion: {
    type: String,
  },
  detalles: {
    type: [PedidoDetalle],
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
  montoRecibido: {
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
  turno: {
    type: Schema.Types.ObjectId,
    ref: "Turno",
    required: [true, "El turno es obligatoria"],
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

PedidoSchema.pre("save", async function (next) {
  let doc = this;

  console.log("Pre save Pedido");
  let counterDoc = await pedidoCounterColleccion.findOne();
  if (!counterDoc) {
    counterDoc = new pedidoCounterColleccion({ seq: 1 });
  } else {
    counterDoc.seq++;
  }
  doc.nro = counterDoc.seq;
  console.log(doc.nro);
  counterDoc.save();

  next();
});

const Pedido = model("Pedido", PedidoSchema);

module.exports = {
  PedidoSchema,
  Pedido,
  PedidoDetalle,
};
