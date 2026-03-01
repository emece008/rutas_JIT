// Sección de inicio


import { PanelOperario } from '../components/PanelOperario.js';
import { cargarPlantillas } from '../services/plantillasService.js';
import { calcularResumenOperativo, getHojaStorageSafe } from '../services/estadoOperativoService.js';

let _inicioClockInterval = null;

function corporateClockMarkup() {
    return `
        <div class="inicio-corporate-clock" aria-live="polite">
            <div class="inicio-corporate-clock-time" id="inicio-corporate-clock-time">00:00:00</div>
            <div class="inicio-corporate-clock-date" id="inicio-corporate-clock-date"></div>
            <div class="inicio-executive-divider"></div>
            <div class="inicio-executive-status">
                <div class="inicio-executive-item inicio-executive-danger">🔴 Retrasadas: <span id="inicio-retrasadas">0</span></div>
                <div class="inicio-executive-item inicio-executive-success">🟢 Actual: <span id="inicio-actual">-</span></div>
                <div class="inicio-executive-item inicio-executive-info">🔵 Próxima: <span id="inicio-proxima">-</span></div>
            </div>
        </div>
    `;
}

function formatExecutiveDate(now) {
    const raw = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).replace(',', '');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function initInicioClock() {
    if (_inicioClockInterval) {
        clearInterval(_inicioClockInterval);
        _inicioClockInterval = null;
    }

    function updateClock() {
        const timeEl = document.getElementById('inicio-corporate-clock-time');
        const dateEl = document.getElementById('inicio-corporate-clock-date');
        const retrasadasEl = document.getElementById('inicio-retrasadas');
        const actualEl = document.getElementById('inicio-actual');
        const proximaEl = document.getElementById('inicio-proxima');
        if (!timeEl || !dateEl || !retrasadasEl || !actualEl || !proximaEl) {
            clearInterval(_inicioClockInterval);
            _inicioClockInterval = null;
            return;
        }

        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hh}:${mm}:${ss}`;
        dateEl.textContent = formatExecutiveDate(now);

        const hoja = getHojaStorageSafe();
        const resumen = calcularResumenOperativo(hoja, now);
        retrasadasEl.textContent = String(resumen.retrasadas.length);
        actualEl.textContent = resumen.actual;
        proximaEl.textContent = resumen.proxima;
    }

    updateClock();
    _inicioClockInterval = setInterval(updateClock, 1000);
}

export function Inicio() {
    const operario = localStorage.getItem('operario');
    if (operario) {
        return `<div class="section-inicio">
            ${corporateClockMarkup()}
            <h2>Bienvenido al sistema de Rutas JIT</h2>
            <p><b>¡Bienvenido, ${operario}!</b></p>
        </div>`;
    }
    setTimeout(async () => {
        const btn = document.getElementById('btn-identificar');
        if (btn) {
            btn.onclick = async () => {
                const nombre = document.getElementById('input-operario').value.trim();
                if (nombre) {
                    localStorage.setItem('operario', nombre);
                    // Mostrar selección de rutas
                    const plantillas = await cargarPlantillas();
                    const rutasDiv = document.getElementById('rutas-asignadas-select');
                    rutasDiv.innerHTML = `
                        <h3>Selecciona tus rutas asignadas:</h3>
                        <form id="form-rutas-asignadas">
                            ${plantillas.map(p => `<label><input type="checkbox" name="rutas" value="${p.nombre}"> ${p.nombre}</label><br>`).join('')}
                            <button type="submit">Confirmar rutas</button>
                        </form>
                    `;
                    document.getElementById('form-rutas-asignadas').onsubmit = (e) => {
                        e.preventDefault();
                        const seleccionadas = Array.from(document.querySelectorAll('input[name="rutas"]:checked')).map(el => el.value);
                        localStorage.setItem('rutas_seleccionadas', JSON.stringify(seleccionadas));
                        // Crear hoja de carga editable
                        const hoja = {
                            fecha: new Date().toISOString().slice(0,10),
                            operario: nombre,
                            rutas: seleccionadas,
                            ciclos: plantillas.filter(p => seleccionadas.includes(p.nombre)).flatMap(ruta =>
                                ruta.ciclos.map(ciclo => ({
                                    ...ciclo,
                                    ruta: ruta.nombre,
                                    estado: 'Pendiente',
                                    horaLlegadaReal: '',
                                    horaSalidaReal: '',
                                    cantidadesReales: {}
                                }))
                            )
                        };
                        localStorage.setItem('hoja_carga', JSON.stringify(hoja));
                        rutasDiv.innerHTML = `<b>Rutas asignadas guardadas.</b> <a href=\"#\" id=\"go-hoja-carga\">Ir a Hoja de Carga</a>`;
                        setTimeout(() => {
                            const go = document.getElementById('go-hoja-carga');
                            if (go) go.onclick = () => {
                                document.querySelector('.menu-btn[data-section=\"hoja-carga\"]').click();
                            };
                        }, 0);
                    };
                }
            };
        }
    }, 0);
    return `<div class="section-inicio">
        ${corporateClockMarkup()}
        <h2>Bienvenido al sistema de Rutas JIT</h2>
        <p>Identifíquese para comenzar:</p>
        ${PanelOperario({})}
        <div id="rutas-asignadas-select"></div>
    </div>`;
}
