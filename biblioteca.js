/* ============================================================
   biblioteca.js — Catálogo leído directamente desde Supabase
   Tabla: public.libros  (ver setup.sql)
   ============================================================ */

const estado = document.getElementById("estado");
const rejilla = document.getElementById("rejilla");
const campoBuscar = document.getElementById("buscar");
const selectorCategoria = document.getElementById("categoria");
const modal = document.getElementById("modal");

let sesion = null;
let libros = [];

function ponerEstado(texto, error) {
    estado.textContent = texto;
    estado.className = error ? "estado error" : "estado";
}

function escapar(texto) {
    return String(texto == null ? "" : texto)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function abrirLibro(libro) {
    document.getElementById("m-titulo").textContent = libro.titulo || "Sin título";
    document.getElementById("m-autor").textContent = libro.autor || "Autor desconocido";
    document.getElementById("m-descripcion").textContent = libro.descripcion || "Sin descripción.";
    document.getElementById("m-anio").textContent = libro.anio ? "Año: " + libro.anio : "";
    modal.classList.add("abierto");
}

function pintar() {
    const texto = campoBuscar.value.trim().toLowerCase();
    const categoria = selectorCategoria.value;

    const visibles = libros.filter(function (libro) {
        const coincideTexto = !texto ||
            String(libro.titulo || "").toLowerCase().includes(texto) ||
            String(libro.autor || "").toLowerCase().includes(texto);
        const coincideCategoria = !categoria || libro.categoria === categoria;
        return coincideTexto && coincideCategoria;
    });

    if (!visibles.length) {
        rejilla.innerHTML = '<div class="vacio">No hay libros que coincidan con la búsqueda.</div>';
        return;
    }

    rejilla.innerHTML = visibles.map(function (libro, indice) {
        return (
            '<article class="libro" data-indice="' + libros.indexOf(libro) + '">' +
                '<span class="categoria">' + escapar(libro.categoria || "General") + '</span>' +
                '<h2>' + escapar(libro.titulo) + '</h2>' +
                '<p class="autor">' + escapar(libro.autor) + '</p>' +
                '<p class="descripcion">' + escapar(libro.descripcion) + '</p>' +
                (libro.anio ? '<p class="anio">Año ' + escapar(libro.anio) + '</p>' : '') +
            '</article>'
        );
    }).join("");

    rejilla.querySelectorAll(".libro").forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            abrirLibro(libros[Number(tarjeta.dataset.indice)]);
        });
    });

    ponerEstado(visibles.length + " de " + libros.length + " libros · datos en vivo desde Supabase");
}

async function cargarLibros() {
    ponerEstado("Conectando con Supabase…");
    try {
        libros = await Supa.listar("libros", {
            columnas: "id,titulo,autor,categoria,descripcion,anio",
            ordenar: "titulo.asc"
        }, sesion.token);

        const categorias = Array.from(new Set(libros.map(function (l) { return l.categoria; }).filter(Boolean))).sort();
        selectorCategoria.innerHTML = '<option value="">Todas las categorías</option>' +
            categorias.map(function (c) { return '<option value="' + escapar(c) + '">' + escapar(c) + '</option>'; }).join("");

        if (!libros.length) {
            ponerEstado("La tabla 'libros' está vacía. Ejecuta setup.sql para cargar el catálogo de ejemplo.");
        }
        pintar();
    } catch (error) {
        rejilla.innerHTML = "";
        if (error.codigo === "PGRST205" || error.status === 404) {
            ponerEstado("La tabla 'libros' no existe en Supabase. Abre el SQL Editor y ejecuta setup.sql.", true);
        } else {
            ponerEstado("No se pudo leer la biblioteca: " + error.message, true);
        }
    }
}

(async function iniciar() {
    sesion = Supa.sesion.leer();
    if (!sesion || !sesion.email) {
        window.location.replace("login.html");
        return;
    }

    if (sesion.origen === "supabase" && sesion.token) {
        try {
            const usuario = await Supa.verificarToken(sesion.token);
            sesion.email = usuario.email || sesion.email;
        } catch (error) {
            Supa.sesion.borrar();
            window.location.replace("login.html");
            return;
        }
    }

    document.getElementById("usuario").textContent = "Conectado como " + sesion.email;

    campoBuscar.addEventListener("input", pintar);
    selectorCategoria.addEventListener("change", pintar);
    document.getElementById("m-cerrar").addEventListener("click", function () {
        modal.classList.remove("abierto");
    });
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) modal.classList.remove("abierto");
    });
    document.getElementById("btn-inicio").addEventListener("click", function () {
        window.location.href = "bienvenida.html";
    });
    document.getElementById("btn-salir").addEventListener("click", async function () {
        if (sesion.token) await Supa.cerrarSesion(sesion.token);
        Supa.sesion.borrar();
        window.location.href = "login.html";
    });

    await cargarLibros();
})();
