const { Router } = require('express');
const { check } = require('express-validator');

const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');


const { esRoleValido, esPerfilValido, usernameExiste, existeUsuarioPorId } = require('../helpers/db-validators');

const {
    getById,
    usuariosGet,
    usuariosPut,
    usuariosPost,
    usuariosDelete,
} = require('../controllers/seguridad/usuarios');

const router = Router();


router.get('/', usuariosGet);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], getById);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    // check('rol').custom( esRoleValido ), 
    validarCampos
], usuariosPut);

router.post('/', [
    check('nombreApellido', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 letras').isLength({ min: 6 }),
    // check('correo', 'El correo no es válido')
    check('username').custom(usernameExiste),
    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    check('rol').custom(esRoleValido),
    check('perfiles').custom(esPerfilValido),
    validarCampos
], usuariosPost);

router.delete('/:id', [
    validarJWT,
    // esAdminRole,
    tieneRole('ADMIN_ROLE', 'VENTAR_ROLE', 'OTRO_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], usuariosDelete);



module.exports = router;