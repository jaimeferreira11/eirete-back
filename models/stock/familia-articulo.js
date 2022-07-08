const { Schema, model } = require("mongoose");
const diffHistory = require('mongoose-audit-trail');


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

FamiliaArticuloSchema.plugin(diffHistory.plugin);


module.exports = model("FamiliaArticulo", FamiliaArticuloSchema);
