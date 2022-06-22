const {
    Usuario,
    Perfil,
    Producto,
    Role,
    Vehiculo,
    MarcaVehiculo,
    TipoVehiculo,
    Persona,
    Cliente,
    Aseguradora,
    Proveedor,
    Presupuesto,
    Concesionaria,
    OrdenTrabajo,
    Articulo,
    Marca,
    LineaArticulo,
    Familia,
} = require('../models');

const ObjectId = require('mongoose').Types.ObjectId;


const esRoleValido = async(rol = '') => {

    const existeRol = await Role.findOne({ rol });
    if (!existeRol) {
        throw new Error(`El rol ${ rol } no está registrado en la BD`);
    }
};

const esPerfilValido = async(perfil = '') => {

    const existe = await Perfil.findById(perfil);
    if (!existe) {
        throw new Error(`El perfil ${ perfil } no está registrado en la BD`);
    }
};

const usernameExiste = async(username = '') => {

    // Verificar si el username existe
    const existe = await Usuario.findOne({ username });
    if (existe) {
        throw new Error(`El username: ${ username }, ya está registrado`);
    }
};

const existeUsuarioPorId = async(id) => {

    // Verificar si el correo existe
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Perfil
 */
const existePerfilPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Perfil.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Productos
 */
const existeProductoPorId = async(id) => {

    // Verificar si el correo existe
    const existeProducto = await Producto.findById(id);
    if (!existeProducto) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Vehiculos
 */
const existeVehiculoPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Vehiculo.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const chapaExiste = async(chapa = '') => {

    // Verificar si el username existe
    const existe = await Vehiculo.findOne({ chapa: chapa.toUpperCase() });
    if (existe) {
        throw new Error(`la chapa: ${ chapa }, ya está registrado`);
    }
};

const chapaNoExiste = async(chapa = '') => {

    // Verificar si el username existe
    const existe = await Vehiculo.findOne({ chapa: chapa.toUpperCase() });
    if (!existe) {
        throw new Error(`la chapa: ${ chapa }, no está registrado`);
    }
};

/**
 * Marca Vehiculos
 */
const existeMarcaVehiculoPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await MarcaVehiculo.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Tipo Vehiculo
 */
const existeTipoVehiculoPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await TipoVehiculo.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Personas
 */
const existePersonaPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Persona.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const nroDocExiste = async(nroDoc = '') => {

    // Verificar si el username existe
    const existe = await Persona.findOne({ nroDoc });
    if (existe) {
        throw new Error(`la persona con doc: ${ nroDoc }, ya está registrado`);
    }
};

/**
 * Clientes
 */
const existeClientePorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Cliente.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const existeClientePorDoc = async(nroDoc = "") => {

    const persona = await Persona.findOne({ nroDoc });
    if (persona) {
        // Verificar si la persona existe como cliente
        const existe = await Cliente.findOne({ persona: new ObjectId(persona._id) });
        if (existe) {
            throw new Error(`Ya existe el cliente con doc: ${nroDoc}`);
        }
    }
};

/**
 * Aseguradoras
 */
const existeAseguradoraPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Aseguradora.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const existeAseguradoraPorClienteNroDoc = async(nroDoc = '') => {


    const persona = await Persona.findOne({ nroDoc });
    if (persona) {
        const cliente = await Cliente.findOne({ persona: new ObjectId(persona._id) });
        if (cliente) {
            // Verificar si el cliente existe
            const existe = await Aseguradora.findOne({ cliente: new ObjectId(cliente._id) });
            if (existe) {
                throw new Error(`El cliente ${ persona.nombreApellido }, ya existe como aseguradora`);
            }
        }
    }

};

/**
 * Concesionarias
 */
const existeConcesionariaPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Concesionaria.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const existeConcesionariaPorClienteNroDoc = async(nroDoc = '') => {


    const persona = await Persona.findOne({ nroDoc });
    if (persona) {
        const cliente = await Cliente.findOne({ persona: new ObjectId(persona._id) });
        if (cliente) {
            // Verificar si el cliente existe
            const existe = await Concesionaria.findOne({ cliente: new ObjectId(cliente._id) });
            if (existe) {
                throw new Error(`El cliente ${ persona.nombreApellido }, ya existe como concesionaria`);
            }
        }
    }

};

/**
 * Proveedores
 */
const existeProveedorPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Proveedor.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const existeProveedorPorNrodoc = async(nroDoc = '') => {

    const persona = await Persona.findOne({ nroDoc });
    if (persona) {
        // Verificar si la persona ya existe como aseguradora
        const existe = await Proveedor.findOne({ persona: new ObjectId(persona._id) });
        if (existe) {
            throw new Error(`La persona ${ persona.nombreApellido }, ya existe como proveedor`);
        }
    }
};

const existeProveedorPorIdPersona = async(id) => {

    // Verificar si el correo existe
    const existe = await Proveedor.findOne({ persona: new ObjectId(id) });
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Presupuestos
 */
const existePresupuestoPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Presupuesto.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Orden Trabajo
 */
const existeOrdenTrabajoPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await OrdenTrabajo.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Articulos
 */
const existeArticuloPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Articulo.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

const codArticuloExiste = async(codigo = '') => {

    // Verificar si el username existe
    const existe = await Articulo.findOne({ codigo });
    if (existe) {
        throw new Error(`El articulo con codigo: ${ codigo }, ya está registrado`);
    }
};

/**
 * Marca 
 */
const existeMarcaPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Marca.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Linea articulo 
 */
const existeLineaArticuloPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await LineaArticulo.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Familias
 */
const existeFamiliaPorId = async(id) => {

    // Verificar si el correo existe
    const existe = await Familia.findById(id);
    if (!existe) {
        throw new Error(`El id no existe ${ id }`);
    }
};

/**
 * Validar colecciones permitidas
 */
const coleccionesPermitidas = (coleccion = '', colecciones = []) => {

    const incluida = colecciones.includes(coleccion);
    if (!incluida) {
        throw new Error(`La colección ${ coleccion } no es permitida, ${ colecciones }`);
    }
    return true;
};

// crear persona si no existe
const crearPersonaSiNoExiste = async(personaData = Persona) => {

    const personaBD = await Persona.findOne({ nroDoc: personaData.nroDoc });
    // si la persona existe, retornar
    if (personaBD) return personaBD;

    console.log(`No existe la persona ${personaData.nroDoc}, agregar....`);
    // no existe la persona, agregar
    if (personaData.nroDoc.indexOf("-") > -1 && !personaData.ruc) {
        personaData.ruc = personaData.nroDoc;
        personaData.tipoDoc = "RUC";
    }
    personaData.nombreApellido = personaData.nombreApellido.toUpperCase();

    const newPersona = new Persona(personaData);
    return await newPersona.save();


};

// crear cliente si no existe
const crearClienteSiNoExiste = async(clienteData = Cliente) => {

    const clienteDB = await Cliente.findOne({ persona: new ObjectId(clienteData.persona) });
    // el cliente ya existe, retornar
    if (clienteDB) return clienteDB;

    console.log(`No existe el cliente con idpersona ${clienteData.persona}, agregar....`);

    const newCliente = new Cliente(clienteData);
    return await newCliente.save();


};

// crear vehiculo si no existe
const crearVehiculoSiNoExiste = async(vehiculoData = Vehiculo) => {

    const vehiculoDB = await Vehiculo.findOne({ chapa: vehiculoData.chapa });
    // el cliente ya existe, retornar
    if (vehiculoDB) return vehiculoDB;

    console.log(`No existe el vehiculo con chapa ${vehiculoData.chapa}, agregar....`);

    const newModel = new Vehiculo(clienteData);
    return await newModel.save();


};


module.exports = {
    esRoleValido,
    esPerfilValido,
    usernameExiste,
    existeUsuarioPorId,
    existePerfilPorId,
    existeProductoPorId,
    coleccionesPermitidas,
    existeVehiculoPorId,
    existeMarcaVehiculoPorId,
    chapaExiste,
    existeTipoVehiculoPorId,
    existePersonaPorId,
    nroDocExiste,
    existeClientePorId,
    existeClientePorDoc,
    existeAseguradoraPorId,
    existeAseguradoraPorClienteNroDoc,
    existeProveedorPorId,
    existeProveedorPorIdPersona,
    existeProveedorPorNrodoc,
    existePresupuestoPorId,
    existeOrdenTrabajoPorId,
    crearPersonaSiNoExiste,
    crearClienteSiNoExiste,
    crearVehiculoSiNoExiste,
    chapaNoExiste,
    existeConcesionariaPorId,
    existeConcesionariaPorClienteNroDoc,
    existeArticuloPorId,
    codArticuloExiste,
    existeMarcaPorId,
    existeLineaArticuloPorId,
    existeFamiliaPorId
};