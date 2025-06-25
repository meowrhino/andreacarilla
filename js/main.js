import {
  injectComponents,
  populateProjectGallery,
  initDiarioGallery,
} from "./components.js";

// 1. Datos de entrada
// 1) Datos de los 3 sets de galería (rellena con tus rutas y estilos exactos)
/*issue 2: las imagenes estaran en la carpeta _portada/[númeroDelSet]/[nombreDeLaImagen]*/
/*las imágenes podrian aprovechar el label para coplocarlas y tener titulos que expliquen su historia*/

const shuffleBtn = document.getElementById("shuffle-btn");
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    renderProjects();
  });
}

const gallerySets = [
  // SET 1
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

  // SET 2
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

  // SET 3
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

let selectedGallery = 0;

// 2) Datos de proyectos: nombre, categoría, status (on/off), url
/* propuesta: y si cuando sean de otros artistas el título sale dentro y fuera solo se ve un número romano que equivale al proyecto?
Ej. si hay 2 proyectos de “hifas studio”, el primero en ingresar en el index será “I” y el 2º será “II” */

const projects = [
  {
    name: "sangre y sal",
    category: "album design",
    status: true,
    url: "proyectos/sangreYSal/sangreYSal.html",
  },
  {
    name: "alejandra grillo",
    category: "artist image",
    status: true,
    url: "proyectos/testigoDelPero/testigoDelPero.html",
  },
  {
    name: "aines",
    category: "artist image",
    status: true,
    url: "proyectos/aines/aines.html",
  },
  {
    name: "st. frances",
    category: "artist image",
    status: true,
    url: "proyectos/stFrances/stFrances.html",
  },
  {
    name: "8kito",
    category: "artist image",
    status: true,
    url: "proyectos/8kito/8kito.html",
  },
  {
    name: "ariezz",
    category: "artist image",
    status: true,
    url: "proyectos/ariezz/ariezz.html",
  },
  {
    name: "ali arévalo",
    category: "artist image",
    status: true,
    url: "proyectos/magicalTheys/magicalTheys.html",
  },
  {
    name: "ela rea",
    category: "artist image",
    status: true,
    url: "proyectos/estrellaFugaz/estrellaFugaz.html",
  },
  {
    name: "quien no corre vuela",
    category: "editorial",
    status: true,
    url: "proyectos/quienNoCorre/quienNoCorre.html",
  },
  {
    name: "archivo en pixel",
    category: "editorial",
    status: true,
    url: "proyectos/arcEnPix/arcEnPix.html",
  },
  {
    name: "black cover",
    category: "editorial",
    status: true,
    url: "proyectos/blackCover/blackCover.html",
  },
  {
    name: "performance jaume ferrete",
    category: "eventos",
    status: true,
    url: "proyectos/vozMal/vozMal.html",
  },
  {
    name: "flea market",
    category: "eventos",
    status: true,
    url: "proyectos/fleaMarket/fleaMarket.html",
  },
  {
    name: "tawla cenitas club",
    category: "eventos",
    status: true,
    url: "proyectos/tawla/tawla.html",
  },
    {
    name: "henshin concert",
    category: "eventos",
    status: true,
    url: "proyectos/henshin/henshin.html",
  },
  {
    name: "high tide",
    category: "fashion story",
    status: true,
    url: "proyectos/highTide/highTide.html",
  },
  {
    name: "waiting the rain",
    category: "fashion story",
    status: true,
    url: "proyectos/waiting/waiting.html",
  },
  {
    name: "working on the periphery",
    category: "fashion story",
    status: true,
    url: "proyectos/working/working.html",
  },
  {
    name: "lost letter for a tale thief",
    category: "fashion story",
    status: true,
    url: "proyectos/lostLetter/lostLetter.html",
  },
  {
    name: "recogeteme el pelo",
    category: "investigación",
    status: true,
    url: "proyectos/recogeteme/recogeteme.html",
  },
  {
    name: "dear xx. are you mad at me?",
    category: "look book",
    status: true,
    url: "proyectos/dearxx/dearxx.html",
  },
  {
    name: "diario",
    category: "personal",
    status: true,
    url: "proyectos/diario/diario.html",
  },
  {
    name: "spin-collection",
    category: "product",
    status: true,
    url: "proyectos/spinCol/spinCol.html",
  },
  {
    name: "one by one",
    category: "fashion story",
    status: true,
    url: "proyectos/oneByOne/oneByOne.html",
  },
];

// -----------------------------------------------------------------------------
// 2. Utilidades
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Calcula un factor de escala global según el ancho de la ventana.
 * - Menor que 375px: reduce hasta un 15%
 * - Entre 375px y 768px: amplía hasta un 75%
 * - A partir de 1000px: amplía ligeramente según excedente
 * - Resto de casos: factor 1 (sin cambio)
 */
function computeResponsiveFactor() {
  const w = window.innerWidth;

  // Pantallas muy estrechas (320–374px): ligera reducción
  if (w < 375 && w >= 320) {
    const t = (375 - w) / (375 - 320);
    return 1 - t * 0.15;
  }
  // Pantallas pequeñas / tablets (375–767px): incremento progresivo
  else if (w >= 375 && w < 768) {
    const t = (w - 375) / (768 - 375);
    return 1 + t * 0.75;
  }
  // Pantallas muy anchas (1000px+): ligero aumento según excedente
  else if (w >= 1000) {
    return 1 + ((w - 1000) / 800) * 0.4;
  }
  // Resto de casos (768–999px): sin cambio
  return 1;
}

/*
        function añadirLabelsDebug() {
            // limpia los anteriores
            document.querySelectorAll('.debug-label').forEach(e => e.remove());

            document.querySelectorAll('.portada').forEach(img => {
                const rect = img.getBoundingClientRect();
                const label = document.createElement('div');
                label.className = 'debug-label';
                label.textContent = img.src.split('/').pop();

                // posición absoluta respecto al viewport
                label.style.position = 'absolute';
                label.style.left = rect.left + window.scrollX + 'px';
                label.style.top = (rect.top + window.scrollY - 16) + 'px';

                //estilo de cajita
                label.style.background = 'white';
                label.style.fontSize = '10px';
                label.style.padding = '2px 4px';
                label.style.zIndex = '4';
                label.style.pointerEvents = 'none';

                //auinque dice que lo cambie por este:
                document.body.appendChild(label);

                //document.getElementById('gallery-container').appendChild(label);
                //img.parentNode.appendChild(label);
                //no nos gustan las de abajo: las de arriba son mejores, pero no las hemos probado
                //wrapper.appendChild(label);
                //document.body.appendChild(label);
            });
        }
*/

// 3. funciones de renderizado
// Clear and render the selected gallery
function renderGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return; // ← bloquea la función si el contenedor no existe
  container.innerHTML = "";
  const isMobile = window.innerWidth <= 768;
  const factor = computeResponsiveFactor();

  gallerySets[selectedGallery].forEach((item) => {
    const style = isMobile ? item.mobileStyle : item.desktopStyle;
    const baseScale = (style.scale || 100) / 1000;

    // 1) crear wrapper
    const wrapper = document.createElement("a");
    wrapper.className = "portada-wrapper";
    wrapper.href = item.url;
    wrapper.target = "_blank";
    wrapper.style.zIndex = style.index || 0;
    container.appendChild(wrapper);

    // 2) crear la imagen
    const img = document.createElement("img");
    img.src = item.src;
    img.className = "portada";
    wrapper.appendChild(img);

    // 3) definir un handler reutilizable
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

    // 4) asignar el handler y forzarlo si ya está cargada
    img.addEventListener("load", resizeWrapper);
    if (img.complete) resizeWrapper();
  });

  // 4. (Opcional) Debug: etiquetas con nombre de archivo
  // const imgs = container.querySelectorAll(".portada");
  // let loaded = 0;
  // function check() {
  //   if (++loaded === imgs.length) añadirLabelsDebug();
  // }
  // imgs.forEach(i => i.complete ? check() : i.onload = check);
}

