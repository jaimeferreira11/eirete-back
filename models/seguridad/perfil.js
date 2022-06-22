const { Schema, model } = require('mongoose');

const PerfilSchema = Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    estado: {
        type: Boolean,
        default: true
    },
});


module.exports = model('Perfil', PerfilSchema);