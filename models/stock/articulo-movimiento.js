const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");
const { EstadoMovimientoArticulo } = require("../../helpers/constants");

const detalleMovimiento = new Schema({
  articulo: {
    type: Schema.Types.ObjectId,
    ref: "Articulo",
    required: [true, "El articulo es obligatorio"],
  },
  enviado: {
    type: Number,
    required: [true, "La cantidad es obligatoria"],
    default: 0,
  },
  recibido: {
    type: Number,
    default: 0,
  },
});

const ArticuloMovCounterSchema = Schema({
  seq: { type: Number, default: 0 },
});

const articuloMovCounterColleccion = model("articuloMovCounter", ArticuloMovCounterSchema);

const ArticuloMovimientoSchema = new Schema({
  numero: {
    type: Number,
    default: 1,
    unique: true,
  },
  codigo: {
    type: String,
    required: [true, "El codigo de seguridad es obligatorio"],
  },
  sucursalDestino: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: [true, "La sucursal destino es obligatoria"],
  },
  sucursalOrigen: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: [true, "La sucursal origeb es obligatoria"],
  },
  estado: {
    type: String,
    emun: [EstadoMovimientoArticulo.ENVIADO, EstadoMovimientoArticulo.RECIBIDO, EstadoMovimientoArticulo.RECHAZADO],
  },
  detalles: {
    type: [detalleMovimiento],
    default: [],
    required: [true, "Los detalles son obligatorios"],
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

ArticuloMovimientoSchema.plugin(diffHistory.plugin);

ArticuloMovimientoSchema.pre("save", async function (next) {
  let doc = this;

  let counterDoc = await articuloMovCounterColleccion.findOne();
  if (!counterDoc) {
    counterDoc = new articuloMovCounterColleccion({ seq: 1 });
  } else {
    counterDoc.seq++;
  }
  doc.numero = counterDoc.seq;
  counterDoc.save();

  next();
});

module.exports = model("ArticuloMovimiento", ArticuloMovimientoSchema);
