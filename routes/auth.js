const { Router } = require('express');
const { check } = require('express-validator');


const { validarCampos, validarJWT } = require('../middlewares');


const { login, googleSignin, validarTokenUsuario } = require('../controllers/seguridad/auth');


const router = Router();

router.post('/login', [
    check('username', 'El username es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login);

// no se usa
router.post('/google', [
    check('id_token', 'El id_token es necesario').not().isEmpty(),
    validarCampos
], googleSignin);


router.get('/', [
    validarJWT
], validarTokenUsuario);

module.exports = router;