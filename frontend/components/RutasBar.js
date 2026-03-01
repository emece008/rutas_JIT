// Barra horizontal de rutas existentes
import { cargarPlantillas } from '../services/plantillasService.js';

export async function RutasBar({ onSelect, selected }) {
    const plantillas = await cargarPlantillas();
    return `
        <div class="rutas-bar">
            ${plantillas.map(p => `
                <button class="rutas-bar-btn${selected === p.nombre ? ' active' : ''}" data-ruta="${p.nombre}">${p.nombre}</button>
            `).join('')}
        </div>
    `;
}
//futura funcion de reloj y tiempos.