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
  EN_ESPERA: "EN_ESPERA",
  EN_CAMINO: "EN_CAMINO",
  ENTREGADO: "ENTREGADO",
  PERDIDO: "PERDIDO",
};

const MetodoPago = {
  EFECTIVO: "EFECTIVO",
  TARJETA: "TARJETA",
  TRANSFERENCIA: "TRANSFERENCIA",
  CHEQUE: "CHEQUE",
};

const TipoImpuesto = {
  5: { dividendo: 21 },
  10: { dividendo: 11 },
  0: { dividendo: 0 },
};

const EfectivoMoneda = {
  50: "Gs. 50",
  100: "Gs. 100",
  500: "Gs. 500",
  1000: "Gs. 1.000",
};

const EfectivobilleteMoneda = {
  2000: "Gs. 2.000",
  5000: "Gs. 5.000",
  10000: "Gs. 10.000",
  20000: "Gs. 20.000",
  50000: "Gs. 50.000",
  100000: "Gs. 100.000",
};

module.exports = {
  ClienteOcasional,
  TipoPedido,
  EstadoPedido,
  EstadoDelivery,
  TipoImpuesto,
  TipoFactura,
  EfectivoMoneda,
  EfectivobilleteMoneda,
  MetodoPago,
};
