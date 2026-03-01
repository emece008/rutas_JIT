// Servicio para detectar el siguiente ciclo pendiente global
function detectarSiguienteCiclo(hojaDia) {
    let siguiente = null;
    let minHora = null;
    hojaDia.rutas.forEach(ruta => {
        ruta.ciclos.forEach(ciclo => {
            if (ciclo.estado === 'Pendiente') {
                const hora = ciclo.horaLlegadaPrevista;
                if (!minHora || hora < minHora) {
                    minHora = hora;
                    siguiente = { ruta: ruta.nombre, ciclo };
                }
            }
        });
    });
    return siguiente;
}

module.exports = { detectarSiguienteCiclo };