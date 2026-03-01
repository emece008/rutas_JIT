// Definición del modelo de Ruta
class Ruta {
    constructor(nombre, ciclos) {
        this.nombre = nombre; // L3, L4, etc.
        this.ciclos = ciclos; // Array de Ciclo
    }
}

// Definición del modelo de Ciclo
class Ciclo {
    constructor(numero, horaLlegadaPrevista, horaSalidaPrevista, duracionVentana, orden) {
        this.numero = numero;
        this.horaLlegadaPrevista = horaLlegadaPrevista;
        this.horaSalidaPrevista = horaSalidaPrevista;
        this.duracionVentana = duracionVentana;
        this.orden = orden;
        // Campos editables en hoja del día
        this.horaLlegadaReal = null;
        this.horaSalidaReal = null;
        this.estado = 'Pendiente'; // Pendiente, En curso, Completado, Cerrado manual, Perdido
    }
}

// Definición del modelo de Hoja del Día
class HojaDia {
    constructor(fecha, operario, rutas) {
        this.fecha = fecha;
        this.operario = operario;
        this.rutas = rutas; // Array de Ruta
        this.estado = 'Abierta'; // Abierta, Cerrada
    }
}

module.exports = { Ruta, Ciclo, HojaDia };