const { Schema, model } = require("mongoose");

const SucursalSchema = Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "La descripcion es obligatoria"],
  },
  direccion: {
    type: String,
    required: [true, "La dirección es obligatoria"],
  },
  ciudad: {
    type: String,
    required: [true, "La ciudad es obligatoria"],
  },
  timbrado: {
    type: Number,
    required: [true, "El codigo de establecimiento es obligatorio"],
  },
  establecimiento: {
    type: Number,
    required: [true, "El codigo de establecimiento es obligatorio"],
  },
  puntoExpedicion: {
    type: Number,
    required: [true, "El punto de expedición es obligatorio"],
  },
  rangoInicial: {
    type: Number,
    default: 1,
    required: [true, "El rango inicial es obligatorio"],
  },
  rangoFinal: {
    type: Number,
    required: [true, "El rango final es obligatorio"],
  },
  nroActual: {
    type: Number,
    default: 1,
    required: [true, "El numero actual es obligatorio"],
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

module.exports = model("Sucursal", SucursalSchema);
