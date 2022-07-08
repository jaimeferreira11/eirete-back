const { Schema, model } = require("mongoose");
const diffHistory = require('mongoose-audit-trail');


const UsuarioSchema = Schema({
  username: {
    type: String,
    required: [true, "El username es obligatorio"],
    lowercase: true,
    trim: true,
    unique: true,
  },
  nombreApellido: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  password: {
    type: String,
    min: 6,
    required: [true, "La contraseña es obligatoria"],
  },
  rol: {
    type: String,
    required: true,
    default: "USER_ROLE",
    emun: ["ROOT_ROLE", "ADMIN_ROLE", "USER_ROLE"],
  },
  estado: {
    type: Boolean,
    required: true,
    default: true,
  },
  perfiles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Perfil",
      required: true,
    },
  ],
  img: {
    type: String,
  },
  correo: {
    type: String,
  },
  celular: {
    type: String,
  },
  sucursal: {
    type: Schema.Types.ObjectId,
    ref: "Sucursal",
    required: true,
  },
});

// evitar que devuelva la contraseña
UsuarioSchema.methods.toJSON = function () {
  const { __v, password, ...usuario } = this.toObject();
  //  usuario.uid = _id;
  return usuario;
};

UsuarioSchema.plugin(diffHistory.plugin);


module.exports = model("Usuario", UsuarioSchema);
