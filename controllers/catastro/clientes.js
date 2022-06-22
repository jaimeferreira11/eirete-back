const { response } = require('express');
const { Cliente, Persona } = require('../../models');
const { updatePersona } = require('./personas');
const ObjectId = require('mongoose').Types.ObjectId;



const getAll = async(req, res = response) => {

    const { limite = 10, desde = 0, paginado = true } = req.query;
    const query = { estado: true };

    if (paginado == true) {

        const [total, data] = await Promise.all([
            Cliente.countDocuments(query),
            Cliente.find(query)
            .populate('persona', '-__v')
            .populate('usuarioAlta', 'username')
            .populate('usuarioModif', 'username')
            .skip(Number(desde))
            .limit(Number(limite))
        ]);

        res.json({
            total,
            data
        });
    } else {
        const data = await Cliente.find(query)
            .populate('persona', '-__v')
            .populate('usuarioAlta', 'username')
            .populate('usuarioModif', 'username');
        res.json(
            data
        );
    }
};

const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Cliente.findById(id)
        .populate('persona', '-__v')
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username');

    res.json(modelDB);

};

const getByPersonaId = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Cliente.findOne({ persona: ObjectId(id) })
        .populate('persona', '-__v')
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username');

    if (!modelDB) {
        return res.status(401).json({
            msg: `El Cliente no existe`
        });
    }

    res.json(modelDB);

};

const add = async(req, res = response) => {

    try {

        const { _id, } = req.body;
        if (_id) {
            const modelDB = await Cliente.findById(_id);
            if (modelDB) {
                return res.status(400).json({
                    msg: `El Cliente ${ modelDB.persona.nombreApellido }, ya existe`
                });
            }
        }
        // Generar la data a guardar
        let personaData = req.body.persona;
        personaData.usuarioAlta = req.usuario._id;

        let idCliente;
        if (!personaData._id) {
            console.log("Insertando persona");
            let newPersona = new Persona(personaData);
            await newPersona.save();
        } else {
            console.log("Ya existe la persona");
            // actualizar persona
            const personaUpdated = await Persona.findByIdAndUpdate(personaData._id, personaData, { new: true });
            const clienteDB = await Cliente.findOne({ persona: ObjectId(personaUpdated._id) });
            if (clienteDB) {
                idCliente = clienteDB._id;
                console.log('Existe el cliente, setear el id ');
            }
        }


        const persona = await Persona.findOne({ nroDoc: personaData.nroDoc });
        if (idCliente) {
            // actualizar
            console.log('Actualizando');
            const clienteData = {
                _id: idCliente,
                ...req.body,
                persona: persona._id,
                usuarioAlta: req.usuario._id
            };
            res.json(await Cliente.findByIdAndUpdate(idCliente, clienteData, { new: true }));
        } else {
            console.log('Insertando el cliente ');

            const clienteData = {
                ...req.body,
                _id: new ObjectId(),
                persona: persona._id,
                usuarioAlta: req.usuario._id
            };
            const newModel = new Cliente(clienteData);

            // Guardar DB
            await newModel.save();

            res.json(newModel);
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: `Hable con el administrador`
        });
    }



};

const update = async(req, res = response) => {

    try {

        const { id } = req.params;
        const { usuarioAlta, fechaAlta, nroDoc, tipoDoc, ...data } = req.body;

        data.usuarioModif = req.usuario._id;
        data.fechaModif = Date.now();

        await updatePersona(data.persona, req.usuario._id);

        const newModel = await Cliente.findByIdAndUpdate(id, data, { new: true });

        res.json(newModel);
    } catch (error) {
        res.status(400).json({ "msg": `Error al actualizar el cliente: ${error}` });
    }



};

const inactivate = async(req, res = response) => {

    const { id } = req.params;
    const modelBorrado = await Cliente.findByIdAndUpdate(id, { estado: false }, { new: true });

    res.json(modelBorrado);
};


module.exports = {
    add,
    getAll,
    getById,
    getByPersonaId,
    update,
    inactivate
};