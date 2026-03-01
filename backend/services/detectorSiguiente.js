function parseHoraMinutos(hora) {
    if (!hora || typeof hora !== 'string') return null;
    const [h, m] = hora.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return (h * 60) + m;
}

function estadoAbierto(estado) {
    return estado === 'Pendiente' || estado === 'En curso';
}

function buildPendientesOrdenados(hojaDia) {
    const pendientes = [];
    (hojaDia?.rutas || []).forEach((ruta) => {
        (ruta.ciclos || []).forEach((ciclo) => {
            if (!estadoAbierto(ciclo.estado)) return;
            const llegadaMin = parseHoraMinutos(ciclo.horaLlegadaPrevista);
            const salidaMin = parseHoraMinutos(ciclo.horaSalidaPrevista);
            if (llegadaMin === null || salidaMin === null) return;
            pendientes.push({
                ruta: ruta.nombre,
                ciclo,
                orden: Number.isFinite(ciclo.orden) ? ciclo.orden : Number.MAX_SAFE_INTEGER,
                llegadaMin,
                salidaMin
            });
        });
    });

    pendientes.sort((a, b) => {
        if (a.llegadaMin !== b.llegadaMin) return a.llegadaMin - b.llegadaMin;
        if (a.ruta !== b.ruta) return a.ruta.localeCompare(b.ruta);
        return a.orden - b.orden;
    });

    return pendientes;
}

function detectarSiguienteRutaPorHora(hojaDia, referencia = new Date()) {
    const pendientes = buildPendientesOrdenados(hojaDia);
    if (pendientes.length === 0) return null;

    const ahoraMin = (referencia.getHours() * 60) + referencia.getMinutes();

    const activa = pendientes.find(({ llegadaMin, salidaMin }) => {
        if (salidaMin < llegadaMin) {
            return ahoraMin >= llegadaMin || ahoraMin <= salidaMin;
        }
        return ahoraMin >= llegadaMin && ahoraMin <= salidaMin;
    });

    if (activa) return { ruta: activa.ruta, ciclo: activa.ciclo };

    const proxima = pendientes.find(({ llegadaMin }) => llegadaMin >= ahoraMin);
    if (proxima) return { ruta: proxima.ruta, ciclo: proxima.ciclo };

    const primeraDelDia = pendientes[0];
    return { ruta: primeraDelDia.ruta, ciclo: primeraDelDia.ciclo };
}

function detectarSiguienteCiclo(hojaDia) {
    return detectarSiguienteRutaPorHora(hojaDia);
}

module.exports = {
    detectarSiguienteCiclo,
    detectarSiguienteRutaPorHora,
    parseHoraMinutos
};
