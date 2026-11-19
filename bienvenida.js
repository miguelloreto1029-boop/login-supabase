const usuario = sessionStorage.getItem("usuario");

// Si no hay sesión, volver al login
if (!usuario) {
    window.location.replace("login.html");
} else {
    const hora = new Date().getHours();
    let saludo = "Buenas noches";
    if (hora < 12) {
        saludo = "Buenos días";
    } else if (hora < 19) {
        saludo = "Buenas tardes";
    }

    document.getElementById("saludo").textContent = saludo;
    document.getElementById("usuario").textContent = usuario;
    document.getElementById("fecha").textContent = new Date().toLocaleDateString("es-CO", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    document.getElementById("btn-salir").addEventListener("click", function () {
        sessionStorage.clear();
        window.location.href = "login.html";
    });
}
