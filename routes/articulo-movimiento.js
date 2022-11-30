const { Router } = require('express');
const { check, oneOf } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const { filter, enviar, recibir, reponer } = require('../controllers/stock/articulo-movimientos');
const {
  existeSucursalPorId,
  existeArticuloPorId,
  existeArticuloMovimientoPorId,
} = require('../helpers/db-validators');
const { EstadoMovimientoArticulo } = require('../helpers/constants');

const router = Router();

/**
 * {{url}}/api/articulo-movimientos
 */

router.get(
  '/',
  [
    validarJWT,
    check('sucursalOrigen').custom(existeSucursalPorId).optional(),
    check('sucursalDestino').custom(existeSucursalPorId).optional(),
    check('estado', 'Estado del movimiento no es valido')
      .isIn([
        EstadoMovimientoArticulo.PENDIENTE,
        EstadoMovimientoArticulo.ATENCION,
        EstadoMovimientoArticulo.RECHAZADO,
        EstadoMovimientoArticulo.FINALIZADO,

        'TODOS',
      ])
      .optional(),
    validarCampos,
  ],
  filter
);

router.post(
  '/enviar',
  [
    validarJWT,
    check('sucursalOrigen').custom(existeSucursalPorId),
    check('sucursalDestino').custom(existeSucursalPorId),
    check('detalles', 'La lista de detalles es obligatoria').notEmpty().isArray(),
    check('detalles.*.articulo', 'El articulo es obligatorio').not().isEmpty(),
    check('detalles.*.articulo._id', 'No es un id de Mongo').isMongoId(),
    check('detalles.*.articulo._id').custom(existeArticuloPorId),
    check('detalles.*.enviado', 'La cantidad enviada debe ser numerica')
      .isNumeric({ min: 1 })
      .not()
      .isEmpty(),
    // oneOf([
    //   [
    //     check('detalles.*.recibido', 'La cantidad  es obligatoria').isNumeric().optional(),
    //     check('detalles.*.enviado', 'La cantidad enviada es obligatoria')
    //       .isNumeric()
    //       .not()
    //       .isEmpty(),
    //   ],
    //   [
    //     check('detalles.*.enviado', 'La cantidad es obligatoria').isNumeric().optional(),
    //     check('detalles.*.recibido', 'La cantidad recibida es obligatoria')
    //       .isNumeric()
    //       .not()
    //       .isEmpty(),
    //   ],
    // ]),
    validarCampos,
  ],
  enviar
);

router.put(
  '/recibir/:id/:codigo',
  [
    validarJWT,
    check('id').custom(existeArticuloMovimientoPorId),
    check('sucursalOrigen').custom(existeSucursalPorId),
    check('sucursalDestino').custom(existeSucursalPorId),
    check('detalles', 'La lista de detalles es obligatoria').notEmpty().isArray(),
    check('detalles.*.articulo', 'El articulo es obligatorio').not().isEmpty(),
    check('detalles.*.articulo._id', 'No es un id de Mongo').isMongoId(),
    check('detalles.*.articulo._id').custom(existeArticuloPorId),
    check('detalles.*.recibido', 'La cantidad recibida debe ser numerica')
      .isNumeric({ min: 1 })
      .optional(),
    check('estado', 'Estado del movimiento no es valido')
      .isIn([EstadoMovimientoArticulo.FINALIZADO,
         EstadoMovimientoArticulo.ATENCION,
         EstadoMovimientoArticulo.RECHAZADO]).not().isEmpty(),
    validarCampos,
  ],
  recibir
);

router.put(
  '/reponer/:id',
  [validarJWT, check('id').custom(existeArticuloMovimientoPorId), validarCampos],
  reponer
);

module.exports = router;
