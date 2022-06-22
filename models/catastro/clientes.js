const { Schema, model } = require('mongoose');

const ClienteSchema = Schema({
    persona: {
        type: Schema.Types.ObjectId,
        ref: 'Persona',
        required: [true, 'La persona es obligatoria'],
        unique: true
    },
    estado: {
        type: Boolean,
        required: [true, 'El estado es obligatorio'],
        default: true,
    },
    fechaAlta: {
        type: Date,
        require: true,
        default: Date.now,
    },
    usuarioAlta: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fechaModif: {
        type: Date,
    },
    usuarioModif: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
    },


});



module.exports = model('Cliente', ClienteSchema);