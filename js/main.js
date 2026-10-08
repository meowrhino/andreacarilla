// main.js - se carga en todas las paginas
//
// El contenido ya viene escrito en el HTML (lo genera build.js). Aqui solo:
//   - abrir y cerrar el popup "andrea carilla"
//   - en la home, cargar home.js (galeria, enlaces y filtros)

const openBtn = document.getElementById("open-andrea");
const closeBtn = document.getElementById("close-andrea");
const popup = document.getElementById("andrea-popup");

function setPopup(open) {
  popup.classList.toggle("visible", open);
  openBtn.setAttribute("aria-expanded", String(open));
  // El foco va al popup al abrir y vuelve al boton al cerrar (teclado y lectores)
  (open ? closeBtn : openBtn).focus();
}

if (openBtn && closeBtn && popup) {
  openBtn.addEventListener("click", () => setPopup(true));
  closeBtn.addEventListener("click", () => setPopup(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("visible")) setPopup(false);
  });
}

if (document.body.dataset.pageType === "home") import("./home.js");
