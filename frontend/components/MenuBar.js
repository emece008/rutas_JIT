// Componente de barra de menú
export function MenuBar({ onNavigate }) {
    return `
    <nav class="menu-bar">
        <button class="menu-btn" data-section="inicio">Inicio</button>
        <button class="menu-btn" data-section="rutas">Rutas</button>
        <button class="menu-btn" data-section="hoja-carga">Hoja de Carga</button>
        <button class="menu-btn" data-section="historial">Historial</button>
        <button class="menu-btn" data-section="supervisor">Supervisor</button>
        <button class="menu-btn" data-section="reloj">⏰ Reloj</button>
        <button class="menu-btn" id="btn-cerrar-sesion" style="margin-left:auto;background:#e53935;color:#fff;">Cerrar sesión</button>
    </nav>
    `;
}