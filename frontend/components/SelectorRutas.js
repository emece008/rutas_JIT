// Componente para selección de rutas del día
export function SelectorRutas({ rutas, onSeleccionar }) {
    return `
    <div class="selector-rutas">
        <label>Selecciona rutas del día:</label>
        <div>
            ${rutas.map(ruta => `
                <label><input type="checkbox" value="${ruta}" class="chk-ruta" /> ${ruta}</label>
            `).join('')}
        </div>
        <button id="btn-generar-hoja">Generar Hoja del Día</button>
    </div>
    `;
}