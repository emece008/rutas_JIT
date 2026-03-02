import { horaToMinutes, pickPendiente } from './tiempoUtils.js';

function detalle(item) {
    if (!item) return '-';
    const viaje = item.viaje === null || item.viaje === undefined ? '-' : item.viaje;
    return `${item.ruta} · Viaje ${viaje}`;
}

export function getPanelOperativoState(datosRutas, rutaSeleccionada, fechaActual = new Date()) {
    const ciclos = Array.isArray(datosRutas) ? datosRutas : [];
    if (!ciclos.length) {
        return {
            retrasadas: [],
            actual: null,
            proxima: null,
            siguiente: null,
            seleccionada: null
        };
    }

    const rutasMap = new Map();
    ciclos.forEach(ciclo => {
        const ruta = ciclo?.ruta || 'Sin ruta';
        if (!rutasMap.has(ruta)) rutasMap.set(ruta, []);
        rutasMap.get(ruta).push(ciclo);
    });

    const minutosAhora = fechaActual.getHours() * 60 + fechaActual.getMinutes();
    const rutasEstado = Array.from(rutasMap.entries()).map(([ruta, ciclosRuta]) => {
        const pendiente = pickPendiente(ciclosRuta);
        const horaRef = pendiente?.horaSalidaPrevista || pendiente?.horaLlegadaPrevista;
        const minutosPlan = horaToMinutes(horaRef);
        const diffMin = minutosPlan === null ? null : minutosAhora - minutosPlan;
        return {
            ruta,
            viaje: pendiente?.numero ?? null,
            pendiente,
            minutosPlan,
            diffMin,
            minutosRetraso: diffMin === null ? 0 : Math.max(0, diffMin)
        };
    }).sort((a, b) => {
        if (a.minutosPlan === null && b.minutosPlan === null) return a.ruta.localeCompare(b.ruta);
        if (a.minutosPlan === null) return 1;
        if (b.minutosPlan === null) return -1;
        return a.minutosPlan - b.minutosPlan;
    });

    const retrasadas = rutasEstado.filter(r => r.diffMin !== null && r.diffMin > 0);
    const vencidasONow = rutasEstado
        .filter(r => r.diffMin !== null && r.diffMin >= 0)
        .sort((a, b) => a.diffMin - b.diffMin);
    const futuras = rutasEstado
        .filter(r => r.diffMin !== null && r.diffMin < 0)
        .sort((a, b) => b.diffMin - a.diffMin);

    let actual = vencidasONow[0] || null;
    let proxima = null;
    let siguiente = null;

    if (actual) {
        proxima = futuras[0] || null;
        siguiente = futuras[1] || null;
    } else {
        actual = futuras[0] || null;
        proxima = futuras[1] || null;
        siguiente = futuras[2] || null;
    }

    const seleccionada = rutaSeleccionada
        ? rutasEstado.find(r => r.ruta === rutaSeleccionada) || null
        : null;

    const seleccionadaFallback = (!seleccionada && rutaSeleccionada)
        ? {
            ruta: rutaSeleccionada,
            viaje: null,
            pendiente: null,
            minutosPlan: null,
            diffMin: null,
            minutosRetraso: 0,
            detalle: `${rutaSeleccionada} · Viaje -`
        }
        : null;

    return {
        retrasadas,
        actual: actual ? { ...actual, detalle: detalle(actual) } : null,
        proxima: proxima ? { ...proxima, detalle: detalle(proxima) } : null,
        siguiente: siguiente ? { ...siguiente, detalle: detalle(siguiente) } : null,
        seleccionada: seleccionada
            ? { ...seleccionada, detalle: detalle(seleccionada) }
            : seleccionadaFallback
    };
}
