const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const {
    add,
    getAll,
    getById,
    update,
    inactivate
} = require('../controllers/seguridad/menus');
const { existePerfilPorId } = require('../helpers/db-validators');

const router = Router();

/**
 * {{url}}/api/categorias
 */

//  Obtener todas las categorias - publico
router.get('/', getAll);

// Obtener una categoria por id - publico
router.get('/:id', [
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existePerfilPorId),
    validarCampos,
], getById);

// Crear categoria - privado - cualquier persona con un token válido
router.post('/', [
    validarJWT,
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    validarCampos
], add);

// Actualizar - privado - cualquiera con token válido
router.put('/:id', [
    validarJWT,
    check('descripcion', 'la descripcion es obligatorio').not().isEmpty(),
    check('id').custom(existePerfilPorId),
    validarCampos
], update);

// Borrar una categoria - Admin
router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom(existePerfilPorId),
    validarCampos,
], inactivate);



module.exports = router;