const { Schema, model } = require("mongoose");

const LineaArticuloSchema = Schema({
  descripcion: {
    type: String,
    required: [true, "La descripcion es obligatoria"],
  },
  estado: {
    type: Boolean,
    required: [true, "El estado es obligatorio"],
    default: true,
  },
});

module.exports = model("LineaArticulo", LineaArticuloSchema);
