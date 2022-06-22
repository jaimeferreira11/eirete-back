const { response } = require('express');
const { Persona } = require('../../models');


const getAll = async(req, res = response) => {

    const { limite = 10, desde = 0 } = req.query;

    const [total, data] = await Promise.all([
        Persona.countDocuments(),
        Persona.find()
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username')
        .skip(Number(desde))
        .limit(Number(limite))
    ]);

    res.json({
        total,
        data
    });
};

const getById = async(req, res = response) => {

    const { id } = req.params;
    const modelDB = await Persona.findById(id)
        .populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username');

    res.json(modelDB);

};

const getByDocAndTipoDoc = async(req, res = response) => {

    const { nroDoc, tipoDoc = "CI" } = req.query;
    console.log(`Buscando la persona con doc  ${nroDoc}`);

    const modelDB = await existePersonaByNroDocAndTipoDoc(nroDoc, tipoDoc);
    if (!modelDB) {
        console.log(`No existe la persona: ${ tipoDoc }-${ nroDoc }`);
        return res.status(404).json({
            msg: `No existe la persona: ${ tipoDoc }-${ nroDoc }`
        });
    }

    return res.json(modelDB);

};

const add = async(req, res = response) => {


    try {
        const { _id, ruc, nroDoc, tipoDoc } = req.body;
        if (_id) {
            const modelDB = await Persona.findById(_id);
            if (modelDB) {
                return res.status(400).json({
                    msg: `El Persona ${ modelDB.nrodoc }, ya existe`
                });
            }
        }

        if (await existePersonaByNroDocAndTipoDoc(nroDoc, tipoDoc)) {
            return res.status(400).json({
                msg: `Ya existe la persona: ${ tipoDoc }-${ nroDoc }`
            });
        }
        // Generar la data a guardar
        req.body._id = null;

        const newModel = await addPersona(req.body, req.usuario._id);
        res.json(newModel);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: `Hable con el administrador`
        });
    }


};

const update = async(req, res = response) => {

    const { id } = req.params;
    const { usuarioAlta, fechaAlta, ...data } = req.body;

    data._id = id;
    const newModel = updatePersona(data, req.usuario._id);

    //  await Persona.findByIdAndUpdate(id, data, { new: true });

    res.json(newModel);

};


const existePersonaByNroDocAndTipoDoc = async(nroDoc = '', tipoDoc = 'CI') => {

    return await Persona.findOne({ nroDoc: nroDoc, tipoDoc: tipoDoc }).populate('usuarioAlta', 'username')
        .populate('usuarioModif', 'username');

};

const addPersona = async(newPersona = Persona, usuario_id = null) => {

    try {

        if (existePersonaByNroDocAndTipoDoc(newPersona.nroDoc, newPersona.tipoDoc)) {
            throw new Error(`La persona con doc: ${ newPersona.tipoDoc }-${ newPersona.nroDoc }, ya está registrado`);
        }

        // preguntar si tiene ruc
        if (newPersona.nroDoc.indexOf("-") > -1 && !newPersona.ruc) {
            newPersona.ruc = newPersona.nroDoc;
            newPersona.tipoDoc = "RUC";
        }
        newPersona.usuarioAlta = usuario_id;
        newPersona.nombreApellido = newPersona.nombreApellido.toUpperCase();

        return await newPersona.save();
    } catch (error) {
        console.log('Error al agregar la persona', error);
        throw (error);
    }
};


const updatePersona = async(personaUpdated = Persona, usuario_id = null) => {

    try {

        const { usuarioAlta, fechaAlta, nroDoc, tipoDoc, ...data } = personaUpdated;
        console.log(`Actualizando persona: ${nroDoc}`);
        data.usuarioModif = usuario_id;
        data.fechaModif = Date.now();
        data.nombreApellido = data.nombreApellido.toUpperCase();
        return await Persona.findByIdAndUpdate(data._id, data, { new: true });
    } catch (error) {
        console.log('Error al actualizar la persona', error);
        throw (error);
    }

};







module.exports = {
    add,
    getAll,
    getById,
    getByDocAndTipoDoc,
    update,
    updatePersona,
    addPersona,
    existePersonaByNroDocAndTipoDoc
};