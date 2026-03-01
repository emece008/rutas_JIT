# JIT v2 – Selección automática de siguiente ruta + cierre manual

## Objetivo
Actualizar la aplicación Rutas JIT para:

- Mostrar la ruta "actual/siguiente" según la hora.
- Separar visualmente:
  - Ruta principal
  - Rutas pendientes
  - Rutas cerradas
- Permitir cierre manual aunque esté incompleta.

## Reglas de negocio
- La siguiente ruta se calcula según la hora actual del sistema.
- Si una ruta está activa, debe mostrarse en cabecera.
- El cierre manual debe registrar timestamp.
- No deben existir duplicados tras refresco.

## Criterios de aceptación
- Si son las 10:05 → se muestra la L3 correspondiente.
- Si son las 13:45 → se muestra L4 si corresponde.
- El cierre manual mueve la ruta a sección "cerradas".
- La UI mantiene tres secciones claras.
- No se rompe funcionalidad existente.
