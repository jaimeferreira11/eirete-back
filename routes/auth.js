const { Router } = require('express');
const { check } = require('express-validator');


const { validarCampos, validarJWT } = require('../middlewares');


const { login, googleSignin, validarTokenUsuario } = require('../controllers/seguridad/auth');


const router = Router();

/**
@swagger
   components:
     schemas:
       Book:
         type: object
         required:
           - title
           - author
           - finished
         properties:
           id:
             type: integer
             description: The auto-generated id of the book.
           title:
             type: string
             description: The title of your book.
           author:
             type: string
             description: Who wrote the book?
           finished:
             type: boolean
             description: Have you finished reading it?
           createdAt:
             type: string
             format: date
             description: The date of the record creation.
         example:
            title: The Pragmatic Programmer
            author: Andy Hunt / Dave Thomas
            finished: true
 */


            /** 
            @swagger
            tags:
              name: Books
              description: API to manage your books.
           */

/**
 * @swagger
 * /customers:
 *  get: 
 *    description: Obtém a lista de clientes
 *    responses:
 *      '200': 
 *        description: Clientes obtidos com sucesso 
 */
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