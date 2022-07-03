const { Schema, model } = require("mongoose");
const ArticuloSchema = Schema({
  descripcion: {
    type: String,
    required: [true, "La descripcion es obligatoria"],
    unique: true,
  },
  codigoBarra: {
    type: String,
  },
  unidadMedida: {
    type: String,
    required: true,
    default: "UNIDAD",
    emun: [
      "UNIDAD",
      "GRAMO",
      "KILOGRAMO",
      "MILILITRO",
      "LITRO",
      "CENTIMETRO",
      "METRO",
      "PAQUETE",
      "CAJA",
    ],
  },
  precioVenta: {
    type: Number,
    required: [true, "El precio de venta es obligatorio"],
  },
  lineaArticulo: {
    type: Schema.Types.ObjectId,
    ref: "LineaArticulo",
    required: [true, "La linea es obligatoria"],
  },
  estado: {
    type: Boolean,
    required: [true, "El estado es obligatorio"],
    default: true,
  },
  tipoImpuesto: {
    type: Number,
    required: true,
    default: 10,
    emun: [0, 5, 10],
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

module.exports = model("Articulo", ArticuloSchema);
