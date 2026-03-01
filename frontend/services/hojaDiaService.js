// Servicio para gestionar hoja del día (simulado)
export let hojaDia = null;

export function crearHojaDia({ fecha, operario, rutas }) {
    hojaDia = {
        fecha,
        operario,
        rutas,
        estado: 'Abierta',
        ciclos: []
    };
    return hojaDia;
}

export function cerrarHojaDia() {
    if (hojaDia) hojaDia.estado = 'Cerrada';
}