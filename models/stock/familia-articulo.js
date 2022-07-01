const { Schema, model } = require("mongoose");

const FamiliaArticuloSchema = Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "La descripcion es obligatoria"],
  },

  porcentajeGanancia: {
    type: Number,
  },
  estado: {
    type: Boolean,
    required: [true, "El estado es obligatorio"],
    default: true,
  },
});

module.exports = model("FamiliaArticulo", FamiliaArticuloSchema);
