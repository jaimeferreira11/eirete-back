const { Schema, model } = require("mongoose");

const direccion = new Schema({
  direccion: {
    type: String,
    required: [true, "La dirección es obligatoria"],
  },
  ciudad: {
    type: String,
    required: [true, "La ciudad es obligatoria"],
  },
  predeterminado: {
    type: Boolean,
    default: true,
  },
  contacto: {
    type: String,
  },
  obs: {
    type: String,
  },
});

const ClienteSchema = new Schema({
  persona: {
    type: Schema.Types.ObjectId,
    ref: "Persona",
    required: [true, "La persona es obligatoria"],
    unique: true,
  },
  estado: {
    type: Boolean,
    required: [true, "El estado es obligatorio"],
    default: true,
  },
  direcciones: {
    type: [direccion],
    default: [],
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

module.exports = model("Cliente", ClienteSchema);
