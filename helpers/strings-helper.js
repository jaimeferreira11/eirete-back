const skipAcentAndSpace = (text = "") => {
  let acento = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let espacio = acento.replace(/ /g, "");
  return espacio.toUpperCase();
};

const skipAcent = (text = "") => {
  const acento = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return acento.toUpperCase();
};

module.exports = {
  skipAcent,
  skipAcentAndSpace,
};
