const { Schema, model } = require("mongoose");
const diffHistory = require('mongoose-audit-trail');


const CajaSchema = Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "La descripcion es obligatoria"],
  },
  nro: {
    type: Number,
    unique: true,
    required: [true, "El numero es obligatorio"],
  },
  sucursal: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: [true, "La sucursal es obligatoria"],
  },
  estado: {
    type: Boolean,
    required: [true, "El estado es obligatorio"],
    default: true,
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

CajaSchema.plugin(diffHistory.plugin);


module.exports = model("Caja", CajaSchema);
