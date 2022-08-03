const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarJWT } = require("../middlewares");

const {
  login,
  googleSignin,
  validarTokenUsuario,
} = require("../controllers/seguridad/auth");

const router = Router();

/**
 * @swagger
 * /auth/login:
 *  post:
 *    tags: ["Seguridad"]
 *    summary: Autenticación del usuario
 *    description: ""
 *    produces: ["application/json"]
 *    parameters:
 *      - name: body
 *        in: "body"
 *        description: "Credenciales"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/UserCredencials"
 *
 *    responses:
 *      '200':
 *        description: Autenticación exitosa
 *        schema:
 *           properties:
 *            usuario:
 *              $ref: "#/definitions/Usuario"
 *            token:
 *              type: string
 *            perfilActual:
 *              $ref: "#/definitions/Perfil"
 *      '401':
 *        description: Credenciales inválidas
 *      '400':
 *        description: Parametros inválidos
 */
router.post(
  "/login",
  [
    check("username", "El username es obligatorio").not().isEmpty(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

// no se usa
router.post(
  "/google",
  [
    check("id_token", "El id_token es necesario").not().isEmpty(),
    validarCampos,
  ],
  googleSignin
);

router.get("/", [validarJWT], validarTokenUsuario);

module.exports = router;
