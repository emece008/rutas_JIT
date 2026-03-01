// Sección Hoja de Carga: muestra las rutas seleccionadas y sus ciclos
import { RutasBar } from '../components/RutasBar.js';
import { getHojaStorageSafe } from '../services/estadoOperativoService.js';
import { getPanelOperativoState } from '../services/panelOperativoService.js';

let _panelOperativoInterval = null;
let _rutaSeleccionada = null;
let _viajeSeleccionado = null;
const _viajesCerrados = new Set();

function normalizarViaje(viaje) {
    if (viaje === null || viaje === undefined || viaje === '') return null;
    return String(viaje);
}

function viajeKey(ruta, viaje) {
    return `${ruta}::${normalizarViaje(viaje)}`;
}

function isViajeCerrado(ruta, viaje) {
    const viajeNorm = normalizarViaje(viaje);
    if (!ruta || viajeNorm === null) return false;
    return _viajesCerrados.has(viajeKey(ruta, viaje));
}

function estadoVisible(ciclo, ruta, viaje) {
    if (isViajeCerrado(ruta, viaje)) return 'Cerrado';
    return ciclo?.estado || '-';
}

function horaActualHHMM() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

function construirHojaOperativa(hoja) {
    if (!hoja || !Array.isArray(hoja.ciclos)) return null;
    return {
        ...hoja,
        ciclos: hoja.ciclos.filter(c => !isViajeCerrado(c.ruta, c.numero))
    };
}

function getCicloSeleccionado(hoja) {
    if (!hoja || !Array.isArray(hoja.ciclos)) return null;
    const viajeSelNorm = normalizarViaje(_viajeSeleccionado);
    const idx = hoja.ciclos.findIndex(c => c.ruta === _rutaSeleccionada && normalizarViaje(c.numero) === viajeSelNorm);
    if (idx < 0) return null;
    return { ...hoja.ciclos[idx], __idxGlobal: idx };
}

function getRutaViajeActual(hoja) {
    const ciclos = hoja?.ciclos || [];
    if (!ciclos.length) return null;

    const enCurso = ciclos
        .filter(c => !c.horaSalidaReal && c.horaLlegadaReal)
        .map(c => ({
            ruta: c.ruta,
            viaje: normalizarViaje(c.numero),
            horaRef: c.horaLlegadaReal
        }))
        .sort((a, b) => {
            const [ah, am] = String(a.horaRef || '00:00').split(':').map(Number);
            const [bh, bm] = String(b.horaRef || '00:00').split(':').map(Number);
            return (bh * 60 + bm) - (ah * 60 + am);
        });

    return enCurso[0] || null;
}

