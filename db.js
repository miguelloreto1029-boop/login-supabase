// db.js: librería de acceso a Supabase
const SupaDB = (function () {
    const CONFIG = {
        url: "https://hypxybgvxvpwfqflijty.supabase.co",
        key: "sb_publishable_x6A2XiGzM9F2Qlk9xwBUvA_UK3HoJJz",
        funcion: "validar_usuario"
    };

    // Llama a una función SQL expuesta por la API REST de Supabase
    async function llamarRPC(nombre, parametros) {
        const respuesta = await fetch(CONFIG.url + "/rest/v1/rpc/" + nombre, {
            method: "POST",
            headers: {
                "apikey": CONFIG.key,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(parametros)
        });

        const datos = await respuesta.json().catch(function () { return null; });

        if (!respuesta.ok) {
            const detalle = (datos && (datos.message || datos.hint)) || ("HTTP " + respuesta.status);
            throw new Error(detalle);
        }
        return datos;
    }

    // Devuelve el usuario si existe, o null si no existe
    async function validarUsuario(correo, clave) {
        const filas = await llamarRPC(CONFIG.funcion, {
            p_correo: correo,
            p_clave: clave
        });
        return (filas && filas.length > 0) ? filas[0] : null;
    }

    return { validarUsuario: validarUsuario };
})();