// Render project links
function renderProjects() {
  const linksContainer = document.getElementById("links-container");
  if (!linksContainer) return; // ← evita el error si no existe

  linksContainer.innerHTML = "";
  const isMobile = window.innerWidth <= 768;
  const activeProjects = projects.filter((p) => p.status);
  shuffle(activeProjects);

  // 🔸 PASO 1: recoger las categorías seleccionadas
  const selectedCategories = Array.from(
    document.querySelectorAll("#category-nav .category-btn.active")
  ).map((b) => b.textContent.trim());

  activeProjects.forEach((p) => {
    const wrapper = document.createElement("div");
    wrapper.className = "project-link";
    wrapper.style.position = "absolute";

    const a = document.createElement("a");
    a.href = p.url;
    a.textContent = p.name;
    wrapper.appendChild(a);
    linksContainer.appendChild(wrapper);

    // Posicionamiento aleatorio dentro del contenedor
    const contRect = linksContainer.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();
    const maxTop = contRect.height - wrapRect.height;
    const maxLeft = contRect.width - wrapRect.width;

    wrapper.style.top = Math.random() * Math.max(0, maxTop) + "px";
    wrapper.style.left = Math.random() * Math.max(0, maxLeft) + "px";

    // 🔸 PASO 2: ocultar si no está en las categorías seleccionadas (si hay alguna)
    const isVisible =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);
    wrapper.style.display = isVisible ? "block" : "none";
  });
}

