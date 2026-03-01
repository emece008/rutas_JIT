// Utilidad para gestionar el cruce de medianoche
testCruceMedianoche = (horaPrevista) => {
    // horaPrevista en formato 'HH:mm' o Date
    if (typeof horaPrevista === 'string') {
        const [h, m] = horaPrevista.split(':').map(Number);
        return h < 5;
    }
    if (horaPrevista instanceof Date) {
        return horaPrevista.getHours() < 5;
    }
    return false;
};

module.exports = { testCruceMedianoche };