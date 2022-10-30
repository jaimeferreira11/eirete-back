const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");

const MovimientoSchema = Schema({
  descripcion: {
    type: String,
    uppercase: true,
    required: [true, "La descripcion es obligatoria"],
  },
  monto: {
    type: Number,
    required: [true, "El monto es obligatorio"],
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "CategoriaMovimiento",
    required: [true, "La categoria es obligatoria"],
  },
  turno: {
    type: Schema.Types.ObjectId,
    ref: "Turno",
    required: [true, "El turno es obligatorio"],
  },
  esGasto: {
    type: Boolean,
    required: [true, "Es gasto es obligatorio"],
  },
  esIngreso: {
    type: Boolean,
    required: [true, "Es ingreso es obligatorio"],
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

MovimientoSchema.plugin(diffHistory.plugin);

module.exports = model("Movimiento", MovimientoSchema);