function rutaActualPanelHtml(rutasDisponibles, rutaSeleccionada, viajeSeleccionado, actualEnCurso, cicloSeleccionado, abiertaActual) {
    const rutaOptions = rutasDisponibles.map(r => `<option value="${r}" ${r === rutaSeleccionada ? 'selected' : ''}>${r}</option>`).join('');
    const labelActual = actualEnCurso
        ? `${actualEnCurso.ruta} · Viaje ${actualEnCurso.viaje}`
        : 'Sin ruta en curso';
    const idxGlobal = cicloSeleccionado?.__idxGlobal ?? cicloSeleccionado?.idxGlobal ?? '';
    const materiales = Object.keys(cicloSeleccionado?.materiales || {});
    const editorHtml = cicloSeleccionado ? `
        <div class="ruta-actual-editor">
            <div class="tabla-centro ruta-actual-copia">
                <table class="tabla-hoja-carga">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">Hora Llegada Prevista</th>
                            <th rowspan="2">Hora Salida Prevista</th>
                            <th rowspan="2">Hora Llegada Real</th>
                            <th rowspan="2">Hora Inicio Real</th>
                            <th rowspan="2">Hora Fin Real</th>
                            ${materiales.map(mat => `<th colspan="2">${mat}</th>`).join('')}
                            <th rowspan="2">Estado</th>
                        </tr>
                        <tr>
                            ${materiales.map(() => '<th>Previsto</th><th>Real</th>').join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="fila-viaje-seleccionada">
                            <td>${cicloSeleccionado.numero}</td>
                            <td>${cicloSeleccionado.horaLlegadaPrevista || ''}</td>
                            <td>${cicloSeleccionado.horaSalidaPrevista || ''}</td>
                            <td><input type="time" id="hora-llegada-actual-input" class="js-actual-hora-llegada-real" value="${cicloSeleccionado.horaLlegadaReal || ''}" readonly ${abiertaActual ? '' : 'disabled'}></td>
                            <td><input type="time" id="hora-inicio-actual-input" class="js-actual-hora-inicio-real" value="${cicloSeleccionado.horaInicioReal || ''}" readonly ${abiertaActual ? '' : 'disabled'}></td>
                            <td><input type="time" id="hora-fin-actual-input" class="js-actual-hora-salida-real" value="${cicloSeleccionado.horaSalidaReal || ''}" readonly ${abiertaActual ? '' : 'disabled'}></td>
                            ${materiales.map(mat => `
                                <td>${cicloSeleccionado.materiales?.[mat] ?? ''}</td>
                                <td><input type="number" min="0" class="js-actual-material-real" data-mat="${mat}" data-prev="${cicloSeleccionado.materiales?.[mat] ?? ''}" value="${cicloSeleccionado.cantidadesReales?.[mat] ?? ''}" readonly inputmode="numeric" ${abiertaActual ? '' : 'disabled'}></td>
                            `).join('')}
                            <td>${estadoVisible(cicloSeleccionado, rutaSeleccionada, viajeSeleccionado)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    ` : '<p class="ruta-seleccion-vacio">Seleccione un viaje para ver y editar sus campos.</p>';

    return `
        <div class="ruta-actual-control" data-idx="${idxGlobal}">
            <div class="ruta-actual-header">Ruta y Viaje ACTUAL (En curso)</div>
            <div class="ruta-actual-grid">
                <label>Ruta
                    <select id="ruta-actual-select">${rutaOptions}</select>
                </label>
                <label>Viaje
                    <input type="number" min="1" id="viaje-actual-input" value="${viajeSeleccionado || ''}">
                </label>
                <button type="button" class="btn-ruta-control" data-action="cerrar-actual" ${abiertaActual ? '' : 'disabled'}>Cerrar</button>
                <button type="button" class="btn-ruta-control" data-action="abrir-actual" ${abiertaActual ? 'disabled' : ''}>Abrir viaje</button>
                <button type="button" class="btn-ruta-control" data-action="guardar-actual" ${!cicloSeleccionado || !abiertaActual ? 'disabled' : ''}>Guardar actual</button>
            </div>
            ${editorHtml}
            <div class="ruta-actual-estado">Actual detectada: <strong>${labelActual}</strong></div>
        </div>
    `;
}

function seleccionarSiguienteSegunHora(hoja) {
    const hojaOperativa = construirHojaOperativa(hoja);
    const ciclos = hojaOperativa?.ciclos || [];
    if (!ciclos.length) return;

    const now = new Date();
    const minutosAhora = now.getHours() * 60 + now.getMinutes();
    const pendientes = ciclos.filter(c => !c?.horaSalidaReal);
    const universo = pendientes.length ? pendientes : ciclos;

    const candidatos = universo.map((ciclo) => {
        const ruta = ciclo?.ruta || 'Sin ruta';
        const horaRef = ciclo?.horaSalidaPrevista || ciclo?.horaLlegadaPrevista;
        if (!horaRef || typeof horaRef !== 'string' || !horaRef.includes(':')) return null;
        const [hh, mm] = horaRef.split(':').map(Number);
        if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
        const minutosPlan = hh * 60 + mm;
        const diff = minutosPlan - minutosAhora;
        return {
            ruta,
            viaje: normalizarViaje(ciclo?.numero),
            diff,
            absDiff: Math.abs(diff)
        };
    }).filter(Boolean);

    if (!candidatos.length) return;

    const futuros = candidatos
        .filter(c => c.diff >= 0)
        .sort((a, b) => a.diff - b.diff);

    const vencidos = candidatos
        .filter(c => c.diff < 0)
        .sort((a, b) => b.diff - a.diff);

    const candidato = futuros[0] || vencidos[0] || candidatos.sort((a, b) => a.absDiff - b.absDiff)[0];
    if (!candidato) return;

    _rutaSeleccionada = candidato.ruta;
    _viajeSeleccionado = candidato.viaje;
}

