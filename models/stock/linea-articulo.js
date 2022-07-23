const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");

const LineaArticuloSchema = Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "La descripcion es obligatoria"],
  },
  estado: {
    type: Boolean,
    required: [true, "El estado es obligatorio"],
    default: true,
  },
});

LineaArticuloSchema.plugin(diffHistory.plugin);

module.exports = model("LineaArticulo", LineaArticuloSchema);
