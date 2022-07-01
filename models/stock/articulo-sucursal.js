const { Schema, model } = require("mongoose");

const ArticuloSucursalSchema = Schema({
  articulo: {
    type: Schema.Types.ObjectId,
    ref: "Articulo",
    required: [true, "El articulo es obligatorio"],
  },
  sucursal: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: [true, "La sucursal es obligatoria"],
  },
  stock: {
    type: Number,
    required: [true, "La cantidad es obligatoria"],
    default: 0,
  },
  stockMinimo: {
    type: Number,
    default: 0,
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

module.exports = model("ArticuloSucursal", ArticuloSucursalSchema);
