// Servicio para cargar plantillas de rutas (simulado)
// Plantillas maestras hardcodeadas (simulación de backend)

const PLANTILLAS = [
    {
        nombre: 'L3',
                ciclos: [
                        { numero: 1, horaLlegadaPrevista: '6:15', horaSalidaPrevista: '6:35', duracionVentana: 20, orden: 1,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 2, horaLlegadaPrevista: '7:40', horaSalidaPrevista: '8:00', duracionVentana: 20, orden: 2,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 3, horaLlegadaPrevista: '9:05', horaSalidaPrevista: '9:25', duracionVentana: 20, orden: 3,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 4, horaLlegadaPrevista: '10:30', horaSalidaPrevista: '10:50', duracionVentana: 20, orden: 4,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 5, horaLlegadaPrevista: '11:55', horaSalidaPrevista: '12:15', duracionVentana: 20, orden: 5,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 6, horaLlegadaPrevista: '13:20', horaSalidaPrevista: '13:40', duracionVentana: 20, orden: 6,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 7, horaLlegadaPrevista: '14:45', horaSalidaPrevista: '15:05', duracionVentana: 20, orden: 7,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 8, horaLlegadaPrevista: '16:10', horaSalidaPrevista: '16:30', duracionVentana: 20, orden: 8,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 9, horaLlegadaPrevista: '17:35', horaSalidaPrevista: '17:55', duracionVentana: 20, orden: 9,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 10, horaLlegadaPrevista: '19:00', horaSalidaPrevista: '19:20', duracionVentana: 20, orden: 10,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 11, horaLlegadaPrevista: '20:25', horaSalidaPrevista: '20:45', duracionVentana: 20, orden: 11,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 12, horaLlegadaPrevista: '21:50', horaSalidaPrevista: '22:10', duracionVentana: 20, orden: 12,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 13, horaLlegadaPrevista: '23:15', horaSalidaPrevista: '23:35', duracionVentana: 20, orden: 13,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 14, horaLlegadaPrevista: '0:40', horaSalidaPrevista: '1:00', duracionVentana: 20, orden: 14,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 15, horaLlegadaPrevista: '2:05', horaSalidaPrevista: '2:25', duracionVentana: 20, orden: 15,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 16, horaLlegadaPrevista: '3:30', horaSalidaPrevista: '3:50', duracionVentana: 20, orden: 16,
                            materiales: {
                                'TUBO POSTERIOR L3': 6,
                                'TUBO ANTERIOR L3': 8,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        },
                        { numero: 17, horaLlegadaPrevista: '4:55', horaSalidaPrevista: '5:15', duracionVentana: 20, orden: 17,
                            materiales: {
                                'TUBO POSTERIOR L3': 4,
                                'TUBO ANTERIOR L3': 10,
                                'MAZO PUERTA L3': 4,
                                'CAJA DIRECCION L2': 4,
                                'BASTIDOR L2': 6
                            }
                        }
                ]
    },
    {
        nombre: 'L4',
                ciclos: [
                        { numero: 1, horaLlegadaPrevista: '5:50', horaSalidaPrevista: '6:20', duracionVentana: 30, orden: 1,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 2, horaLlegadaPrevista: '7:15', horaSalidaPrevista: '7:45', duracionVentana: 30, orden: 2,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 3, horaLlegadaPrevista: '8:40', horaSalidaPrevista: '9:10', duracionVentana: 30, orden: 3,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 4, horaLlegadaPrevista: '10:05', horaSalidaPrevista: '10:35', duracionVentana: 30, orden: 4,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 5, horaLlegadaPrevista: '11:30', horaSalidaPrevista: '12:00', duracionVentana: 30, orden: 5,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 6, horaLlegadaPrevista: '12:55', horaSalidaPrevista: '13:25', duracionVentana: 30, orden: 6,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 7, horaLlegadaPrevista: '14:20', horaSalidaPrevista: '14:50', duracionVentana: 30, orden: 7,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 8, horaLlegadaPrevista: '15:45', horaSalidaPrevista: '16:15', duracionVentana: 30, orden: 8,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 9, horaLlegadaPrevista: '17:10', horaSalidaPrevista: '17:40', duracionVentana: 30, orden: 9,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 10, horaLlegadaPrevista: '18:35', horaSalidaPrevista: '19:05', duracionVentana: 30, orden: 10,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 11, horaLlegadaPrevista: '20:00', horaSalidaPrevista: '20:30', duracionVentana: 30, orden: 11,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 12, horaLlegadaPrevista: '21:25', horaSalidaPrevista: '21:55', duracionVentana: 30, orden: 12,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 13, horaLlegadaPrevista: '22:50', horaSalidaPrevista: '23:20', duracionVentana: 30, orden: 13,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 14, horaLlegadaPrevista: '0:15', horaSalidaPrevista: '0:45', duracionVentana: 30, orden: 14,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 15, horaLlegadaPrevista: '1:40', horaSalidaPrevista: '2:10', duracionVentana: 30, orden: 15,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 16, horaLlegadaPrevista: '3:05', horaSalidaPrevista: '3:35', duracionVentana: 30, orden: 16,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        },
                        { numero: 17, horaLlegadaPrevista: '4:30', horaSalidaPrevista: '5:00', duracionVentana: 30, orden: 17,
                            materiales: {
                                'PANELES L2': 10,
                                'CAJAS DIRECCIÓN L2': 0,
                                'CESTONES LONAS': 0,
                                'BACAS': 0,
                                'AIRBAGS': 0
                            }
                        }
                ]
    }
];

export async function cargarPlantillas() {
    // En producción, esto sería una llamada fetch a backend
    return PLANTILLAS;
}