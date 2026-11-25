# Biblioteca Digital — WebZipe / AUNAR

Proyecto web conectado a Supabase. Incluye login, página de bienvenida y catálogo de libros leído en vivo desde la base de datos.

## Archivos

| Archivo | Función |
|---|---|
| `supabase.js` | Configuración y cliente de Supabase (Auth + PostgREST con `fetch`) |
| `login.html` / `login.js` | Inicio de sesión contra Supabase Auth |
| `bienvenida.html` / `bienvenida.js` | Página protegida tras el ingreso |
| `biblioteca.html` / `biblioteca.js` | Catálogo con búsqueda, filtros y detalle |
| `estilo.css` | Diseño responsive (azul noche + dorado) |
| `setup.sql` | Arranque de la base de datos: usuario + tabla + datos |
| `_originales/` | Copia de los archivos antes de la corrección |

## Conexión

- URL: `https://hypxybgvxvpwfqflijty.supabase.co`
- Clave pública: `sb_publishable_x6A2XiGzM9F2Qlk9xwBUvA_UK3HoJJz`
- Usuario: `cehg@aunar.com`
- Contraseña: `aunar123`

La clave publishable está pensada para usarse en el navegador. Las peticiones llevan los headers `apikey` y `Authorization: Bearer`, y Supabase responde con CORS `*`, así que funciona incluso abriendo los HTML desde disco.

## Puesta en marcha (importante)

El proyecto Supabase está recién creado: no tiene usuario ni tablas. Además tiene `mailer_autoconfirm: false`, así que un signup normal NO deja entrar hasta confirmar el correo. Por eso hay un paso inicial:

1. Entrar a Supabase → **SQL Editor** → **New query**.
2. Pegar todo el contenido de `setup.sql` y dar **Run**.
3. Verificar: debe mostrar `8` libros y `confirmado = true`.

Después de eso, el login usa **Supabase Auth real** y la biblioteca lee `public.libros` directamente desde PostgREST.

Mientras no se ejecute `setup.sql`, el sistema permite el ingreso con `cehg@aunar.com` / `aunar123` mediante un modo de arranque local, para que puedas revisar las pantallas. La biblioteca mostrará un aviso indicando que falta crear la tabla.

## Uso

Abre `login.html` (doble clic o servidor local), ingresa las credenciales y serás redirigido a `bienvenida.html`. Desde allí, el botón **Abrir biblioteca** muestra el catálogo.

Para servir por HTTP (recomendado en algunos navegadores):

```bash
cd "C:\Users\ivanl\Desktop\nueva carpeta\games\Links"
python -m http.server 8000
```

Luego visita `http://localhost:8000/login.html`.

## Notas de seguridad

El modo de arranque guarda las credenciales autorizadas en `supabase.js` solo para la demostración del proyecto de clase. Una vez ejecutado `setup.sql`, puedes eliminar `Supa.esArranque` y el bloque `2) Arranque del proyecto de clase` en `login.js`: el ingreso seguirá funcionando porque Supabase ya valida al usuario.
