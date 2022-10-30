const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");

const PersonaSchema = Schema({
  nroDoc: {
    type: String,
    required: [true, "El nrodoc es obligatorio"],
    unique: true,
  },
  nombreApellido: {
    type: String,
    uppercase: true,
    required: [true, "El nombre es obligatorio"],
  },
  tipoDoc: {
    type: String,
    required: true,
    default: "CI",
    emun: ["CI", "RUC", "DNI"],
  },
  sexo: {
    type: String,
    required: true,
    uppercase: true,
    default: "M",
    emun: ["M", "F"],
  },
  tipoPersona: {
    type: String,
    required: true,
    default: "FISICA",
    emun: ["FISICA", "JURIDICA"],
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
  fechaNacimiento: {
    type: Date,
  },
  direccion: {
    type: String,
  },
  ciudad: {
    type: String,
  },
  telefono: {
    type: String,
  },
  correo: {
    type: String,
  },
  celular: {
    type: String,
  },
  sitioWeb: {
    type: String,
  },
  ruc: {
    type: String,
  },
  obs: {
    type: String,
  },
  fechaModif: {
    type: Date,
  },
  usuarioModif: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
});

PersonaSchema.plugin(diffHistory.plugin);

module.exports = model("Persona", PersonaSchema);
