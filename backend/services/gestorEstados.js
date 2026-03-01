// Servicio para gestionar los estados de ciclos y hoja
toggleEstadoCiclo = (ciclo, nuevoEstado) => {
    ciclo.estado = nuevoEstado;
    if (nuevoEstado === 'En curso') {
        ciclo.horaLlegadaReal = new Date().toISOString();
    }
    if (nuevoEstado === 'Completado') {
        ciclo.horaSalidaReal = new Date().toISOString();
    }
};

function cerrarHoja(hojaDia) {
    hojaDia.estado = 'Cerrada';
}

module.exports = { toggleEstadoCiclo, cerrarHoja };