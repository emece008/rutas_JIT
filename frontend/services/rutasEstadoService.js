function parseHoraMinutos(hora) {
    if (!hora || typeof hora !== 'string') return null;
    const [h, m] = hora.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return (h * 60) + m;
}

function compararPorNombreRuta(a, b) {
    return a.nombre.localeCompare(b.nombre);
}


function deduplicarCiclos(ciclos = []) {
    const vistos = new Set();
    return ciclos.filter((ciclo) => {
        const clave = `${ciclo.ruta || ''}-${ciclo.numero || ''}-${ciclo.horaLlegadaPrevista || ''}`;
        if (vistos.has(clave)) return false;
        vistos.add(clave);
        return true;
    });
}

function obtenerRutasUnicas(hoja) {
    const mapa = new Map();
    (hoja?.ciclos || []).forEach((ciclo) => {
        const key = ciclo.ruta;
        if (!key || mapa.has(key)) return;
        mapa.set(key, key);
    });
    return Array.from(mapa.values());
}

function obtenerEstadoRuta(ciclosRuta) {
    const tieneAbiertos = ciclosRuta.some(c => c.estado === 'Pendiente' || c.estado === 'En curso');
    if (tieneAbiertos) return 'pendiente';
    return 'cerrada';
}

function obtenerSiguienteRutaPorHora(hoja, referencia = new Date()) {
    const abiertos = (hoja?.ciclos || [])
        .filter(c => c.estado === 'Pendiente' || c.estado === 'En curso')
        .map(c => ({
            ruta: c.ruta,
            ciclo: c,
            llegada: parseHoraMinutos(c.horaLlegadaPrevista),
            salida: parseHoraMinutos(c.horaSalidaPrevista),
            orden: Number.isFinite(c.orden) ? c.orden : Number.MAX_SAFE_INTEGER
        }))
        .filter(c => c.llegada !== null && c.salida !== null)
        .sort((a, b) => {
            if (a.llegada !== b.llegada) return a.llegada - b.llegada;
            if (a.ruta !== b.ruta) return a.ruta.localeCompare(b.ruta);
            return a.orden - b.orden;
        });

    if (abiertos.length === 0) return null;

    const ahora = (referencia.getHours() * 60) + referencia.getMinutes();

    const activa = abiertos.find(({ llegada, salida }) => {
        if (salida < llegada) {
            return ahora >= llegada || ahora <= salida;
        }
        return ahora >= llegada && ahora <= salida;
    });
    if (activa) return activa;

    const proxima = abiertos.find(c => c.llegada >= ahora);
    return proxima || abiertos[0];
}

function dividirRutasPorEstado(hoja, referencia = new Date()) {
    const hojaNormalizada = { ...hoja, ciclos: deduplicarCiclos(hoja?.ciclos || []) };
    const siguiente = obtenerSiguienteRutaPorHora(hojaNormalizada, referencia);
    const principal = siguiente ? siguiente.ruta : null;

    const pendientes = [];
    const cerradas = [];

    obtenerRutasUnicas(hojaNormalizada).forEach((nombreRuta) => {
        if (nombreRuta === principal) return;
        const ciclos = (hojaNormalizada?.ciclos || []).filter(c => c.ruta === nombreRuta);
        const estado = obtenerEstadoRuta(ciclos);
        if (estado === 'pendiente') {
            pendientes.push({ nombre: nombreRuta, ciclos });
            return;
        }
        cerradas.push({ nombre: nombreRuta, ciclos });
    });

    pendientes.sort(compararPorNombreRuta);
    cerradas.sort(compararPorNombreRuta);

    const rutaPrincipal = principal
        ? { nombre: principal, ciclos: (hojaNormalizada?.ciclos || []).filter(c => c.ruta === principal) }
        : null;

    return { principal: rutaPrincipal, pendientes, cerradas };
}

export {
    dividirRutasPorEstado,
    obtenerSiguienteRutaPorHora,
    parseHoraMinutos
};
