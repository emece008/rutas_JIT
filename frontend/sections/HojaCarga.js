// Sección Hoja de Carga: muestra las rutas seleccionadas y sus ciclos
import { cargarPlantillas } from '../services/plantillasService.js';
import { RutasBar } from '../components/RutasBar.js';

export function HojaCarga() {
    setTimeout(renderHojaCarga, 0);
    return `<div class="section-hoja-carga">
        <h2>Hoja de Carga - Rutas Asignadas</h2>
        <div id="rutas-bar"></div>
        <div id="hoja-carga-content"></div>
    </div>`;
}

async function renderHojaCarga() {
    const content = document.getElementById('hoja-carga-content');
    const rutasBarDiv = document.getElementById('rutas-bar');
    if (rutasBarDiv) rutasBarDiv.innerHTML = await RutasBar({});
    const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');
    if (!hoja || !hoja.ciclos || hoja.ciclos.length === 0) {
        content.innerHTML = '<p>No hay hoja de carga generada. Vuelva a Inicio y seleccione rutas.</p>';
        return;
    }
    // Agrupar ciclos por ruta
    const rutas = {};
    hoja.ciclos.forEach(c => {
        if (!rutas[c.ruta]) rutas[c.ruta] = [];
        rutas[c.ruta].push(c);
    });
    content.innerHTML = Object.entries(rutas).map(([nombre, ciclos]) => plantillaEditableHtml(nombre, ciclos)).join('<hr style="margin:32px 0;">');
}





function plantillaEditableHtml(nombre, ciclos) {
    // Obtener todos los tipos de material de todos los ciclos
    const allMats = Array.from(new Set(ciclos.flatMap(c => Object.keys(c.materiales || {}))));
    return `
    <div class="plantilla">
        <h3>Ruta ${nombre}</h3>
        <div class="tabla-centro">
        <table class="tabla-hoja-carga">
            <thead>
                <tr>
                    <th rowspan="2">#</th>
                    <th rowspan="2">Hora Llegada Prevista</th>
                    <th rowspan="2">Hora Salida Prevista</th>
                    <th rowspan="2">Hora Llegada Real</th>
                    <th rowspan="2">Hora Salida Real</th>
                    ${allMats.map(mat => `<th colspan="2">${mat}</th>`).join('')}
                    <th rowspan="2">Estado</th>
                </tr>
                <tr>
                    ${allMats.map(() => '<th>Previsto</th><th>Real</th>').join('')}
                </tr>
            </thead>
            <tbody>
                ${ciclos.map((ciclo, idx) => `
                    <tr>
                        <td>${ciclo.numero}</td>
                        <td>${ciclo.horaLlegadaPrevista}</td>
                        <td>${ciclo.horaSalidaPrevista}</td>
                        <td><input type="time" class="input-hora-llegada" data-idx="${idx}" value="${ciclo.horaLlegadaReal || ''}"></td>
                        <td><input type="time" class="input-hora-salida" data-idx="${idx}" value="${ciclo.horaSalidaReal || ''}"></td>
                        ${allMats.map(mat => `
                            <td>${ciclo.materiales?.[mat] ?? ''}</td>
                            <td><input type="number" min="0" class="input-cant-real" data-idx="${idx}" data-mat="${mat}" value="${ciclo.cantidadesReales?.[mat] ?? ''}"></td>
                        `).join('')}
                        <td>${ciclo.estado}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
        <button class="btn-guardar-hoja">Guardar cambios</button>
    </div>
    `;
}

// Guardar cambios al pulsar el botón
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('btn-guardar-hoja')) {
        const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');
        if (!hoja) return;
        // Actualizar datos reales de cada ciclo
        const tablas = document.querySelectorAll('.plantilla table');
        let cicloIdx = 0;
        tablas.forEach(tabla => {
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach(fila => {
                const inputLlegada = fila.querySelector('.input-hora-llegada');
                const inputSalida = fila.querySelector('.input-hora-salida');
                if (inputLlegada) hoja.ciclos[cicloIdx].horaLlegadaReal = inputLlegada.value;
                if (inputSalida) hoja.ciclos[cicloIdx].horaSalidaReal = inputSalida.value;
                const inputsCant = fila.querySelectorAll('.input-cant-real');
                hoja.ciclos[cicloIdx].cantidadesReales = hoja.ciclos[cicloIdx].cantidadesReales || {};
                inputsCant.forEach(input => {
                    hoja.ciclos[cicloIdx].cantidadesReales[input.dataset.mat] = input.value;
                });
                cicloIdx++;
            });
        });
        localStorage.setItem('hoja_carga', JSON.stringify(hoja));
        alert('Cambios guardados');
    }
});
