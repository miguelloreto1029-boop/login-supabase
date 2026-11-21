const formulario = document.getElementById("form-login");
const campoCorreo = document.getElementById("correo");
const campoClave = document.getElementById("clave");
const botonIngresar = document.getElementById("btn-ingresar");
const mensaje = document.getElementById("mensaje");
const tarjeta = document.getElementById("tarjeta");

// Si ya hay sesión, ir directo a bienvenida
if (sessionStorage.getItem("usuario")) {
    window.location.replace("bienvenida.html");
}

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "error";
    tarjeta.classList.remove("sacudir");
    void tarjeta.offsetWidth; // reinicia la animación
    tarjeta.classList.add("sacudir");
}

// Si se vuelve desde una validación fallida, mostrar el aviso
const parametros = new URLSearchParams(window.location.search);
if (parametros.get("error") === "invalido") {
    mostrarError("Usuario inválido. Verifica tu correo y contraseña.");
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const correo = campoCorreo.value.trim();
    const clave = campoClave.value;

    if (!correo || !clave) {
        mostrarError("Escribe tu correo y tu contraseña.");
        return;
    }

    botonIngresar.disabled = true;
    botonIngresar.textContent = "Verificando…";
    mensaje.textContent = "";

    try {
        const usuario = await SupaDB.validarUsuario(correo, clave);

        if (usuario) {
            sessionStorage.setItem("usuario", usuario.correo);
            window.location.href = "bienvenida.html";
            return;
        }

        // No existe: volver al login con el aviso
        window.location.replace("login.html?error=invalido");
    } catch (error) {
        mostrarError("No se pudo conectar con la base de datos: " + error.message);
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar";
    }
});
