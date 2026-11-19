// Datos de conexión a Supabase (la clave "publishable" está pensada para usarse en el navegador)
const SUPABASE_URL = "https://hypxybgvxvpwfqflijty.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x6A2XiGzM9F2Qlk9xwBUvA_UK3HoJJz";

const formulario = document.getElementById("form-login");
const campoCorreo = document.getElementById("correo");
const campoClave = document.getElementById("clave");
const botonIngresar = document.getElementById("btn-ingresar");
const mensaje = document.getElementById("mensaje");
const tarjeta = document.getElementById("tarjeta");

// Si ya hay una sesión abierta, ir directo a la bienvenida
if (sessionStorage.getItem("usuario")) {
    window.location.replace("bienvenida.html");
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = tipo; // "error" o "ok"
}

// Consulta a Supabase si el usuario existe y la contraseña es correcta
async function validarUsuario(correo, clave) {
    const respuesta = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({ email: correo, password: clave })
    });

    const datos = await respuesta.json().catch(function () { return {}; });

    if (respuesta.ok) {
        return { existe: true, usuario: datos.user, token: datos.access_token };
    }

    // Credenciales incorrectas o usuario inexistente
    if (respuesta.status === 400 && datos.error_code !== "email_not_confirmed") {
        return { existe: false };
    }

    // Cualquier otro caso es un problema técnico (clave inválida, correo sin confirmar, etc.)
    throw new Error(datos.msg || datos.error_description || datos.message || ("Error " + respuesta.status));
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const correo = campoCorreo.value.trim();
    const clave = campoClave.value;

    if (!correo || !clave) {
        mostrarMensaje("Escribe tu correo y tu contraseña.", "error");
        return;
    }

    botonIngresar.disabled = true;
    botonIngresar.textContent = "Verificando…";
    mostrarMensaje("", "");

    try {
        const resultado = await validarUsuario(correo, clave);

        if (resultado.existe) {
            sessionStorage.setItem("usuario", resultado.usuario.email || correo);
            sessionStorage.setItem("token", resultado.token);
            window.location.href = "bienvenida.html";
        } else {
            mostrarMensaje("Usuario inválido. Verifica tus datos e inténtalo de nuevo.", "error");
            tarjeta.classList.remove("sacudir");
            void tarjeta.offsetWidth; // reinicia la animación
            tarjeta.classList.add("sacudir");
        }
    } catch (error) {
        mostrarMensaje("No se pudo validar el usuario: " + error.message, "error");
    } finally {
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar";
    }
});
