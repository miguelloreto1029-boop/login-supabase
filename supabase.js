/* ============================================================
   supabase.js — Cliente de Supabase para la Biblioteca Digital
   Usa la API oficial (Auth + PostgREST) con fetch directo.
   Funciona abriendo los archivos desde disco (file://) o por HTTP.
   ============================================================ */
(function (global) {
    "use strict";

    const URL_BASE = "https://hypxybgvxvpwfqflijty.supabase.co";
    const CLAVE_PUBLICA = "sb_publishable_x6A2XiGzM9F2Qlk9xwBUvA_UK3HoJJz";

    /* Credencial autorizado para el arranque del proyecto de clase.
       Solo se usa cuando el usuario todavia no existe en Supabase.
       Despues de ejecutar setup.sql, el ingreso real lo hace Supabase. */
    const USUARIO_ARRANQUE = Object.freeze({
        email: "cehg@aunar.com",
        clave: "aunar123"
    });

    function cabeceras(token) {
        const h = {
            "apikey": CLAVE_PUBLICA,
            "Content-Type": "application/json"
        };
        if (token) h["Authorization"] = "Bearer " + token;
        return h;
    }

    async function pedir(ruta, opciones, token) {
        opciones = opciones || {};
        const respuesta = await fetch(URL_BASE + ruta, {
            method: opciones.method || "GET",
            headers: Object.assign(cabeceras(token), opciones.headers || {}),
            body: opciones.body
        });

        const texto = await respuesta.text();
        let datos = null;
        try { datos = texto ? JSON.parse(texto) : null; }
        catch (e) { datos = texto; }

        if (!respuesta.ok) {
            const error = new Error(
                (datos && (datos.msg || datos.message || datos.error_description)) ||
                ("Error " + respuesta.status)
            );
            error.status = respuesta.status;
            error.codigo = (datos && (datos.error_code || datos.code)) || null;
            error.datos = datos;
            throw error;
        }
        return datos;
    }

    const Supa = {
        url: URL_BASE,
        clave: CLAVE_PUBLICA,

        /* Inicia sesion contra Supabase Auth. Devuelve usuario + token. */
        async iniciarSesion(correo, clave) {
            const datos = await pedir("/auth/v1/token?grant_type=password", {
                method: "POST",
                body: JSON.stringify({ email: correo, password: clave })
            });
            return {
                usuario: datos.user,
                token: datos.access_token,
                refresco: datos.refresh_token,
                expiraEn: datos.expires_in
            };
        },

        /* Verifica que el token siga siendo valido. */
        async verificarToken(token) {
            return pedir("/auth/v1/user", { method: "GET" }, token);
        },

        async cerrarSesion(token) {
            if (!token) return;
            try { await pedir("/auth/v1/logout", { method: "POST" }, token); }
            catch (e) { /* la sesion local se borra de todas formas */ }
        },

        /* Consulta una tabla mediante PostgREST. */
        async listar(tabla, opciones, token) {
            opciones = opciones || {};
            const p = new URLSearchParams();
            p.set("select", opciones.columnas || "*");
            if (opciones.ordenar) p.set("order", opciones.ordenar);
            if (opciones.limite) p.set("limit", String(opciones.limite));
            if (opciones.buscar && opciones.campoBusqueda) {
                p.set(opciones.campoBusqueda, "ilike.*" + opciones.buscar + "*");
            }
            if (opciones.igual) {
                Object.keys(opciones.igual).forEach(function (k) {
                    p.set(k, "eq." + opciones.igual[k]);
                });
            }
            const ruta = "/rest/v1/" + encodeURIComponent(tabla) + "?" + p.toString();
            return pedir(ruta, { method: "GET" }, token);
        },

        esArranque: function (correo, clave) {
            return String(correo || "").trim().toLowerCase() === USUARIO_ARRANQUE.email &&
                   clave === USUARIO_ARRANQUE.clave;
        },

        sesion: {
            guardar: function (datos) {
                sessionStorage.setItem("biblio_sesion", JSON.stringify(datos));
                sessionStorage.setItem("usuario", datos.email);
            },
            leer: function () {
                try { return JSON.parse(sessionStorage.getItem("biblio_sesion") || "null"); }
                catch (e) { return null; }
            },
            borrar: function () {
                sessionStorage.removeItem("biblio_sesion");
                sessionStorage.removeItem("usuario");
                sessionStorage.removeItem("token");
            }
        }
    };

    global.Supa = Supa;
})(window);
