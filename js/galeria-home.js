/**
 * Archivo de referencia: funciones y fragmentos que controlan la galería de portada (home).
 * No está importado en la web: sirve como chuleta comentada de lo que hay en js/main.js.
 */

// ------------------------------------------------------------
// 1) Datos de entrada: sets de imágenes y estado activo
// Cada set es un array de imágenes con su ruta, estilos para desktop/móvil y URL de destino.
const gallerySets = [
  [
    {
      src: "_portada/1/1_1.jpg",
      desktopStyle: { top: 10, left: 5, index: 1, scale: 82 },
      mobileStyle: { top: 10, left: 5, index: 0, scale: 45 },
      url: "proyectos/ariezz/ariezz.html",
    },
    {
      src: "_portada/1/1_2.jpg",
      desktopStyle: { bottom: 10, left: 45, index: 2, scale: 45 },
      mobileStyle: { bottom: 0, left: 50, index: 1, scale: 20 },
      url: "proyectos/estrellaFugaz/estrellaFugaz.html",
    },
    {
      src: "_portada/1/1_3.jpg",
      desktopStyle: { top: 5, right: 25, index: 2, scale: 65 },
      mobileStyle: { top: 40, right: 5, index: 1, scale: 45 },
      url: "proyectos/diario/diario.html",
    },
    {
      src: "_portada/1/1_4.jpg",
      desktopStyle: { top: 25, right: 2, index: 1, scale: 55 },
      mobileStyle: { bottom: 5, left: 12, index: 0, scale: 35 },
      url: "proyectos/lostLetter/lostLetter.html",
    },
  ],
  [
    {
      src: "_portada/2/2_1.jpg",
      desktopStyle: { top: 30, left: 5, index: 2, scale: 45 },
      mobileStyle: { bottom: 0, left: 20, index: 0, scale: 25 },
      url: "proyectos/working/working.html",
    },
    {
      src: "_portada/2/2_2.jpg",
      desktopStyle: { bottom: 10, left: 15, index: 2, scale: 40 },
      mobileStyle: { bottom: 10, right: 10, index: 2, scale: 32 },
      url: "proyectos/waiting/waiting.html",
    },
    {
      src: "_portada/2/2_3.jpg",
      desktopStyle: { top: 5, left: 20, index: 1, scale: 65 },
      mobileStyle: { top: 45, left: 5, index: 1, scale: 25 },
      url: "proyectos/lostLetter/lostLetter.html",
    },
    {
      src: "_portada/2/2_4.jpg",
      desktopStyle: { bottom: 0, right: 5, index: 0, scale: 85 },
      mobileStyle: { top: 10, right: 5, index: 0, scale: 50 },
      url: "proyectos/magicalTheys/magicalTheys.html",
    },
  ],
  [
    {
      src: "_portada/3/3_1.jpg",
      desktopStyle: { top: 10, left: 10, index: 0, scale: 80 },
      mobileStyle: { top: 15, left: 5, index: 0, scale: 48 },
      url: "proyectos/8kito/8kito.html",
    },
    {
      src: "_portada/3/3_2.jpg",
      desktopStyle: { bottom: 10, right: 20, index: 1, scale: 65 },
      mobileStyle: { top: 50, right: 5, index: 0, scale: 35 },
      url: "proyectos/diario/diario.html",
    },
    {
      src: "_portada/3/3_3.jpg",
      desktopStyle: { top: 20, right: 10, index: 2, scale: 30 },
      mobileStyle: { bottom: 5, left: 20, index: 0, scale: 18 },
      url: "proyectos/stFrances/stFrances.html",
    },
  ],
];

// Índice del set seleccionado (se cambia al azar o con los botones de tema).
let selectedGallery = 0;

// ------------------------------------------------------------
// 2) Utilidad responsive: factor de escala según ancho de ventana
function computeResponsiveFactor() {
  const w = window.innerWidth;
  if (w < 375 && w >= 320) {
    const t = (375 - w) / (375 - 320);
    return 1 - t * 0.15; // reducción suave en móviles muy estrechos
  } else if (w >= 375 && w < 768) {
    const t = (w - 375) / (768 - 375);
    return 1 + t * 0.75; // aumento progresivo en móviles y tablets
  } else if (w >= 1000) {
    return 1 + ((w - 1000) / 800) * 0.4; // ligero boost en escritorio ancho
  }
  return 1; // ancho intermedio: sin cambios
}

// ------------------------------------------------------------
// 3) Render de la galería en #gallery-container
function renderGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return; // evita errores si se llama en páginas sin la galería

  container.innerHTML = "";
  const isMobile = window.innerWidth <= 768;
  const factor = computeResponsiveFactor();

  gallerySets[selectedGallery].forEach((item) => {
    const style = isMobile ? item.mobileStyle : item.desktopStyle;
    const baseScale = (style.scale || 100) / 1000; // escala base normalizada

    // Wrapper clicable que lleva al proyecto
    const wrapper = document.createElement("a");
    wrapper.className = "portada-wrapper";
    wrapper.href = item.url;
    wrapper.target = "_blank";
    wrapper.style.zIndex = style.index || 0;
    container.appendChild(wrapper);

    // Imagen en sí
    const img = document.createElement("img");
    img.src = item.src;
    img.className = "portada";
    wrapper.appendChild(img);

    // Ajusta ancho/alto y posición cuando la imagen ya conoce su tamaño natural
    function resizeWrapper() {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const widthPx = w * baseScale * factor;
      const heightPx = h * baseScale * factor;

      wrapper.style.width = `${widthPx}px`;
      wrapper.style.height = `${heightPx}px`;

      ["top", "left", "right", "bottom"].forEach((dir) => {
        if (style[dir] != null) wrapper.style[dir] = style[dir] + "%";
      });

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
    }

    // El cálculo se lanza en el load; si ya cargó, se fuerza de inmediato.
    img.addEventListener("load", resizeWrapper);
    if (img.complete) resizeWrapper();
  });
}

// ------------------------------------------------------------
// 4) Botones de tema (1, 2, 3...) que eligen el set activo
function setupTemaNav() {
  const nav = document.getElementById("tema-nav");
  if (!nav) return;

  gallerySets.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.textContent = idx + 1;
    btn.className = "tema-btn";
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#tema-nav .tema-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedGallery = idx;
      renderGallery();
    });
    nav.appendChild(btn);
  });
}

// ------------------------------------------------------------
// 5) Redimensionado: se vuelve a calcular galería (debounce 200 ms)
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onResize = debounce(() => {
  renderGallery();
}, 200);

// ------------------------------------------------------------
// 6) Inicialización (versión resumida de la de home en main.js)
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.pageType !== "home") return;

  setupTemaNav(); // crea los botones de sets

  // Selección aleatoria de set al entrar
  const temaBtns = document.querySelectorAll("#tema-nav .tema-btn");
  if (temaBtns.length > 0) {
    const rand = Math.floor(Math.random() * temaBtns.length);
    selectedGallery = rand;
    temaBtns[rand].classList.add("active");
  }

  renderGallery(); // pinta la galería inicial
});

// Manejo de redimensionado
window.addEventListener("resize", onResize);
