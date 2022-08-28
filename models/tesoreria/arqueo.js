const { Schema, model } = require("mongoose");
const diffHistory = require("mongoose-audit-trail");
const {
  EfectivoMoneda,
  EfectivobilleteMoneda,
} = require("../../helpers/constants");

const efectivo = new Schema({
  cantidad: {
    type: Number,
    required: [true, "La cantidad es requerida"],
  },
  descripcion: {
    type: String,
    required: true,
    emun: [
      EfectivoMoneda[50],
      EfectivoMoneda[100],
      EfectivoMoneda[500],
      EfectivoMoneda[1000],
      EfectivobilleteMoneda[2000],
      EfectivobilleteMoneda[5000],
      EfectivobilleteMoneda[10000],
      EfectivobilleteMoneda[20000],
      EfectivobilleteMoneda[50000],
      EfectivobilleteMoneda[100000],
    ],
  },
});

const articuloStock = new Schema({
  articulo: {
    type: Schema.Types.ObjectId,
    ref: "Articulo",
    required: [true, "El articulo es obligatorio"],
  },
  stock: {
    type: Number,
    required: [true, "La cantidad es obligatoria"],
  },
});

const ArqueoSchema = new Schema({
  turno: {
    type: Schema.Types.ObjectId,
    ref: "Turno",
    required: [true, "El turno es obligatoria"],
  },
  sucursal: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: [true, "La sucursal es obligatoria"],
  },
  stock: {
    type: [articuloStock],
    default: [],
    required: [true, "Los articulos son obligatorios"],
  },
  monedas: {
    type: [efectivo],
    default: [],
  },
  billetes: {
    type: [efectivo],
    default: [],
  },
  totalEfectivo: {
    type: Number,
    default: 0,
    required: [true, "El total efectivo es obligatorio"],
  },
  totalDeposito: {
    type: Number,
    default: 0,
    required: [true, "El total deposito es obligatorio"],
  },
  totalEgreso: {
    type: Number,
    default: 0,
    required: [true, "El total deposito es obligatorio"],
  },
  movimientos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Movimiento",
      required: true,
    },
  ],
  pedidosRealizados: [
    {
      type: Schema.Types.ObjectId,
      ref: "Pedido",
      required: true,
    },
  ],
  pedidosCancelados: [
    {
      type: Schema.Types.ObjectId,
      ref: "Pedido",
      required: true,
    },
  ],
  responsable: {
    type: String,
    required: [true, "El responsable es obligatorio"],
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

ArqueoSchema.plugin(diffHistory.plugin);

module.exports = model("Arqueo", ArqueoSchema);
