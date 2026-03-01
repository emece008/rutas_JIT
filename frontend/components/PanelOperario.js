// Componente para panel de identificación de operario
export function PanelOperario({ onIdentificar }) {
    return `
    <div class="panel-operario">
        <label>Operario: <input type="text" id="input-operario" /></label>
        <button id="btn-identificar">Identificar</button>
    </div>
    `;
}