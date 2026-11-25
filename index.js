/* ============================================================
   login.js — Inicio de sesión contra Supabase Auth
   ============================================================ */

const formulario = document.getElementById("form-login");
const campoCorreo = document.getElementById("correo");
const campoClave = document.getElementById("clave");
const botonIngresar = document.getElementById("btn-ingresar");
const mensaje = document.getElementById("mensaje");
const tarjeta = document.getElementById("tarjeta");

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = tipo || "";
}

function sacudir() {
    tarjeta.classList.remove("sacudir");
    void tarjeta.offsetWidth;
    tarjeta.classList.add("sacudir");
}

function irABienvenida() {
    window.location.href = "bienvenida.html";
}

/* Si ya existe una sesión, no volver a pedir credenciales. */
(function verificarSesionPrev() {
    const sesion = Supa.sesion.leer();
    if (sesion && sesion.email) irABienvenida();
})();

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const correo = campoCorreo.value.trim();
    const clave = campoClave.value;

    if (!correo || !clave) {
        mostrarMensaje("Escribe tu correo y tu contraseña.", "error");
        sacudir();
        return;
    }

    botonIngresar.disabled = true;
    botonIngresar.textContent = "Conectando con Supabase…";
    mostrarMensaje("", "");

    try {
        /* 1) Intento real contra Supabase Auth */
        const resultado = await Supa.iniciarSesion(correo, clave);

        Supa.sesion.guardar({
            email: resultado.usuario.email || correo,
            token: resultado.token,
            origen: "supabase"
        });
        irABienvenida();
        return;

    } catch (error) {
        const esSinUsuario = error.codigo === "invalid_credentials" ||
                             error.codigo === "email_not_confirmed";

        /* 2) Arranque del proyecto de clase: el usuario autorizado entra
             aunque todavía no esté creado en Supabase.
             Ejecuta setup.sql en el SQL Editor para usar Supabase al 100%. */
        if (esSinUsuario && Supa.esArranque(correo, clave)) {
            Supa.sesion.guardar({ email: correo, token: null, origen: "arranque" });
            irABienvenida();
            return;
        }

        if (esSinUsuario) {
            mostrarMensaje("Usuario inválido. Verifica tus datos e inténtalo de nuevo.", "error");
        } else {
            mostrarMensaje("No se pudo conectar con Supabase: " + error.message, "error");
        }
        sacudir();

    } finally {
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar";
    }
});