// -----------------------------------------------------------------------------
// 4. Funciones de UI

// Setup theme buttons y galería
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

// Setup category buttons
function setupCategoryNav() {
  const nav = document.getElementById("category-nav");
  if (!nav) return; // ← si no hay nav, no hacemos nada

  // Obtenemos la lista única de categorías de todos los proyectos
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  categories.forEach((cat) => {
    const b = document.createElement("button");
    b.textContent = cat;
    b.className = "category-btn";
    b.addEventListener("click", () => {
      // Alternar la clase "active" en el botón
      b.classList.toggle("active");
      // Luego, volver a renderizar todos los proyectos según botones activos
      renderProjects();
    });
    nav.appendChild(b);
  });
}

// Activar botón de categoría según URL (?category=...)
function activarCategoriaDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("category");
  if (!categoria) return;

  const btns = document.querySelectorAll("#category-nav .category-btn");
  btns.forEach((btn) => {
    if (btn.textContent.trim().toLowerCase() === categoria.toLowerCase()) {
      btn.classList.add("active");
    }
  });
}

// Setup popup “Andrea”
function setupAndreaPopup() {
  const openBtn = document.getElementById("open-andrea");
  const closeBtn = document.getElementById("close-andrea");
  const popup = document.getElementById("andrea-popup");
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "flex";
  });
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "none";
  });
}

// -----------------------------------------------------------------------------
// 5. Manejador de redimensionado
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onResize = debounce(() => {
  renderGallery();
  renderProjects();
}, 200);

// 5. manejador de redimensionado
window.addEventListener("resize", onResize);

// Debounced resize handler
/*
        window.addEventListener('resize', (() => {
            let timeout;
            return () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    renderGallery();
                    renderProjects();
                }, 200);
            };
        })());
        */

// 6. Inicialización al cargar el DOM

document.addEventListener("DOMContentLoaded", () => {
  // 6.0 Inyectar los componentes “Andrea” en todas las páginas

  injectComponents();

  const pageType = document.body.dataset.pageType;
  if (pageType === "proyecto") {
    // Si estamos en página de proyecto, convertir el primer <li> en enlace con filtro
    activarCategoriaDesdeURL();

    const metaList = document.querySelector(".project-meta ul");
    if (metaList) {
      const firstItem = metaList.querySelector("li");
      if (firstItem) {
        const category = firstItem.textContent.trim();
        const encodedCategory = encodeURIComponent(category.toLowerCase());

        const link = document.createElement("a");
        link.href = `/index.html?category=${encodedCategory}`;
        link.textContent = category;

        firstItem.textContent = ""; // vaciar contenido
        firstItem.appendChild(link);
      }
    }
    // 6.2 *** AÑADIMOS AQUÍ la función para rellenar la galería ***
    populateProjectGallery();
  } else if (pageType === "diario") {
    initDiarioGallery();
  } else if (pageType === "home") {
    // 6.1 Configurar la navegación de temas (solo en home)
    setupTemaNav();

    // 6.2 Selección aleatoria de tema al cargar (solo en home)
    const temaBtns = document.querySelectorAll("#tema-nav .tema-btn");
    if (temaBtns.length > 0) {
      const rand = Math.floor(Math.random() * temaBtns.length);
      selectedGallery = rand;
      temaBtns[rand].classList.add("active");
    }

    // 6.3 Configurar filtros (crear botones de categoría)
    setupCategoryNav();

    // 6.4 Activar categoría que venga en la URL (si existe ?category=)
    activarCategoriaDesdeURL();

    // 6.5 Renderizar proyectos según filtro activado
    renderProjects();

    // 6.6 Renderizar galería (solo en home)
    renderGallery();

    // 6.7 Configurar popup “Andrea” y forzar que <a> abra en nueva pestaña
    document.querySelectorAll("a").forEach((a) => (a.target = "_blank"));
  }
});

document.querySelectorAll("a").forEach((a) => {
  a.setAttribute("target", "_blank");
  a.setAttribute("rel", "noopener noreferrer");
});
