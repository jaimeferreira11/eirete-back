const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");

const TurnoCounterSchema = Schema({
  seq: { type: Number, default: 0 },
});

const turnoCounterColleccion = model("turnoCounter", TurnoCounterSchema);

const TurnoSchema = new Schema({
  nro: {
    type: Number,
    default: 1,
    unique: true,
  },
  fechaApertura: {
    type: Date,
    require: true,
    default: Date.now,
  },
  fechaCierre: {
    type: Date,
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

TurnoSchema.plugin(diffHistory.plugin);

TurnoSchema.pre("save", async function (next) {
  let doc = this;

  console.log("Pre save turno");
  let counterDoc = await turnoCounterColleccion.findOne();
  if (!counterDoc) {
    counterDoc = new turnoCounterColleccion({ seq: 1 });
  } else {
    counterDoc.seq++;
  }
  doc.nro = counterDoc.seq;
  console.log(doc.nro);
  counterDoc.save();

  next();
});

module.exports = model("Turno", TurnoSchema);
