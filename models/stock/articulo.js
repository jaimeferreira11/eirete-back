const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");

const ArticuloCounterSchema = Schema({
  seq: { type: Number, default: 0 },
});

const articuloCounterColleccion = model(
  "articuloCounter",
  ArticuloCounterSchema
);

const ArticuloSchema = new Schema({
  descripcion: {
    type: String,
    required: [true, "La descripcion es obligatoria"],
    unique: true,
    uppercase: true,
  },
  codigoBarra: {
    type: String,
  },
  codigo: {
    type: Number,
    default: 1,
    unique: true,
    uppercase: true,
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

ArticuloSchema.plugin(diffHistory.plugin);

ArticuloSchema.pre("save", async function (next) {
  let doc = this;

  let counterDoc = await articuloCounterColleccion.findOne();
  if (!counterDoc) {
    counterDoc = new articuloCounterColleccion({ seq: 1 });
  } else {
    counterDoc.seq++;
  }
  doc.codigo = counterDoc.seq;
  counterDoc.save();

  next();
});

module.exports = model("Articulo", ArticuloSchema);
