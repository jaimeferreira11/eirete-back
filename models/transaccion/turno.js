const { Schema, model } = require("mongoose");
const { PedidoSchema } = require("../index");

const diffHistory = require('mongoose-audit-trail');

const totalesIngreso = new Schema({

  importe: {
    type: Number,
    required: [true, "El precio unitario es requerido"],
  },
  descripcion: {
    type: String,
    required: true,
    default: "EFECTIVO",
    emun: ["EFECTIVO", "TARJETA", "TRANSFERENCIA","CHEQUE"],
  }
  
});

const totalesEgreso = new Schema({

  importe: {
    type: Number,
    required: [true, "El importe es requerido"],
  },
  descripcion: {
    type: String,
    required: true,
    default: "VUELTO",
    emun: ["VUELTO"],
  }
  
});

const dineroCaja = new Schema({

  importe: {
    type: Number,
    required: [true, "El importe es requerido"],
  },
  descripcion: {
    type: String,
    required: true,
    emun: ["MONEDAS DE 50", "MONEDAS DE 100",
      "MONEDAS DE 500", "MONEAS DE 1.000",
      "BILLERES DE 2.000", "BILLETES DE 5.000", "BILLETES DE 10.000", "BILLETES DE 20.000", "BILLETES DE 50.000", "BILLETES DE 100.000"],
  }
  
});

const TurnoSchema = new Schema({
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
  caja: {
    type: Schema.Types.ObjectId,
    ref: "Caja",
    required: [true, "La caja es obligatoria"],
  },
  totalesIngreso: {
    type: [totalesIngreso],
    default: []
  },
  totalesEgreso: {
    type: [totalesEgreso],
    default: []
  },
  ventas: [PedidoSchema],
  pedidosCancelados: [PedidoSchema],
  dineroCaja: [dineroCaja],
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


module.exports = model("Turno", TurnoSchema);
