// Punto de entrada principal de la app JIT

import { Header } from '../components/Header.js';
import { MenuBar } from '../components/MenuBar.js';
import { Inicio } from '../sections/Inicio.js';
import { Rutas } from '../sections/Rutas.js';
import { Historial } from '../sections/Historial.js';
import { PanelOperario } from '../components/PanelOperario.js';
import { SelectorRutas } from '../components/SelectorRutas.js';
import { VistaCiclos } from '../components/VistaCiclos.js';
import { cargarPlantillas } from '../services/plantillasService.js';
import { crearHojaDia, hojaDia } from '../services/hojaDiaService.js';

async function main() {

    const app = document.getElementById('app');
    // Renderizar cabecera y menú
    app.innerHTML = `
        ${Header()}
        ${MenuBar({})}
        <div id="section-content"></div>
    `;

    // Ajuste dinámico: calcular altura de header+menu y aplicar padding-top a #app
    function adjustTopPadding() {
        const header = document.querySelector('.main-header');
        const menu = document.querySelector('.menu-bar');
        const appEl = document.getElementById('app');
        if (!header || !menu || !appEl) return;
        const headerRect = header.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const extra = 4; // pequeño espacio extra
        const total = Math.ceil(headerRect.height + menuRect.height + extra);
        appEl.style.paddingTop = `${total}px`;
    }
    // Ajustar ahora y al cambiar tamaño
    setTimeout(adjustTopPadding, 0);
    window.addEventListener('resize', adjustTopPadding);
    
    // Debug visual: muestra alturas y contornos para depuración visual
    function showHeaderMenuDebug() {
        const header = document.querySelector('.main-header');
        const menu = document.querySelector('.menu-bar');
        if (!header || !menu) return;
        // añadir borde temporal
        header.style.outline = '2px solid rgba(255,0,0,0.6)';
        menu.style.outline = '2px solid rgba(0,128,0,0.6)';
        // crear panel de información
        let dbg = document.getElementById('debug-header-menu');
        if (!dbg) {
            dbg = document.createElement('div');
            dbg.id = 'debug-header-menu';
            dbg.style.position = 'fixed';
            dbg.style.right = '8px';
            dbg.style.top = '8px';
            dbg.style.background = 'rgba(0,0,0,0.6)';
            dbg.style.color = '#fff';
            dbg.style.padding = '6px 8px';
            dbg.style.fontSize = '12px';
            dbg.style.zIndex = '1100';
            dbg.style.borderRadius = '4px';
            document.body.appendChild(dbg);
        }
        const h = Math.round(header.getBoundingClientRect().height);
        const m = Math.round(menu.getBoundingClientRect().height);
        dbg.innerText = `header: ${h}px\nmenu: ${m}px\ntotal padding: ${h + m + 4}px`;
        // auto-remove after 6s
        setTimeout(() => {
            if (dbg && dbg.parentNode) dbg.parentNode.removeChild(dbg);
            header.style.outline = '';
            menu.style.outline = '';
        }, 6000);
    }
    // show debug once on load
    setTimeout(showHeaderMenuDebug, 200);

    // Función para navegar entre secciones
    // Importar dinámicamente Supervisor para evitar error si no existe aún
    async function navigate(section) {
        const sectionContent = document.getElementById('section-content');
        if (section === 'inicio') {
            sectionContent.innerHTML = Inicio();
        } else if (section === 'rutas') {
            sectionContent.innerHTML = Rutas();
        } else if (section === 'hoja-carga') {
            try {
                const mod = await import('../sections/HojaCarga.js');
                sectionContent.innerHTML = mod.HojaCarga();
            } catch (e) {
                sectionContent.innerHTML = '<div style="color:red">Error cargando Hoja de Carga</div>';
            }
        } else if (section === 'historial') {
            sectionContent.innerHTML = Historial();
        } else if (section === 'supervisor') {
            const { Supervisor } = await import('../sections/Supervisor.js');
            sectionContent.innerHTML = Supervisor();
        } else if (section === 'reloj') {
            const { Reloj, initReloj } = await import('../sections/Reloj.js');
            sectionContent.innerHTML = Reloj();
            initReloj();
        }
    }

    // Delegar clicks en el menú
    app.addEventListener('click', (e) => {
        if (e.target.classList.contains('menu-btn')) {
            if (e.target.id === 'btn-cerrar-sesion') {
                localStorage.removeItem('operario');
                localStorage.removeItem('rutas_seleccionadas');
                localStorage.removeItem('hoja_carga');
                location.reload();
                return;
            }
            navigate(e.target.dataset.section);
        }
    });

    // Cargar sección inicio por defecto
    navigate('inicio');
}

document.addEventListener('DOMContentLoaded', main);