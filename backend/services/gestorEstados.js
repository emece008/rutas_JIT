// Servicio para gestionar los estados de ciclos y hoja
toggleEstadoCiclo = (ciclo, nuevoEstado, opciones = {}) => {
    ciclo.estado = nuevoEstado;
    if (nuevoEstado === 'En curso') {
        ciclo.horaLlegadaReal = new Date().toISOString();
    }
    if (nuevoEstado === 'Completado') {
        ciclo.horaSalidaReal = new Date().toISOString();
    }
    if (nuevoEstado === 'Cerrado manual') {
        const timestamp = opciones.timestamp || new Date().toISOString();
        ciclo.cierreManual = true;
        ciclo.timestampCierreManual = timestamp;
        ciclo.horaSalidaReal = timestamp;
    }
};

function cerrarHoja(hojaDia) {
    hojaDia.estado = 'Cerrada';
}

module.exports = { toggleEstadoCiclo, cerrarHoja };
