const { Schema, model } = require("mongoose");

const articuloStock = new Schema({
  articulo: {
    type: Schema.Types.ObjectId,
    ref: "Articulo",
    required: [true, "El articulo es obligatorio"],
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

const ArticuloSucursalSchema = new Schema({
  sucursal: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    unique: true,
    required: [true, "La sucursal es obligatoria"],
  },
  articulos: {
    type: [articuloStock],
    default: [],
    required: [true, "Los articulos son obligatorios"],
  },
});

module.exports = model("ArticuloSucursal", ArticuloSucursalSchema);
