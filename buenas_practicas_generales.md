🧭 Guía de buenas prácticas (versión “para Christian”)
# Buenas prácticas generales del proyecto
## Punto de entrada y bootstrap
- Todo el proyecto entra por `public/index.php`.
- Se usa un `bootstrap.php` (o un bloque inicial) para cargar la configuración, iniciar la sesión y preparar la aplicación antes de manejar cualquier petición de usuario.
## BASE_PATH
- Se define una única vez al inicio (`public/index.php`).
- Siempre apunta a la raíz real del proyecto.
- Todas las rutas internas usan BASE_PATH.
## Separación de responsabilidades
- Cada archivo tiene una sola responsabilidad.
- Auth decide, Session guarda, Router enruta.
## Sesiones y seguridad
- La sesión se inicia en el bootstrap, pero no se asocia a un usuario hasta que este interactúa (por ejemplo, al hacer login).
- Nunca se accede a `$_SESSION` directamente fuera de la clase Session.
1️⃣ Punto de entrada único (ya lo tienes)
✔️ Todo entra por public/index.php
 ✔️ Ahí defines BASE_PATH
 ✔️ Ahí arrancas el sistema
👉 Regla:
Si algo no pasa por el index, huele mal.


2️⃣ Separación clara de responsabilidades (CLAVE)
Nunca mezclar:
Cosa
Dónde va
SQL
Repositorio / servicio
Autenticación
Auth
Sesión
Session
Decisiones
Controladores
HTML
Vista
Configuración
config/


👉 Regla:
Un archivo debe tener una sola razón para cambiar.


3️⃣ No usar superglobales directamente
❌ $_SESSION
 ❌ $_POST
 ❌ $_GET
✅ Acceso controlado:
Session




Request (más adelante)




Métodos claros




👉 Regla:
Si PHP lo da “gratis”, protégelo con una capa.


4️⃣ Nunca confiar en el frontend
Todo lo que venga de:
formularios




fetch




JS




URL




👉 es mentira hasta que se demuestre lo contrario.
✔️ Validar siempre en backend
 ✔️ Auth siempre en backend
 ✔️ Permisos siempre en backend


5️⃣ Configuración ≠ código
Credenciales → config/env.php




Código → core, modules




❌ Mezclar lógica con config
 ❌ Subir credenciales a Git
👉 Regla:
Si cambia entre entornos, NO es código.


6️⃣ Clases base = infraestructura
Session, Auth, Database, Router:
✔️ Pueden ser estáticas
 ✔️ No tienen lógica de negocio
 ✔️ Se usan desde cualquier sitio
👉 Regla:
Las clases base sostienen el sistema, no deciden.


7️⃣ Errores: fallar pronto y claro
require para cosas críticas




try/catch donde haya riesgo real




mensajes claros en desarrollo




mensajes neutros en producción




👉 Regla:
Mejor que falle ahora que silenciosamente dentro de 3 horas.


8️⃣ Nombres claros > código “listo”
Prefiere:
Auth::check()


a:
if (isset($_SESSION['u']))


👉 Regla:
Si hay que pensar qué hace, está mal nombrado.


9️⃣ Menos magia, más explícito
❌ cosas “que pasan solas”
 ❌ includes invisibles
 ❌ dependencias ocultas
✔️ Todo claro:
qué se carga




cuándo




por qué




👉 Regla:
El código se lee más veces de las que se escribe.


🔟 Documentar cómo trabajas, no el código
No documentes:
“esta función suma”




Sí documenta:
estructura




flujo




reglas




decisiones




👉 Regla:
Documenta el POR QUÉ, no el QUÉ.


🧱 11️⃣ Estándar personal (esto es importante)
Lo que estás haciendo ahora es definir:
tu forma de trabajar
Eso vale más que cualquier framework.
Porque mañana:
cambias de lenguaje




cambias de stack




cambias de proyecto




Y las reglas siguen valiendo.


🎯 Regla final (la más importante)
Si algo te da paz mental al leerlo dentro de 6 meses,
 es una buena práctica.
Y todo lo que estamos definiendo va exactamente en esa dirección.





