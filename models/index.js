// Seguridad
const Role = require("./seguridad/role");
const Perfil = require("./seguridad/perfil");
const Usuario = require("./seguridad/usuario");
const Menu = require("./seguridad/menu");
const Programa = require("./seguridad/programa");

// Catastro
const Cliente = require("./catastro/clientes");
const Persona = require("./catastro/persona");
const Ciudad = require("./catastro/ciudades");

//Stock
const Sucursal = require("./stock/sucursal");
const LineaArticulo = require("./stock/linea-articulo");
const Articulo = require("./stock/articulo");
const ArticuloSucursal = require("./stock/articulo-sucursal");

// transaccion
const { Pedido, PedidoSchema, PedidoDetalle } = require("./transaccion/pedido");

// tesoreria
const Caja = require("./tesoreria/caja");
const CategoriaMovimiento = require("./tesoreria/categoria-movimiento");
const Movimiento = require("./tesoreria/movimiento");
const Arqueo = require("./tesoreria/arqueo");
const Turno = require("./tesoreria/turno");

// reportes
const EstadisticaVentas = require("./reportes/estadistica-ventas");

const Server = require("./server");

module.exports = {
  Role,
  Server,
  Usuario,
  Perfil,
  Menu,
  Programa,
  Cliente,
  Persona,
  Sucursal,
  LineaArticulo,
  Articulo,
  ArticuloSucursal,
  Pedido,
  PedidoSchema,
  PedidoDetalle,
  Caja,
  Ciudad,
  CategoriaMovimiento,
  Movimiento,
  Arqueo,
  Turno,
  EstadisticaVentas,
};