export function HojaCarga() {
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
                <div class="estado-item estado-seleccionada">
                    <span class="estado-label">Ruta SELECCIONADA</span>
                    <div class="estado-valor" id="panel-ruta-seleccionada">-</div>
                </div>
            </div>
        </div>
        <div id="rutas-bar"></div>
        <div id="ruta-actual-panel"></div>
        <div id="ruta-seleccion-panel"></div>
        <div id="hoja-carga-content"></div>
    </div>`;
}

export function initHojaCarga() {
    setTimeout(renderHojaCarga, 0);
}

async function renderHojaCarga() {
    if (_panelOperativoInterval) {
        clearInterval(_panelOperativoInterval);
        _panelOperativoInterval = null;
    }

    const content = document.getElementById('hoja-carga-content');
    const rutaActualPanel = document.getElementById('ruta-actual-panel');
    const rutaPanel = document.getElementById('ruta-seleccion-panel');
    if (!content) return;

    const rutasBarDiv = document.getElementById('rutas-bar');
    const hoja = getHojaStorageSafe();

    const rutasDisponibles = Array.from(new Set((hoja?.ciclos || []).map(c => c.ruta).filter(Boolean)));
    if (!_rutaSeleccionada || !rutasDisponibles.includes(_rutaSeleccionada)) {
        _rutaSeleccionada = rutasDisponibles[0] || null;
    }

    if (rutasBarDiv) {
        try {
            rutasBarDiv.innerHTML = await RutasBar({ selected: _rutaSeleccionada });
        } catch {
            rutasBarDiv.innerHTML = '';
        }
    }

    const hojaOperativa = construirHojaOperativa(hoja);
    updatePanelOperativo(hojaOperativa, _rutaSeleccionada, _viajeSeleccionado);
    _panelOperativoInterval = setInterval(() => {
        const hojaActualizada = getHojaStorageSafe();
        const hojaActualizadaOperativa = construirHojaOperativa(hojaActualizada);
        updatePanelOperativo(hojaActualizadaOperativa, _rutaSeleccionada, _viajeSeleccionado);
    }, 1000);

    if (!hoja || !hoja.ciclos || hoja.ciclos.length === 0) {
        if (rutaActualPanel) rutaActualPanel.innerHTML = '';
        if (rutaPanel) rutaPanel.innerHTML = '';
        content.innerHTML = '<p>No hay hoja de carga generada. Vuelva a Inicio y seleccione rutas.</p>';
        return;
    }

    const viajesRutaSeleccionada = hoja.ciclos
        .filter(c => c.ruta === _rutaSeleccionada)
        .map(c => normalizarViaje(c.numero))
        .filter(v => v !== null && v !== undefined)
        .sort((a, b) => Number(a) - Number(b));
    if (_viajeSeleccionado === null || !viajesRutaSeleccionada.includes(normalizarViaje(_viajeSeleccionado))) {
        _viajeSeleccionado = viajesRutaSeleccionada[0] ?? null;
    }
    _viajeSeleccionado = normalizarViaje(_viajeSeleccionado);
    const idxViajeSeleccionado = _viajeSeleccionado === null ? -1 : viajesRutaSeleccionada.indexOf(_viajeSeleccionado);
    const puedeViajeAnterior = idxViajeSeleccionado > 0;
    const puedeViajeSiguiente = idxViajeSeleccionado >= 0 && idxViajeSeleccionado < viajesRutaSeleccionada.length - 1;

    const cicloSeleccionado = getCicloSeleccionado(hoja);
    const viajeSeleccionadoAbierto = !isViajeCerrado(_rutaSeleccionada, _viajeSeleccionado);
    const actualEnCurso = getRutaViajeActual(hoja);

    if (rutaActualPanel) {
        rutaActualPanel.innerHTML = rutaActualPanelHtml(rutasDisponibles, _rutaSeleccionada, _viajeSeleccionado, actualEnCurso, cicloSeleccionado, viajeSeleccionadoAbierto);
    }

    if (rutaPanel) {
        rutaPanel.innerHTML = rutaSeleccionPanelHtml(
            _rutaSeleccionada,
            _viajeSeleccionado,
            viajeSeleccionadoAbierto,
            cicloSeleccionado,
            rutasDisponibles,
            puedeViajeAnterior,
            puedeViajeSiguiente
        );
    }

    // Agrupar ciclos por ruta
    const rutas = {};
    hoja.ciclos.forEach((c, idxGlobal) => {
        if (!rutas[c.ruta]) rutas[c.ruta] = [];
        rutas[c.ruta].push({ ...c, __idxGlobal: idxGlobal });
    });

    const rutasFiltradas = _rutaSeleccionada ? { [_rutaSeleccionada]: rutas[_rutaSeleccionada] || [] } : rutas;
    content.innerHTML = Object.entries(rutasFiltradas)
        .map(([nombre, ciclos]) => plantillaEditableHtml(nombre, ciclos))
        .join('<hr style="margin:32px 0;">');
}

function rutaSeleccionPanelHtml(ruta, viaje, abierta, ciclo, rutasDisponibles, puedeViajeAnterior, puedeViajeSiguiente) {
    const rutaLabel = ruta || '-';
    const viajeLabel = viaje ?? '-';
    const idxGlobal = ciclo?.__idxGlobal ?? ciclo?.idxGlobal ?? '';
    const materiales = Object.keys(ciclo?.materiales || {});
    const editorHtml = ciclo ? `
        <div class="ruta-seleccion-editor">
            <div class="tabla-centro ruta-seleccion-copia">
                <table class="tabla-hoja-carga">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th rowspan="2">Hora Llegada Prevista</th>
                            <th rowspan="2">Hora Salida Prevista</th>
                            <th rowspan="2">Hora Llegada Real</th>
                            <th rowspan="2">Hora Inicio Real</th>
                            <th rowspan="2">Hora Fin Real</th>
                            ${materiales.map(mat => `<th colspan="2">${mat}</th>`).join('')}
                            <th rowspan="2">Estado</th>
                        </tr>
                        <tr>
                            ${materiales.map(() => '<th>Previsto</th><th>Real</th>').join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="fila-viaje-seleccionada">
                            <td>${ciclo.numero}</td>
                            <td>${ciclo.horaLlegadaPrevista || ''}</td>
                            <td>${ciclo.horaSalidaPrevista || ''}</td>
                            <td><input type="time" class="js-sel-hora-llegada-real" value="${ciclo.horaLlegadaReal || ''}" readonly ${abierta ? '' : 'disabled'}></td>
                            <td><input type="time" class="js-sel-hora-inicio-real" value="${ciclo.horaInicioReal || ''}" readonly ${abierta ? '' : 'disabled'}></td>
                            <td><input type="time" class="js-sel-hora-salida-real" value="${ciclo.horaSalidaReal || ''}" readonly ${abierta ? '' : 'disabled'}></td>
                            ${materiales.map(mat => `
                                <td>${ciclo.materiales?.[mat] ?? ''}</td>
                                <td><input type="number" min="0" class="js-sel-material-real" data-mat="${mat}" data-prev="${ciclo.materiales?.[mat] ?? ''}" value="${ciclo.cantidadesReales?.[mat] ?? ''}" readonly inputmode="numeric" ${abierta ? '' : 'disabled'}></td>
                            `).join('')}
                            <td>${estadoVisible(ciclo, ruta, viaje)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    ` : '<p class="ruta-seleccion-vacio">Seleccione un viaje para ver y editar sus campos.</p>';

    return `
        <div class="ruta-seleccion-control" data-idx="${idxGlobal}">
            <div class="ruta-seleccion-info">
                <div class="ruta-seleccion-nav" aria-label="Navegación de rutas">
                    <button type="button" class="btn-ruta-nav" data-action="viaje-anterior" ${puedeViajeAnterior ? '' : 'disabled'}>◀</button>
                    <button type="button" class="btn-ruta-nav" data-action="viaje-siguiente" ${puedeViajeSiguiente ? '' : 'disabled'}>▶</button>
                </div>
                <div class="ruta-seleccion-campo">
                    <span class="ruta-seleccion-label">Ruta seleccionada:</span>
                    <select class="ruta-seleccion-select" id="ruta-seleccion-select">
                        ${rutasDisponibles.map(r => `<option value="${r}" ${r === ruta ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div class="ruta-seleccion-campo">
                    <span class="ruta-seleccion-label">Nº viaje:</span>
                    <strong class="ruta-seleccion-valor">${viajeLabel}</strong>
                </div>
            </div>
            <div class="ruta-seleccion-acciones">
                <button type="button" class="btn-ruta-control" data-action="cerrar-ruta" ${abierta ? '' : 'disabled'}>Cerrar</button>
                <button type="button" class="btn-ruta-control" data-action="abrir-ruta" ${abierta ? 'disabled' : ''}>Abrir viaje</button>
                <button type="button" class="btn-ruta-control" data-action="guardar-seleccion" ${!ciclo || !abierta ? 'disabled' : ''}>Guardar selección</button>
            </div>
            ${editorHtml}
        </div>
    `;
}

function updatePanelOperativo(hoja, rutaSeleccionada, viajeSeleccionado) {
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
    const seleccionadaEl = document.getElementById('panel-ruta-seleccionada');
    if (!retrasadasEl || !actualEl || !proximaEl || !siguienteEl || !seleccionadaEl) return;

    const estado = getPanelOperativoState(hoja?.ciclos || [], rutaSeleccionada, now);
    const actualEnCurso = getRutaViajeActual(hoja);

    function formatRutaViaje(item) {
        if (!item) return '-';
        const viaje = item.viaje === null || item.viaje === undefined ? '-' : item.viaje;
        return `${item.ruta} · Viaje ${viaje}`;
    }

    retrasadasEl.innerHTML = estado.retrasadas.length
        ? estado.retrasadas.map(r => `${r.ruta} · Viaje ${r.viaje ?? '-'} (+${r.minutosRetraso} min)`).join('<br>')
        : 'Sin retrasos';

    actualEl.textContent = actualEnCurso
        ? `${actualEnCurso.ruta} · Viaje ${actualEnCurso.viaje}`
        : formatRutaViaje(estado.actual);
    proximaEl.textContent = formatRutaViaje(estado.proxima);
    siguienteEl.textContent = formatRutaViaje(estado.siguiente);

    if (!rutaSeleccionada) {
        seleccionadaEl.textContent = estado.seleccionada?.detalle || '-';
        return;
    }

    const viajeNorm = normalizarViaje(viajeSeleccionado);
    if (!viajeNorm) {
        seleccionadaEl.textContent = rutaSeleccionada;
    } else {
        const sufijoCerrado = isViajeCerrado(rutaSeleccionada, viajeNorm) ? ' (Cerrado)' : '';
        seleccionadaEl.textContent = `${rutaSeleccionada} · Viaje ${viajeNorm}${sufijoCerrado}`;
    }
}





function plantillaEditableHtml(nombre, ciclos) {
    // Obtener todos los tipos de material de todos los ciclos
    const allMats = Array.from(new Set(ciclos.flatMap(c => Object.keys(c.materiales || {}))));
    return `
    <div class="plantilla">
        <h3>Ruta ${nombre}</h3>
        <div class="tabla-centro">
        <table class="tabla-hoja-carga" data-ruta="${nombre}">
            <thead>
                <tr>
                    <th rowspan="2">#</th>
                    <th rowspan="2">Hora Llegada Prevista</th>
                    <th rowspan="2">Hora Salida Prevista</th>
                    <th rowspan="2">Hora Llegada Real</th>
                    <th rowspan="2">Hora Inicio Real</th>
                    <th rowspan="2">Hora Fin Real</th>
                    ${allMats.map(mat => `<th colspan="2">${mat}</th>`).join('')}
                    <th rowspan="2">Estado</th>
                </tr>
                <tr>
                    ${allMats.map(() => '<th>Previsto</th><th>Real</th>').join('')}
                </tr>
            </thead>
            <tbody>
                ${ciclos.map((ciclo) => `
                    <tr class="fila-viaje${_rutaSeleccionada === nombre && normalizarViaje(_viajeSeleccionado) === normalizarViaje(ciclo.numero) ? ' fila-viaje-seleccionada' : ''}${isViajeCerrado(nombre, ciclo.numero) ? ' fila-viaje-cerrada' : ''}" data-ruta="${nombre}" data-viaje="${ciclo.numero}" data-idx="${ciclo.__idxGlobal}">
                        <td>${ciclo.numero}</td>
                        <td>${ciclo.horaLlegadaPrevista}</td>
                        <td>${ciclo.horaSalidaPrevista}</td>
                        <td><input type="time" class="input-hora-llegada" data-idx="${ciclo.__idxGlobal}" value="${ciclo.horaLlegadaReal || ''}" readonly ${isViajeCerrado(nombre, ciclo.numero) ? 'disabled' : ''}></td>
                        <td><input type="time" class="input-hora-inicio" data-idx="${ciclo.__idxGlobal}" value="${ciclo.horaInicioReal || ''}" readonly ${isViajeCerrado(nombre, ciclo.numero) ? 'disabled' : ''}></td>
                        <td><input type="time" class="input-hora-salida" data-idx="${ciclo.__idxGlobal}" value="${ciclo.horaSalidaReal || ''}" readonly ${isViajeCerrado(nombre, ciclo.numero) ? 'disabled' : ''}></td>
                        ${allMats.map(mat => `
                            <td>${ciclo.materiales?.[mat] ?? ''}</td>
                            <td><input type="number" min="0" class="input-cant-real" data-idx="${ciclo.__idxGlobal}" data-mat="${mat}" data-prev="${ciclo.materiales?.[mat] ?? ''}" value="${ciclo.cantidadesReales?.[mat] ?? ''}" readonly inputmode="numeric" ${isViajeCerrado(nombre, ciclo.numero) ? 'disabled' : ''}></td>
                        `).join('')}
                        <td>${estadoVisible(ciclo, nombre, ciclo.numero)}</td>
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
    const rutaBtn = e.target.closest('#rutas-bar .rutas-bar-btn');
    if (rutaBtn) {
        const section = rutaBtn.closest('.section-hoja-carga');
        if (!section) return;
        _rutaSeleccionada = rutaBtn.dataset.ruta || null;
        _viajeSeleccionado = null;
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const saveSeleccionBtn = e.target.closest('#ruta-seleccion-panel [data-action="guardar-seleccion"]');
    if (saveSeleccionBtn) {
        const section = saveSeleccionBtn.closest('.section-hoja-carga');
        if (!section) return;
        const panel = saveSeleccionBtn.closest('.ruta-seleccion-control');
        const idx = Number(panel?.dataset.idx);
        const hoja = getHojaStorageSafe();
        if (!hoja || !Number.isInteger(idx) || !hoja.ciclos[idx]) return;

        const inputInicio = panel.querySelector('.js-sel-hora-inicio-real');
        const inputLlegada = panel.querySelector('.js-sel-hora-llegada-real');
        const inputSalida = panel.querySelector('.js-sel-hora-salida-real');
        if (inputInicio) hoja.ciclos[idx].horaInicioReal = inputInicio.value;
        if (inputLlegada) hoja.ciclos[idx].horaLlegadaReal = inputLlegada.value;
        if (inputSalida) hoja.ciclos[idx].horaSalidaReal = inputSalida.value;

        hoja.ciclos[idx].cantidadesReales = hoja.ciclos[idx].cantidadesReales || {};
        panel.querySelectorAll('.js-sel-material-real').forEach(input => {
            hoja.ciclos[idx].cantidadesReales[input.dataset.mat] = input.value;
        });

        localStorage.setItem('hoja_carga', JSON.stringify(hoja));
        alert('Selección guardada');
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const saveActualBtn = e.target.closest('#ruta-actual-panel [data-action="guardar-actual"]');
    if (saveActualBtn) {
        const section = saveActualBtn.closest('.section-hoja-carga');
        if (!section) return;
        const panel = saveActualBtn.closest('.ruta-actual-control');
        const idx = Number(panel?.dataset.idx);
        const hoja = getHojaStorageSafe();
        if (!hoja || !Number.isInteger(idx) || !hoja.ciclos[idx]) return;

        const inputInicio = panel.querySelector('.js-actual-hora-inicio-real');
        const inputLlegada = panel.querySelector('.js-actual-hora-llegada-real');
        const inputSalida = panel.querySelector('.js-actual-hora-salida-real');
        if (inputInicio) hoja.ciclos[idx].horaInicioReal = inputInicio.value;
        if (inputLlegada) hoja.ciclos[idx].horaLlegadaReal = inputLlegada.value;
        if (inputSalida) hoja.ciclos[idx].horaSalidaReal = inputSalida.value;

        hoja.ciclos[idx].cantidadesReales = hoja.ciclos[idx].cantidadesReales || {};
        panel.querySelectorAll('.js-actual-material-real').forEach(input => {
            hoja.ciclos[idx].cantidadesReales[input.dataset.mat] = input.value;
        });

        localStorage.setItem('hoja_carga', JSON.stringify(hoja));
        alert('Ruta actual guardada');
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const interactiveInTabla = e.target.closest('.section-hoja-carga .tabla-hoja-carga input, .section-hoja-carga .tabla-hoja-carga select, .section-hoja-carga .tabla-hoja-carga textarea, .section-hoja-carga .tabla-hoja-carga button');

    const filaViaje = e.target.closest('.section-hoja-carga .fila-viaje');
    if (filaViaje && !interactiveInTabla) {
        const section = filaViaje.closest('.section-hoja-carga');
        if (!section) return;
        _rutaSeleccionada = filaViaje.dataset.ruta || _rutaSeleccionada;
        _viajeSeleccionado = normalizarViaje(filaViaje.dataset.viaje) || _viajeSeleccionado;
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const tablaRuta = e.target.closest('.section-hoja-carga .tabla-hoja-carga');
    if (tablaRuta && !interactiveInTabla) {
        const section = tablaRuta.closest('.section-hoja-carga');
        if (!section) return;
        _rutaSeleccionada = tablaRuta.dataset.ruta || _rutaSeleccionada;
        _viajeSeleccionado = null;
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const controlBtn = e.target.closest('#ruta-seleccion-panel .btn-ruta-control');
    const actualControlBtn = e.target.closest('#ruta-actual-panel .btn-ruta-control');
    const navBtn = e.target.closest('#ruta-seleccion-panel .btn-ruta-nav');

    if (actualControlBtn) {
        const section = actualControlBtn.closest('.section-hoja-carga');
        if (!section) return;
        const rutaSel = document.getElementById('ruta-actual-select')?.value || _rutaSeleccionada;
        const viajeSel = normalizarViaje(document.getElementById('viaje-actual-input')?.value || _viajeSeleccionado);
        if (!rutaSel || viajeSel === null) return;

        _rutaSeleccionada = rutaSel;
        _viajeSeleccionado = viajeSel;

        if (actualControlBtn.dataset.action === 'cerrar-actual') {
            _viajesCerrados.add(viajeKey(_rutaSeleccionada, _viajeSeleccionado));
            const hoja = getHojaStorageSafe();
            seleccionarSiguienteSegunHora(hoja);
            setTimeout(renderHojaCarga, 0);
            return;
        }

        if (actualControlBtn.dataset.action === 'abrir-actual') {
            _viajesCerrados.delete(viajeKey(_rutaSeleccionada, _viajeSeleccionado));
            setTimeout(renderHojaCarga, 0);
            return;
        }
    }

    if (navBtn) {
        const section = navBtn.closest('.section-hoja-carga');
        if (!section) return;
        const hoja = getHojaStorageSafe();
        const viajesRuta = (hoja?.ciclos || [])
            .filter(c => c.ruta === _rutaSeleccionada)
            .map(c => normalizarViaje(c.numero))
            .filter(v => v !== null && v !== undefined)
            .sort((a, b) => Number(a) - Number(b));
        const idxActual = _viajeSeleccionado === null ? -1 : viajesRuta.indexOf(normalizarViaje(_viajeSeleccionado));
        if (navBtn.dataset.action === 'viaje-anterior' && idxActual > 0) {
            _viajeSeleccionado = viajesRuta[idxActual - 1];
        }
        if (navBtn.dataset.action === 'viaje-siguiente' && idxActual >= 0 && idxActual < viajesRuta.length - 1) {
            _viajeSeleccionado = viajesRuta[idxActual + 1];
        }
        setTimeout(renderHojaCarga, 0);
        return;
    }

    if (controlBtn) {
        const section = controlBtn.closest('.section-hoja-carga');
        if (!section) return;
        if (controlBtn.dataset.action === 'cerrar-ruta' && _rutaSeleccionada && _viajeSeleccionado !== null) {
            _viajesCerrados.add(viajeKey(_rutaSeleccionada, _viajeSeleccionado));
            const hoja = getHojaStorageSafe();
            seleccionarSiguienteSegunHora(hoja);
        }
        if (controlBtn.dataset.action === 'abrir-ruta' && _rutaSeleccionada && _viajeSeleccionado !== null) {
            _viajesCerrados.delete(viajeKey(_rutaSeleccionada, _viajeSeleccionado));
        }
        setTimeout(renderHojaCarga, 0);
        return;
    }

    if (e.target && e.target.classList.contains('btn-guardar-hoja')) {
        const hoja = getHojaStorageSafe();
        if (!hoja) return;
        // Actualizar datos reales de cada ciclo
        const tablas = document.querySelectorAll('.plantilla table');
        tablas.forEach(tabla => {
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach(fila => {
                const inputInicio = fila.querySelector('.input-hora-inicio');
                const inputLlegada = fila.querySelector('.input-hora-llegada');
                const inputSalida = fila.querySelector('.input-hora-salida');
                const idxRaw = inputInicio?.dataset.idx || inputLlegada?.dataset.idx || inputSalida?.dataset.idx;
                const idx = Number(idxRaw);
                if (!Number.isInteger(idx) || !hoja.ciclos[idx]) return;
                if (inputInicio) hoja.ciclos[idx].horaInicioReal = inputInicio.value;
                if (inputLlegada) hoja.ciclos[idx].horaLlegadaReal = inputLlegada.value;
                if (inputSalida) hoja.ciclos[idx].horaSalidaReal = inputSalida.value;
                const inputsCant = fila.querySelectorAll('.input-cant-real');
                hoja.ciclos[idx].cantidadesReales = hoja.ciclos[idx].cantidadesReales || {};
                inputsCant.forEach(input => {
                    hoja.ciclos[idx].cantidadesReales[input.dataset.mat] = input.value;
                });
            });
        });
        localStorage.setItem('hoja_carga', JSON.stringify(hoja));
        alert('Cambios guardados');
    }
});

document.addEventListener('pointerdown', function(e) {
    const timeInput = e.target.closest('.section-hoja-carga .input-hora-inicio, .section-hoja-carga .input-hora-llegada, .section-hoja-carga .input-hora-salida, .section-hoja-carga .js-sel-hora-inicio-real, .section-hoja-carga .js-sel-hora-llegada-real, .section-hoja-carga .js-sel-hora-salida-real, .section-hoja-carga .js-actual-hora-inicio-real, .section-hoja-carga .js-actual-hora-llegada-real, .section-hoja-carga .js-actual-hora-salida-real');
    if (timeInput && !timeInput.disabled && timeInput.readOnly) {
        e.preventDefault();
        e.stopPropagation();
        timeInput.value = horaActualHHMM();
        setTimeout(() => {
            timeInput.readOnly = false;
        }, 0);
        return;
    }

    const qtyInput = e.target.closest('.section-hoja-carga .input-cant-real, .section-hoja-carga .js-sel-material-real, .section-hoja-carga .js-actual-material-real');
    if (qtyInput && !qtyInput.disabled && qtyInput.readOnly) {
        e.preventDefault();
        e.stopPropagation();
        const previsto = qtyInput.dataset.prev;
        if (previsto !== undefined && previsto !== null && previsto !== '') {
            qtyInput.value = previsto;
        }
        setTimeout(() => {
            qtyInput.readOnly = false;
        }, 0);
    }
}, true);

document.addEventListener('blur', function(e) {
    const inputEl = e.target.closest('.section-hoja-carga .input-hora-inicio, .section-hoja-carga .input-hora-llegada, .section-hoja-carga .input-hora-salida, .section-hoja-carga .js-sel-hora-inicio-real, .section-hoja-carga .js-sel-hora-llegada-real, .section-hoja-carga .js-sel-hora-salida-real, .section-hoja-carga .js-actual-hora-inicio-real, .section-hoja-carga .js-actual-hora-llegada-real, .section-hoja-carga .js-actual-hora-salida-real, .section-hoja-carga .input-cant-real, .section-hoja-carga .js-sel-material-real, .section-hoja-carga .js-actual-material-real');
    if (!inputEl) return;
    if (!inputEl.value) {
        inputEl.readOnly = true;
    }
}, true);

document.addEventListener('change', function(e) {
    const viajeActualInput = e.target.closest('#ruta-actual-panel #viaje-actual-input');
    if (viajeActualInput) {
        const section = viajeActualInput.closest('.section-hoja-carga');
        if (!section) return;
        _viajeSeleccionado = normalizarViaje(viajeActualInput.value) || null;
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const routeActualSelect = e.target.closest('#ruta-actual-panel #ruta-actual-select');
    if (routeActualSelect) {
        const section = routeActualSelect.closest('.section-hoja-carga');
        if (!section) return;
        _rutaSeleccionada = routeActualSelect.value || null;
        _viajeSeleccionado = null;
        setTimeout(renderHojaCarga, 0);
        return;
    }

    const routeSelect = e.target.closest('#ruta-seleccion-panel #ruta-seleccion-select');
    if (!routeSelect) return;
    const section = routeSelect.closest('.section-hoja-carga');
    if (!section) return;
    _rutaSeleccionada = routeSelect.value || null;
    _viajeSeleccionado = null;
    setTimeout(renderHojaCarga, 0);
});
