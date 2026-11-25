/* ============================================================
   bienvenida.js — Página de bienvenida protegida
   ============================================================ */

(async function iniciar() {
    const sesion = Supa.sesion.leer();

    /* Sin sesión guardada, volver al login. */
    if (!sesion || !sesion.email) {
        window.location.replace("login.html");
        return;
    }

    /* Si la sesión viene de Supabase, comprobar que el token siga vivo. */
    if (sesion.origen === "supabase" && sesion.token) {
        try {
            const usuario = await Supa.verificarToken(sesion.token);
            sesion.email = usuario.email || sesion.email;
            Supa.sesion.guardar(sesion);
        } catch (error) {
            Supa.sesion.borrar();
            window.location.replace("login.html");
            return;
        }
    }

    const hora = new Date().getHours();
    let saludo = "Buenas noches";
    if (hora < 12) {
        saludo = "Buenos días";
    } else if (hora < 19) {
        saludo = "Buenas tardes";
    }

    document.getElementById("saludo").textContent = saludo;
    document.getElementById("usuario").textContent = sesion.email;
    document.getElementById("fecha").textContent = new Date().toLocaleDateString("es-CO", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    document.getElementById("origen").textContent =
        sesion.origen === "supabase" ? "Sesión autenticada con Supabase" : "Sesión de arranque — ejecuta setup.sql para activar Supabase";

    document.getElementById("btn-biblioteca").addEventListener("click", function () {
        window.location.href = "biblioteca.html";
    });

    document.getElementById("btn-salir").addEventListener("click", async function () {
        if (sesion.token) await Supa.cerrarSesion(sesion.token);
        Supa.sesion.borrar();
        window.location.href = "login.html";
    });
})();
