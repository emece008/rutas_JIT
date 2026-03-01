// Componente para mostrar ciclos y su estado
export function VistaCiclos({ ciclos }) {
    return `
    <div class="vista-ciclos">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Hora Llegada Prevista</th>
                    <th>Hora Salida Prevista</th>
                    <th>Hora Llegada Real</th>
                    <th>Hora Salida Real</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${ciclos.map(ciclo => `
                    <tr>
                        <td>${ciclo.numero}</td>
                        <td>${ciclo.horaLlegadaPrevista}</td>
                        <td>${ciclo.horaSalidaPrevista}</td>
                        <td>${ciclo.horaLlegadaReal || ''}</td>
                        <td>${ciclo.horaSalidaReal || ''}</td>
                        <td>${ciclo.estado}</td>
                        <td>
                            <button class="btn-accion" data-numero="${ciclo.numero}">Acción</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}