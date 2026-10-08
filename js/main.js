// main.js - se carga en todas las paginas
//
// El contenido ya viene escrito en el HTML (lo genera build.js). Aqui solo:
//   - abrir y cerrar el popup "andrea carilla"
//   - en la home, cargar home.js (galeria, enlaces y filtros)
//   - en local (Live Server), repintar el proyecto desde su json para ver los
//     cambios sin ejecutar el build (vista-previa.js)

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

const pageType = document.body.dataset.pageType;
const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

if (pageType === "home") {
  import("./home.js");
} else if (pageType === "proyecto" && isLocal) {
  // proyecto.html?slug=x tambien vale en local, para proyectos aun sin generar
  const slug = document.body.dataset.slug || new URLSearchParams(location.search).get("slug");
  if (slug) import("./vista-previa.js").then(({ previewProject }) => previewProject(slug));
}
