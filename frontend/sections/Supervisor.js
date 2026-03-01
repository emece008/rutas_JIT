// Sección Supervisor: seguimiento de rutas asignadas a operarios
import { cargarPlantillas } from '../services/plantillasService.js';

export function Supervisor() {
    setTimeout(renderSupervisor, 0);
    return `<div class="section-supervisor">
        <h2>Panel Supervisor</h2>
        <div id="supervisor-rutas-bar"></div>
        <div id="supervisor-ruta-detalle"></div>
    </div>`;
}

async function renderSupervisor() {
    const rutasBar = document.getElementById('supervisor-rutas-bar');
    const detalle = document.getElementById('supervisor-ruta-detalle');
    const plantillas = await cargarPlantillas();
    rutasBar.innerHTML = plantillas.map(p => `<button class="supervisor-ruta-btn" data-ruta="${p.nombre}">${p.nombre}</button>`).join(' ');
    // Mostrar la primera por defecto
    if (plantillas.length > 0) mostrarDetalleRuta(plantillas[0].nombre, plantillas);
    rutasBar.onclick = e => {
        if (e.target.classList.contains('supervisor-ruta-btn')) {
            mostrarDetalleRuta(e.target.dataset.ruta, plantillas);
        }
    };
}

function mostrarDetalleRuta(nombreRuta, plantillas) {
    const plantilla = plantillas.find(p => p.nombre === nombreRuta);
    const detalle = document.getElementById('supervisor-ruta-detalle');
    if (!plantilla) return;
    detalle.innerHTML = `
        <h3>Ruta ${plantilla.nombre}</h3>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Hora Llegada Prevista</th>
                    <th>Hora Salida Prevista</th>
                    <th>Duración Ventana</th>
                    <th>Materiales previstos</th>
                </tr>
            </thead>
            <tbody>
                ${plantilla.ciclos.map(ciclo => `
                    <tr>
                        <td>${ciclo.numero}</td>
                        <td>${ciclo.horaLlegadaPrevista}</td>
                        <td>${ciclo.horaSalidaPrevista}</td>
                        <td>${ciclo.duracionVentana}</td>
                        <td style="padding:0;">
                            <table style="width:100%;border:none;background:none;">
                                <tbody>
                                    ${Object.entries(ciclo.materiales || {}).map(([mat, val]) => `
                                        <tr style="border:none;background:none;">
                                            <td style="border:none;padding:0 4px 0 0;text-align:left;">${mat}</td>
                                            <td style="border:none;padding:0;text-align:right;"><b>${val}</b></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
