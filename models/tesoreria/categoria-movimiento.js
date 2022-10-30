const { Schema, model } = require("mongoose");

const CategoriaMovimientoSchema = Schema({
  descripcion: {
    type: String,
    uppercase: true,
    required: [true, "La descripcion es obligatoria"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  esGasto: {
    type: Boolean,
    default: true,
  },
  esIngreso: {
    type: Boolean,
    default: false,
  },
  visibleCaja: {
    type: Boolean,
    default: false,
  },
  afectaArqueo: {
    type: Boolean,
    default: false,
  },
  afectaEstadistica: {
    type: Boolean,
    default: false,
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

module.exports = model("CategoriaMovimiento", CategoriaMovimientoSchema);
