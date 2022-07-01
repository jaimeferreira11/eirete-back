const { Schema, model } = require("mongoose");

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
  familia: {
    type: Schema.Types.ObjectId,
    ref: "FamiliaArticulo",
    required: [true, "La familia es obligatorio"],
  },
});

module.exports = model("LineaArticulo", LineaArticuloSchema);
