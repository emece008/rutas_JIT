import { horaToMinutes, pickPendiente } from './tiempoUtils.js';

export function getHojaStorageSafe() {
    try {
        return JSON.parse(localStorage.getItem('hoja_carga') || 'null');
    } catch {
        return null;
    }
}

export function calcularResumenOperativo(hoja, now = new Date()) {
    if (!hoja || !hoja.ciclos || hoja.ciclos.length === 0) {
        return {
            hasData: false,
            retrasadas: [],
            actual: '-',
            proxima: '-',
            siguiente: '-',
            actualDetalle: '-',
            proximaDetalle: '-',
            siguienteDetalle: '-',
            pendientesOrdenados: []
        };
    }

    const rutasMap = new Map();
    hoja.ciclos.forEach(ciclo => {
        const nombre = ciclo.ruta || 'Sin ruta';
        if (!rutasMap.has(nombre)) rutasMap.set(nombre, []);
        rutasMap.get(nombre).push(ciclo);
    });

    const minutosAhora = now.getHours() * 60 + now.getMinutes();
    const resumenRutas = Array.from(rutasMap.entries()).map(([ruta, ciclos]) => {
        const pendiente = pickPendiente(ciclos);
        const horaRef = pendiente?.horaSalidaPrevista || pendiente?.horaLlegadaPrevista;
        const minutosPlan = horaToMinutes(horaRef);
        const minutosRetraso = minutosPlan === null ? 0 : Math.max(0, minutosAhora - minutosPlan);
        const viaje = pendiente?.numero ?? null;
        return { ruta, viaje, minutosPlan, minutosRetraso };
    }).sort((a, b) => {
        if (a.minutosPlan === null && b.minutosPlan === null) return a.ruta.localeCompare(b.ruta);
        if (a.minutosPlan === null) return 1;
        if (b.minutosPlan === null) return -1;
        return a.minutosPlan - b.minutosPlan;
    });

    const retrasadas = resumenRutas.filter(r => r.minutosRetraso > 0);
    const enHorario = resumenRutas.filter(r => r.minutosRetraso === 0);
    const actual = enHorario[0] || null;
    const proxima = enHorario[1] || null;
    const siguiente = enHorario[2] || null;

    function detalleViaje(item) {
        if (!item) return '-';
        if (item.viaje === null || item.viaje === undefined) return item.ruta;
        return `${item.ruta} · Viaje ${item.viaje}`;
    }

    return {
        hasData: true,
        retrasadas,
        actual: actual?.ruta || '-',
        proxima: proxima?.ruta || '-',
        siguiente: siguiente?.ruta || '-',
        actualDetalle: detalleViaje(actual),
        proximaDetalle: detalleViaje(proxima),
        siguienteDetalle: detalleViaje(siguiente),
        pendientesOrdenados: resumenRutas
    };
}
