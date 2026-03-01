// Sección Hoja de Carga: muestra las rutas seleccionadas y sus ciclos
import { RutasBar } from '../components/RutasBar.js';
import { dividirRutasPorEstado } from '../services/rutasEstadoService.js';

let relojIntervalId = null;

export function HojaCarga() {
    setTimeout(renderHojaCarga, 0);
    return `<div class="section-hoja-carga">
        <h2>Hoja de Carga - Rutas Asignadas</h2>
        <div class="hoja-carga-clock" id="hoja-carga-clock"></div>
        <div id="rutas-bar"></div>
        <div id="hoja-carga-content"></div>
    </div>`;
}

async function renderHojaCarga() {
    const content = document.getElementById('hoja-carga-content');
    const rutasBarDiv = document.getElementById('rutas-bar');
    if (rutasBarDiv) rutasBarDiv.innerHTML = await RutasBar({});
    const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');

    iniciarRelojHoja();

    if (!hoja || !hoja.ciclos || hoja.ciclos.length === 0) {
        content.innerHTML = '<p>No hay hoja de carga generada. Vuelva a Inicio y seleccione rutas.</p>';
        return;
    }

    const { principal, pendientes, cerradas } = dividirRutasPorEstado(hoja, new Date());

    content.innerHTML = `
        ${renderSeccionPrincipal(principal)}
        ${renderSeccionLista('Rutas pendientes', pendientes, false)}
        ${renderSeccionLista('Rutas cerradas', cerradas, true)}
    `;
}

function iniciarRelojHoja() {
    if (relojIntervalId) clearInterval(relojIntervalId);
    const clock = document.getElementById('hoja-carga-clock');
    if (!clock) return;

    const tick = () => {
        clock.textContent = `Hora del sistema: ${new Date().toLocaleTimeString('es-ES', { hour12: false })}`;
    };

    tick();
    relojIntervalId = setInterval(tick, 1000);
}

function renderSeccionPrincipal(rutaPrincipal) {
    if (!rutaPrincipal) {
        return `<section class="ruta-seccion ruta-principal"><h3>Ruta actual / siguiente</h3><p>No hay rutas activas pendientes.</p></section>`;
    }

    const activa = rutaPrincipal.ciclos.some(c => c.estado === 'Pendiente' || c.estado === 'En curso');
    const botonManual = activa
        ? `<button class="btn-cerrar-manual" data-ruta="${rutaPrincipal.nombre}">Cerrar manualmente</button>`
        : '';

    return `
        <section class="ruta-seccion ruta-principal">
            <div class="ruta-principal-header">
                <h3>Ruta actual / siguiente: ${rutaPrincipal.nombre}</h3>
                ${botonManual}
            </div>
            ${plantillaEditableHtml(rutaPrincipal.nombre, rutaPrincipal.ciclos)}
        </section>
    `;
}

function renderSeccionLista(titulo, rutas, cerrada) {
    if (!rutas.length) {
        return `<section class="ruta-seccion"><h3>${titulo}</h3><p>Sin rutas en esta sección.</p></section>`;
    }

    return `
        <section class="ruta-seccion ${cerrada ? 'rutas-cerradas' : 'rutas-pendientes'}">
            <h3>${titulo}</h3>
            ${rutas.map(({ nombre, ciclos }) => `
                <div class="plantilla">
                    <div class="ruta-secundaria-header">
                        <h4>Ruta ${nombre}</h4>
                        ${!cerrada ? `<button class="btn-cerrar-manual" data-ruta="${nombre}">Cerrar manualmente</button>` : ''}
                    </div>
                    ${plantillaEditableHtml(nombre, ciclos)}
                </div>
            `).join('<hr style="margin:20px 0;">')}
        </section>
    `;
}

function plantillaEditableHtml(nombre, ciclos) {
    const allMats = Array.from(new Set(ciclos.flatMap(c => Object.keys(c.materiales || {}))));
    return `
    <div class="tabla-centro" data-ruta="${nombre}">
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
                ${ciclos.map((ciclo) => `
                    <tr>
                        <td>${ciclo.numero}</td>
                        <td>${ciclo.horaLlegadaPrevista}</td>
                        <td>${ciclo.horaSalidaPrevista}</td>
                        <td><input type="time" class="input-hora-llegada" data-numero="${ciclo.numero}" value="${ciclo.horaLlegadaReal || ''}"></td>
                        <td><input type="time" class="input-hora-salida" data-numero="${ciclo.numero}" value="${ciclo.horaSalidaReal || ''}"></td>
                        ${allMats.map(mat => `
                            <td>${ciclo.materiales?.[mat] ?? ''}</td>
                            <td><input type="number" min="0" class="input-cant-real" data-numero="${ciclo.numero}" data-mat="${mat}" value="${ciclo.cantidadesReales?.[mat] ?? ''}"></td>
                        `).join('')}
                        <td>${ciclo.estado}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}


function deduplicarHoja(hoja) {
    const vistos = new Set();
    hoja.ciclos = (hoja.ciclos || []).filter((ciclo) => {
        const clave = `${ciclo.ruta || ''}-${ciclo.numero || ''}-${ciclo.horaLlegadaPrevista || ''}`;
        if (vistos.has(clave)) return false;
        vistos.add(clave);
        return true;
    });
    return hoja;
}

function cerrarRutaManual(hoja, nombreRuta) {
    const timestamp = new Date().toISOString();
    hoja.ciclos.forEach((ciclo) => {
        if (ciclo.ruta !== nombreRuta) return;
        if (ciclo.estado === 'Pendiente' || ciclo.estado === 'En curso') {
            ciclo.estado = 'Cerrado manual';
            ciclo.cierreManual = true;
            ciclo.timestampCierreManual = timestamp;
            if (!ciclo.horaSalidaReal) {
                ciclo.horaSalidaReal = timestamp.slice(11, 16);
            }
        }
    });
}

// Guardar cambios al pulsar el botón
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('btn-guardar-hoja')) {
        const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');
        if (!hoja) return;

        const tablasPorRuta = document.querySelectorAll('.tabla-centro[data-ruta]');
        tablasPorRuta.forEach((contenedorRuta) => {
            const nombreRuta = contenedorRuta.dataset.ruta;
            const ciclosRuta = hoja.ciclos.filter(c => c.ruta === nombreRuta);
            const filas = contenedorRuta.querySelectorAll('tbody tr');
            filas.forEach((fila, idx) => {
                const cicloActual = ciclosRuta[idx];
                if (!cicloActual) return;
                const inputLlegada = fila.querySelector('.input-hora-llegada');
                const inputSalida = fila.querySelector('.input-hora-salida');
                if (inputLlegada) cicloActual.horaLlegadaReal = inputLlegada.value;
                if (inputSalida) cicloActual.horaSalidaReal = inputSalida.value;
                const inputsCant = fila.querySelectorAll('.input-cant-real');
                cicloActual.cantidadesReales = cicloActual.cantidadesReales || {};
                inputsCant.forEach(input => {
                    cicloActual.cantidadesReales[input.dataset.mat] = input.value;
                });
            });
        });

        localStorage.setItem('hoja_carga', JSON.stringify(deduplicarHoja(hoja)));
        alert('Cambios guardados');
        renderHojaCarga();
    }

    if (e.target && e.target.classList.contains('btn-cerrar-manual')) {
        const nombreRuta = e.target.dataset.ruta;
        const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');
        if (!hoja || !nombreRuta) return;
        cerrarRutaManual(hoja, nombreRuta);
        localStorage.setItem('hoja_carga', JSON.stringify(deduplicarHoja(hoja)));
        renderHojaCarga();
    }
});
