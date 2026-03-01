// Sección Reloj Digital con Sistema de Alarmas y Notificaciones

let _relojInterval = null;
let _alarmasCache = null;

function getAlarmas() {
    if (_alarmasCache === null) {
        _alarmasCache = JSON.parse(localStorage.getItem('alarmas_reloj') || '[]');
    }
    return _alarmasCache;
}

function saveAlarmas(alarmas) {
    _alarmasCache = alarmas;
    localStorage.setItem('alarmas_reloj', JSON.stringify(alarmas));
}

export function Reloj() {
    return `
    <div class="section-reloj">
        <h2>⏰ Reloj Digital</h2>
        <div class="reloj-display" id="reloj-display">00:00:00</div>
        <div class="reloj-fecha" id="reloj-fecha"></div>

        <div class="notificacion-alarma" id="notificacion-alarma" style="display:none">
            <span id="notificacion-texto"></span>
            <button class="notificacion-cerrar" onclick="document.getElementById('notificacion-alarma').style.display='none'">✕</button>
        </div>

        <div class="alarmas-panel">
            <h3>Agregar alarma</h3>
            <form id="form-alarma" class="form-alarma">
                <label>Hora:
                    <input type="time" id="alarma-hora" required>
                </label>
                <label>Etiqueta:
                    <input type="text" id="alarma-etiqueta" placeholder="Ej: Reunión" maxlength="60">
                </label>
                <button type="submit">➕ Agregar</button>
            </form>
            <h3>Alarmas programadas</h3>
            <div id="lista-alarmas"></div>
        </div>
    </div>`;
}

function renderAlarmas() {
    const alarmas = getAlarmas();
    const lista = document.getElementById('lista-alarmas');
    if (!lista) return;
    if (alarmas.length === 0) {
        lista.innerHTML = '<p class="alarmas-vacio">No hay alarmas configuradas.</p>';
        return;
    }
    lista.innerHTML = alarmas.map((a, i) => `
        <div class="alarma-item${a.disparada ? ' alarma-disparada' : ''}">
            <span class="alarma-hora">${a.hora}</span>
            <span class="alarma-etiqueta">${a.etiqueta || ''}</span>
            <span class="alarma-estado">${a.disparada ? '✅ Disparada' : '⏳ Activa'}</span>
            <button class="alarma-del-btn" data-idx="${i}" title="Eliminar alarma">🗑️</button>
        </div>
    `).join('');
    lista.querySelectorAll('.alarma-del-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const actual = getAlarmas();
            actual.splice(idx, 1);
            saveAlarmas(actual);
            renderAlarmas();
        };
    });
}

function mostrarNotificacion(mensaje) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rutas JIT — Alarma', { body: mensaje });
    }
    const notif = document.getElementById('notificacion-alarma');
    const texto = document.getElementById('notificacion-texto');
    if (notif && texto) {
        texto.textContent = mensaje;
        notif.style.display = 'flex';
        setTimeout(() => {
            if (notif) notif.style.display = 'none';
        }, 10000);
    }
}

export function initReloj() {
    if (_relojInterval) {
        clearInterval(_relojInterval);
        _relojInterval = null;
    }
    // Invalidate cache so alarms are freshly loaded for this session
    _alarmasCache = null;

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const form = document.getElementById('form-alarma');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const hora = document.getElementById('alarma-hora').value;
            const etiqueta = document.getElementById('alarma-etiqueta').value.trim();
            if (!hora) return;
            const alarmas = getAlarmas();
            const fechaHoy = new Date().toISOString().slice(0, 10);
            // Determine the target date: if the time has already passed today, schedule for tomorrow
            const [aHH, aMM] = hora.split(':').map(Number);
            const now = new Date();
            const yaPassado = aHH < now.getHours() || (aHH === now.getHours() && aMM <= now.getMinutes());
            const fecha = yaPassado
                ? new Date(now.getTime() + 86400000).toISOString().slice(0, 10)
                : fechaHoy;
            alarmas.push({ hora, etiqueta, fecha, disparada: false });
            saveAlarmas(alarmas);
            form.reset();
            renderAlarmas();
        };
    }

    renderAlarmas();

    function tick() {
        const display = document.getElementById('reloj-display');
        if (!display) {
            clearInterval(_relojInterval);
            _relojInterval = null;
            return;
        }
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        display.textContent = `${hh}:${mm}:${ss}`;

        const fechaEl = document.getElementById('reloj-fecha');
        if (fechaEl) {
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            fechaEl.textContent = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
        }

        const horaActual = `${hh}:${mm}`;
        const fechaHoy = now.toISOString().slice(0, 10);
        const alarmas = getAlarmas();
        let changed = false;
        alarmas.forEach(a => {
            if (!a.disparada && a.hora === horaActual && (!a.fecha || a.fecha === fechaHoy)) {
                a.disparada = true;
                changed = true;
                mostrarNotificacion(a.etiqueta ? `⏰ Alarma: ${a.etiqueta}` : '⏰ ¡Alarma!');
            }
        });
        if (changed) {
            saveAlarmas(alarmas);
            renderAlarmas();
        }
    }

    tick();
    _relojInterval = setInterval(tick, 1000);
}
