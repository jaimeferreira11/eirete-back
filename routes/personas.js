const { Router } = require('express');
const { check, query } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const {
    add,
    getAll,
    getById,
    update,
    getByDocAndTipoDoc,
} = require('../controllers/catastro/personas');
const { existePersonaPorId, nroDocExiste } = require('../helpers/db-validators');

const router = Router();

/**
 * {{url}}/api/categorias
 */

//  Obtener todas las categorias - publico
router.get('/', [validarJWT, validarCampos], getAll);

// Obtener una categoria por id 
router.get('/:id', [
    validarJWT,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existePersonaPorId),
    validarCampos,
], getById);

// Obtener una categoria por id 
router.get('/search/doc', [
    validarJWT,
    query('nroDoc', 'El documento es obligatoria').not().isEmpty(),
    query('tipoDoc', 'No es tipo de documento válido').optional().isIn(['CI', 'RUC', 'DNI']),
    validarCampos,
], getByDocAndTipoDoc);

// Crear categoria - privado - cualquier persona con un token válido
router.post('/', [
    validarJWT,
    check('nroDoc', 'El documento es obligatoria').not().isEmpty(),
    check('nroDoc', 'El documento debe de al menos 6 digitos').isLength({ min: 6 }),
    check('nroDoc').custom(nroDocExiste),
    check('nombreApellido', 'El nombre es obligatoria').not().isEmpty(),
    check('nombreApellido', 'El nombre debe de ser más de 5 letras').isLength({ min: 5 }),
    check('tipoDoc', 'No es tipo de documento válido').optional().isIn(['CI', 'RUC', 'DNI']),
    check('sexo', 'No es un sexo válido').isIn(['M', 'F']),
    check('tipoPersona', 'No es un tipo persona válido').optional().isIn(['FISICA', 'JURIDICA']),
    validarCampos
], add);

// Actualizar - privado - cualquiera con token válido
router.put('/:id', [
    validarJWT,

    check('id').custom(existePersonaPorId),
    check('nroDoc', 'El documento es obligatoria').not().isEmpty(),
    check('nroDoc', 'El documento debe de al menos 6 digitos').isLength({ min: 6 }),
    check('nombreApellido', 'El nombre es obligatoria').not().isEmpty(),
    check('nombreApellido', 'El nombre debe de ser más de 5 letras').isLength({ min: 5 }),
    check('tipoDoc', 'No es un rol válido').isIn(['CI', 'RUC', 'DNI']),
    check('sexo', 'No es un sexo válido').isIn(['M', 'F']),
    check('tipoPersona', 'No es un tipo persona válido').isIn(['FISICA', 'JURIDICA']),
    validarCampos
], update);



module.exports = router;