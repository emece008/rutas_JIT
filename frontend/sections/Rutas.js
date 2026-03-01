// Sección de rutas (lógica se añadirá después)

import { cargarPlantillas } from '../services/plantillasService.js';
import { RutasBar } from '../components/RutasBar.js';



export function Rutas() {
    setTimeout(renderRutasSection, 0);
    return `<div class="section-rutas"><h2>Plantillas de Rutas JIT</h2><div id="rutas-bar"></div><div id="rutas-content"></div></div>`;
}

async function renderRutasSection() {
    const rutasBarDiv = document.getElementById('rutas-bar');
    rutasBarDiv.innerHTML = await RutasBar({});
    renderPlantillas();
}


async function renderPlantillas() {
    const rutasContent = document.getElementById('rutas-content');
    const plantillas = await cargarPlantillas();
    rutasContent.innerHTML = plantillas.map(p => plantillaHtml(p)).join('<hr style="margin:32px 0;">');
}



function plantillaHtml(plantilla) {
    return `
    <div class="plantilla">
        <h3>Ruta ${plantilla.nombre}</h3>
        <table class="tabla-ancha">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Hora Llegada Prevista</th>
                    <th>Hora Salida Prevista</th>
                    <th>Materiales previstos</th>
                </tr>
            </thead>
            <tbody>
                ${plantilla.ciclos.map(ciclo => `
                    <tr>
                        <td>${ciclo.numero}</td>
                        <td>${ciclo.horaLlegadaPrevista}</td>
                        <td>${ciclo.horaSalidaPrevista}</td>
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
    </div>
    `;
}