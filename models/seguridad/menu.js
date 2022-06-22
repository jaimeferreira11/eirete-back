const { Schema, model } = require('mongoose');

const MenuSchema = Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    perfil: {
        type: Schema.Types.ObjectId,
        ref: 'Perfil',
        required: true
    },
    estado: {
        type: Boolean,
        default: true
    },
    icono: {
        type: String,
    },
    orden: {
        type: Number,
    },
    programas: [{
        type: Schema.Types.ObjectId,
        ref: "Programa"
    }]
});


module.exports = model('Menu', MenuSchema);