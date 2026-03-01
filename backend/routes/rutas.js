const { detectarSiguienteRutaPorHora } = require('../services/detectorSiguiente');
const { toggleEstadoCiclo } = require('../services/gestorEstados');

function getNextRuta(req, res) {
    const hojaDia = req?.hojaDia || req?.body?.hojaDia;
    const siguiente = detectarSiguienteRutaPorHora(hojaDia, new Date());

    if (!siguiente) {
        return res.status(404).json({ message: 'No hay rutas pendientes' });
    }

    return res.json(siguiente);
}

function closeRuta(req, res) {
    const { id } = req.params || {};
    const hojaDia = req?.hojaDia || req?.body?.hojaDia;
    const manual = Boolean(req?.body?.manual);

    const ruta = (hojaDia?.rutas || []).find((item) => item.nombre === id);
    if (!ruta) {
        return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    const timestamp = new Date().toISOString();

    ruta.ciclos.forEach((ciclo) => {
        if (ciclo.estado === 'Pendiente' || ciclo.estado === 'En curso') {
            if (manual) {
                toggleEstadoCiclo(ciclo, 'Cerrado manual');
                ciclo.cierreManual = true;
                ciclo.timestampCierreManual = timestamp;
                return;
            }
            toggleEstadoCiclo(ciclo, 'Completado');
        }
    });

    return res.json({
        ruta: ruta.nombre,
        manual,
        timestamp,
        status: 'ok'
    });
}

module.exports = { getNextRuta, closeRuta };
