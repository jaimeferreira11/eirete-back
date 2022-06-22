const { Schema, model } = require('mongoose');

const ProgramaSchema = Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    estado: {
        type: Boolean,
        default: true
    },
    icono: {
        type: String,
    },
    url: {
        type: String,
        required: [true, 'la url es obligatoria']
    },
    orden: {
        type: Number,
    }
});


module.exports = model('Programa', ProgramaSchema);