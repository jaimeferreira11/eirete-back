const ClienteOcasional = "999999";

const TipoPedido = {
  REGULAR: "REGULAR",
  DELIVERY: "DELIVERY",
};

const TipoFactura = {
  CONTADO: "CONTADO",
  CREDITO: "CREDITO",
};

const EstadoPedido = {
  PENDIENTE: "PENDIENTE",
  PAGADO: "PAGADO",
  FACTURADO: "FACTURADO",
  CANCELADO: "CANCELADO",
  ANULADO: "ANULADO",
  REVERSADO: "REVERSADO",
};
const EstadoDelivery = {
  EN_ESPERA: "EN ESPERA",
  EN_CAMINO: "EN CAMINO",
  ENTREGADOO: "ENTREGADO",
  PERDIDO: "PERDIDO",
};

const TipoImpuesto = {
  5: { dividendo: 21 },
  10: { dividendo: 11 },
  0: { dividendo: 0 },
};

module.exports = {
  ClienteOcasional,
  TipoPedido,
  EstadoPedido,
  EstadoDelivery,
  TipoImpuesto,
  TipoFactura,
};
