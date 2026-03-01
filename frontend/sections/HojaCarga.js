// Sección Hoja de Carga: muestra las rutas seleccionadas y sus ciclos
import { cargarPlantillas } from '../services/plantillasService.js';
import { RutasBar } from '../components/RutasBar.js';

let _panelOperativoInterval = null;

export function HojaCarga() {
    setTimeout(renderHojaCarga, 0);
    return `<div class="section-hoja-carga">
        <h2>Hoja de Carga - Rutas Asignadas</h2>
        <div class="panel-operativo-industrial">
            <div class="panel-operativo-header">Panel Operativo</div>
            <div class="panel-operativo-reloj" id="panel-operativo-reloj">00:00:00</div>
            <div class="panel-operativo-fecha" id="panel-operativo-fecha"></div>
            <div class="panel-operativo-estado">
                <div class="estado-item estado-retrasadas">
                    <span class="estado-label">Rutas RETRASADAS</span>
                    <div class="estado-valor" id="panel-rutas-retrasadas">Sin retrasos</div>
                </div>
                <div class="estado-item estado-actual">
                    <span class="estado-label">Ruta ACTUAL</span>
                    <div class="estado-valor" id="panel-ruta-actual">-</div>
                </div>
                <div class="estado-item estado-proxima">
                    <span class="estado-label">Ruta PRÓXIMA</span>
                    <div class="estado-valor" id="panel-ruta-proxima">-</div>
                </div>
                <div class="estado-item estado-siguiente">
                    <span class="estado-label">Ruta SIGUIENTE</span>
                    <div class="estado-valor" id="panel-ruta-siguiente">-</div>
                </div>
            </div>
        </div>
        <div id="rutas-bar"></div>
        <div id="hoja-carga-content"></div>
    </div>`;
}

async function renderHojaCarga() {
    if (_panelOperativoInterval) {
        clearInterval(_panelOperativoInterval);
        _panelOperativoInterval = null;
    }

    const content = document.getElementById('hoja-carga-content');
    const rutasBarDiv = document.getElementById('rutas-bar');
    if (rutasBarDiv) rutasBarDiv.innerHTML = await RutasBar({});
    const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');

    updatePanelOperativo(hoja);
    _panelOperativoInterval = setInterval(() => updatePanelOperativo(hoja), 1000);

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

function updatePanelOperativo(hoja) {
    const relojEl = document.getElementById('panel-operativo-reloj');
    const fechaEl = document.getElementById('panel-operativo-fecha');
    if (!relojEl || !fechaEl) {
        if (_panelOperativoInterval) {
            clearInterval(_panelOperativoInterval);
            _panelOperativoInterval = null;
        }
        return;
    }

    const now = new Date();
    relojEl.textContent = now.toLocaleTimeString('es-ES', { hour12: false });
    fechaEl.textContent = now.toLocaleDateString(undefined, { dateStyle: 'full' });

    const retrasadasEl = document.getElementById('panel-rutas-retrasadas');
    const actualEl = document.getElementById('panel-ruta-actual');
    const proximaEl = document.getElementById('panel-ruta-proxima');
    const siguienteEl = document.getElementById('panel-ruta-siguiente');
    if (!retrasadasEl || !actualEl || !proximaEl || !siguienteEl) return;

    if (!hoja || !hoja.ciclos || hoja.ciclos.length === 0) {
        retrasadasEl.textContent = 'Sin datos';
        actualEl.textContent = '-';
        proximaEl.textContent = '-';
        siguienteEl.textContent = '-';
        return;
    }

    const rutasMap = new Map();
    hoja.ciclos.forEach(ciclo => {
        const nombre = ciclo.ruta || 'Sin ruta';
        if (!rutasMap.has(nombre)) rutasMap.set(nombre, []);
        rutasMap.get(nombre).push(ciclo);
    });

    const minutosAhora = now.getHours() * 60 + now.getMinutes();
    const resumenRutas = Array.from(rutasMap.entries()).map(([ruta, ciclos]) => {
        const pendiente = ciclos.find(c => !c.horaSalidaReal) || ciclos[ciclos.length - 1];
        const horaRef = pendiente?.horaSalidaPrevista || pendiente?.horaLlegadaPrevista;
        const minutosPlan = horaToMinutes(horaRef);
        const minutosRetraso = minutosPlan === null ? 0 : Math.max(0, minutosAhora - minutosPlan);
        return { ruta, minutosPlan, minutosRetraso };
    }).sort((a, b) => {
        if (a.minutosPlan === null && b.minutosPlan === null) return a.ruta.localeCompare(b.ruta);
        if (a.minutosPlan === null) return 1;
        if (b.minutosPlan === null) return -1;
        return a.minutosPlan - b.minutosPlan;
    });

    const retrasadas = resumenRutas.filter(r => r.minutosRetraso > 0);
    const enHorario = resumenRutas.filter(r => r.minutosRetraso === 0);

    retrasadasEl.innerHTML = retrasadas.length
        ? retrasadas.map(r => `${r.ruta} (+${r.minutosRetraso} min)`).join('<br>')
        : 'Sin retrasos';

    actualEl.textContent = enHorario[0]?.ruta || '-';
    proximaEl.textContent = enHorario[1]?.ruta || '-';
    siguienteEl.textContent = enHorario[2]?.ruta || '-';
}

function horaToMinutes(hora) {
    if (!hora || typeof hora !== 'string' || !hora.includes(':')) return null;
    const [hh, mm] = hora.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
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
