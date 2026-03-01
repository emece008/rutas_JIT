// Punto de entrada principal de la app JIT

import { Header } from '../components/Header.js';
import { MenuBar } from '../components/MenuBar.js';
import { Inicio, initInicioClock } from '../sections/Inicio.js';
import { Rutas } from '../sections/Rutas.js';
import { Historial } from '../sections/Historial.js';

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
        const root = document.documentElement;
        root.style.setProperty('--header-height', `${Math.ceil(headerRect.height)}px`);
        root.style.setProperty('--menu-height', `${Math.ceil(menuRect.height)}px`);
        const extra = 16;
        const total = Math.ceil(headerRect.height + menuRect.height + extra);
        appEl.style.paddingTop = `${total}px`;
    }
    // Ajustar ahora y al cambiar tamaño
    setTimeout(adjustTopPadding, 0);
    window.addEventListener('resize', adjustTopPadding);
    
    function setActiveMenu(section) {
        document.querySelectorAll('.menu-btn[data-section]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
    }

    // Función para navegar entre secciones
    // Importar dinámicamente Supervisor para evitar error si no existe aún
    async function navigate(section) {
        const sectionContent = document.getElementById('section-content');
        setActiveMenu(section);
        if (section === 'inicio') {
            sectionContent.innerHTML = Inicio();
            initInicioClock();
        } else if (section === 'rutas') {
            sectionContent.innerHTML = Rutas();
        } else if (section === 'hoja-carga') {
            try {
                const mod = await import('../sections/HojaCarga.js');
                sectionContent.innerHTML = mod.HojaCarga();
                if (typeof mod.initHojaCarga === 'function') {
                    mod.initHojaCarga();
                }
            } catch (e) {
                console.error('Error cargando Hoja de Carga:', e);
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
