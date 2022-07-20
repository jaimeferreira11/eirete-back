
const skipAcentAndSpace = (text = "") => {
    let acento = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    let espacio = acento.replace(/ /g, "")
    return espacio.toUpperCase();
 }

 module.exports = {
    skipAcentAndSpace
}