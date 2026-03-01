🧭 Buenas prácticas de Router (para tu forma de trabajar)
1️⃣ Un router decide, no trabaja
👉 Regla de oro:
El router NO hace lógica, NO toca BD, NO valida negocio.
El router solo:
lee la petición




decide a quién llamar




pasa datos




devuelve respuesta




Si el router “hace cosas”, se convierte en un monstruo.


2️⃣ Un único router central
✔️ Un solo punto que recibe todas las peticiones
 ✔️ Normalmente desde public/index.php
Ejemplo mental:
index.php
 └── Router
     ├── auth/login
     ├── auth/logout
     └── camiones/store


👉 Regla:
Si tienes varios routers, ya no sabes quién manda.


3️⃣ Ruta = intención, no carpeta
❌ Pensar:
“Esta ruta tiene que coincidir con esta carpeta”
✅ Pensar:
“Esta ruta expresa lo que quiero hacer”
Ejemplos buenos:
/auth/login




/auth/logout




/camiones/store




/camiones/list




La URL describe acción, no estructura interna.


4️⃣ Separar método HTTP y ruta
Esto es clave.
Acción
Método
Ruta
Ver
GET
/camiones
Crear
POST
/camiones
Login
POST
/auth/login
Logout
POST
/auth/logout


👉 Regla:
La misma ruta puede hacer cosas distintas según el método.


5️⃣ El router NO valida permisos, pero los llama
El router:
detecta la ruta




llama a Auth si hace falta




Ejemplo mental:
“Esta ruta necesita login → pregunto a Auth”
Pero:
no comprueba roles




no decide reglas de negocio




Eso es trabajo del controlador.


6️⃣ Controladores pequeños y claros
Cada ruta apunta a:
un controlador




un método




Ejemplo:
/auth/login → AuthController@login
/camiones   → CamionesController@index


👉 Regla:
Una ruta = una acción clara.


7️⃣ No meter lógica en index.php
index.php:
carga bootstrap




instancia router




lanza el router




Nada más.
Si ves:
SQL




if enormes




HTML




👉 está mal sitio.


8️⃣ Responder siempre de forma consistente
Decide un estándar:
siempre JSON en API




mismo formato de error




mismos códigos HTTP




Ejemplo mental:
{
  "success": false,
  "error": "No autorizado"
}


👉 Regla:
El frontend no debería adivinar cómo responde el backend.


9️⃣ Rutas protegidas explícitamente
❌ No confiar en “esto no lo va a llamar nadie”.
✅ Proteger rutas claramente:
rutas públicas




rutas privadas




Ejemplo mental:
Router::post('/camiones', [CamionesController::class, 'store'], auth: true);


Aunque lo implementes simple, la intención debe verse.


🔟 Router simple > router “listo”
Evita:
regex locas




magia negra




autodescubrimiento raro




Prefiere:
arrays




condiciones claras




código que se entienda leyendo




👉 Regla:
Si no puedes explicarlo en voz alta, es demasiado complejo.


🧱 Resumen rápido
Router decide, no ejecuta lógica




Un solo router




Rutas expresan intención




Método HTTP importa




Controladores pequeños




Auth se consulta, no se replica




Respuestas coherentes




Claridad > magia






🎯 Frase final (para grabar)
El router es un semáforo,
 no el conductor.





