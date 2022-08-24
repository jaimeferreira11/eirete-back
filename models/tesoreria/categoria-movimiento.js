const { Schema, model } = require("mongoose");

const CategoriaMovimientoSchema = Schema({
  descripcion: {
    type: String,
    required: [true, "La descripcion es obligatoria"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  visibleCaja: {
    type: Boolean,
    default: false,
  },
  visibleArqueo: {
    type: Boolean,
    default: false,
  },
  afectaEstadistica: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("CategoriaMovimiento", CategoriaMovimientoSchema);
