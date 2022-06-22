const { response } = require('express');
const { ObjectId } = require('mongoose').Types;

const {
    Usuario,
    Cliente,
    Producto,
    Persona,
    Vehiculo,
    Aseguradora,
    MarcaVehiculo
} = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'productos',
    'roles',
    'clientes',
    'vehiculos',
    'aseguradoras'

];

const buscarUsuarios = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE 

    if (esMongoID) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            data: (usuario) ? [usuario] : []
        });
    }

    const regex = new RegExp(termino, 'i');
    const usuarios = await Usuario.find({
        $or: [{ nombreApellido: regex }, { username: regex }],
        $and: [{ estado: true }]
    });

    res.json({
        data: usuarios
    });

};

const buscarClientes = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE 

    if (esMongoID) {
        const results = await Cliente.findById(termino);
        return res.json({
            data: (results) ? [results] : []
        });
    }

    console.log('Buscando el cliente con el termino', termino);

    const regex = new RegExp(termino.toUpperCase(), 'i');

    const results = await Cliente.find({ estado: true })
        .populate('persona', '-__v')
        .then(async customers => {
            let clientes = [];

            await Promise.all(customers.map(async(d) => {
                const persona = await Persona.findOne({
                    _id: d.persona,
                    $or: [{ nombreApellido: regex }, { nroDoc: regex }, { ruc: regex }],

                });
                if (persona) clientes.push(d);

            }));

            console.log(clientes.length);
            return clientes;
        });

    res.json({
        data: results
    });

};

const buscarAseguradoras = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE 

    if (esMongoID) {
        const results = await Cliente.findById(termino);
        return res.json({
            data: (results) ? [results] : []
        });
    }

    const regex = new RegExp(termino.toUpperCase(), 'i');

    const results = await Cliente.find({ estado: true })
        .populate('persona', '-__v')
        .then(async customers => {
            let clientes = [];

            await Promise.all(customers.map(async(d) => {
                const persona = await Persona.findOne({
                    _id: d.persona,
                    $or: [{ nombreApellido: regex }, { nroDoc: regex }, { ruc: regex }],

                });
                if (persona) clientes.push(d);

            }));

            return clientes;
        });

    res.json({
        data: results
    });

};

const buscarVehiculos = async(tipo, termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE 

    if (esMongoID) {
        const vehiculo = await Vehiculo.findById(termino);
        return res.json({
            data: (vehiculo) ? [vehiculo] : []
        });
    }

    const regex = new RegExp(termino.toUpperCase(), 'i');

    let results = [];
    switch (tipo) {
        case 'chapa':
            console.log(`buscando por chapa`);
            this.results = await Vehiculo.find({ chapa: regex })
                .populate({
                    path: 'cliente',
                    select: '-__v',
                    populate: {
                        path: 'persona',
                        select: '-__v'
                    }
                })
                .populate('marca', 'descripcion')
                .populate('tipoVehiculo', 'descripcion')
                .populate({
                    path: 'aseguradora',
                    select: '-__v',
                    populate: {
                        path: 'cliente',
                        select: '-__v',
                        populate: {
                            path: 'persona',
                            select: '-__v'
                        }
                    }
                })
                .populate('usuarioAlta', 'username')
                .populate('usuarioModif', 'username');

            break;
        case 'marca':

            this.results = await Vehiculo.find()
                .populate({
                    path: 'cliente',
                    select: '-__v',
                    populate: {
                        path: 'persona',
                        select: '-__v'
                    }
                })
                .populate('marca', 'descripcion')
                .populate('tipoVehiculo', 'descripcion')
                .populate('usuarioAlta', 'username')
                .populate({
                    path: 'aseguradora',
                    select: '-__v',
                    populate: {
                        path: 'cliente',
                        select: '-__v',
                        populate: {
                            path: 'persona',
                            select: '-__v'
                        }
                    }
                })
                .populate('usuarioModif', 'username')
                .then(async customers => {
                    let aux = [];

                    await Promise.all(customers.map(async(d) => {
                        const persona = await MarcaVehiculo.findOne({
                            _id: d.marca,
                            descripcion: regex,

                        });
                        if (persona) aux.push(d);

                    }));

                    console.log(aux.length);
                    return aux;
                });

            break;
        case 'cliente':

            this.results = await Vehiculo.find()
                .populate({
                    path: 'cliente',
                    select: '-__v',
                    populate: {
                        path: 'persona',
                        select: '-__v'
                    }
                })
                .populate('marca', 'descripcion')
                .populate('tipoVehiculo', 'descripcion')
                .populate({
                    path: 'aseguradora',
                    select: '-__v',
                    populate: {
                        path: 'cliente',
                        select: '-__v',
                        populate: {
                            path: 'persona',
                            select: '-__v'
                        }
                    }
                })
                .populate('usuarioAlta', 'username')
                .populate('usuarioModif', 'username')
                .then(async vehiculos => {
                    let aux = [];

                    console.log(`vehiculos ${vehiculos.length}`);
                    await Promise.all(vehiculos.map(async(v) => {

                        await Cliente.find({ estado: true, _id: v.cliente })
                            .populate('persona', '-__v')
                            .then(async clientes => {
                                console.log(`clientes: ${clientes.length}`);
                                let personas = [];

                                await Promise.all(clientes.map(async(c) => {
                                    const persona = await Persona.findOne({
                                        _id: c.persona,
                                        $or: [{ nombreApellido: regex }, { nroDoc: regex }, { ruc: regex }],

                                    });
                                    if (persona) aux.push(v);

                                }));

                                return personas;
                            });

                    }));

                    console.log('aux: ' + aux.length);
                    return aux;
                });

            break;
        default:
            break;
    }




    res.json({
        data: this.results
    });

};

const buscarProductos = async(termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE 

    if (esMongoID) {
        const producto = await Producto.findById(termino)
            .populate('categoria', 'nombre');
        return res.json({
            data: (producto) ? [producto] : []
        });
    }

    const regex = new RegExp(termino, 'i');
    const productos = await Producto.find({ nombre: regex, estado: true })
        .populate('categoria', 'nombre');

    res.json({
        data: productos
    });

};


const buscar = (req, res = response) => {

    const { coleccion, termino, tipo } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${ coleccionesPermitidas }`
        });
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            break;
        case 'categorias':
            buscarCategorias(termino, res);
            break;
        case 'productos':
            buscarProductos(termino, res);
            break;
        case 'clientes':
            buscarClientes(termino, res);
            break;
        case 'aseguradoras':
            buscarAseguradoras(termino, res);
            break;
        case 'vehiculos':
            buscarVehiculos(tipo, termino, res);
            break;

        default:
            res.status(500).json({
                msg: 'Se le olvido hacer esta búsquda'
            });
    }

};



module.exports = {
    buscar
};