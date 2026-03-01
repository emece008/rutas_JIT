// Sección de inicio


import { PanelOperario } from '../components/PanelOperario.js';
import { cargarPlantillas } from '../services/plantillasService.js';

let _inicioClockInterval = null;

function corporateClockMarkup() {
    return `
        <div class="inicio-corporate-clock" aria-live="polite">
            <div class="inicio-corporate-clock-time" id="inicio-corporate-clock-time">00:00:00</div>
            <div class="inicio-corporate-clock-date" id="inicio-corporate-clock-date"></div>
        </div>
    `;
}

export function initInicioClock() {
    if (_inicioClockInterval) {
        clearInterval(_inicioClockInterval);
        _inicioClockInterval = null;
    }

    function updateClock() {
        const timeEl = document.getElementById('inicio-corporate-clock-time');
        const dateEl = document.getElementById('inicio-corporate-clock-date');
        if (!timeEl || !dateEl) {
            clearInterval(_inicioClockInterval);
            _inicioClockInterval = null;
            return;
        }

        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hh}:${mm}:${ss}`;
        dateEl.textContent = now.toLocaleDateString();
    }

    updateClock();
    _inicioClockInterval = setInterval(updateClock, 1000);
}

export function Inicio() {
    const operario = localStorage.getItem('operario');
    if (operario) {
        // Mostrar resumen de ciclos y rutas seleccionadas si hay hoja de carga
        const hoja = JSON.parse(localStorage.getItem('hoja_carga') || 'null');
        let resumen = '';
        let rutasSel = '';
        if (hoja && hoja.ciclos && hoja.ciclos.length > 0) {
            const total = hoja.ciclos.length;
            const realizados = hoja.ciclos.filter(c => c.estado !== 'Pendiente').length;
            const pendientes = total - realizados;
            resumen = `<div style="margin-top:16px"><b>Resumen de ciclos:</b> Realizados: ${realizados} / Pendientes: ${pendientes} / Total: ${total}</div>`;
            if (hoja.rutas && hoja.rutas.length > 0) {
                rutasSel = `<div style="margin-top:8px"><b>Rutas asignadas:</b> ${hoja.rutas.join(', ')}</div>`;
            }
        }
        return `<div class="section-inicio">
            ${corporateClockMarkup()}
            <h2>Bienvenido al sistema de Rutas JIT</h2>
            <p><b>¡Bienvenido, ${operario}!</b></p>
            ${rutasSel}
            ${resumen}
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
