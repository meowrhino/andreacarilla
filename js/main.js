import { injectComponents } from "./components.js";

document.addEventListener("DOMContentLoaded", () => {
  injectComponents();

  const pageType = document.body.dataset.pageType;
  if (pageType === "proyecto") {
    activarCategoriaDesdeURL();

    // Convertir primer <li> en enlace a categoría
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
  } else if (pageType === "diario") {
    initDiario();
  }
});

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
      url: "#",
    },
    {
      src: "_portada/1/1_2.jpg",
      desktopStyle: { bottom: 10, left: 45, index: 2, scale: 45 },
      mobileStyle: { bottom: 0, left: 50, index: 1, scale: 20 },
      url: "#",
    },
    {
      src: "_portada/1/1_3.jpg",
      desktopStyle: { top: 5, right: 25, index: 2, scale: 65 },
      mobileStyle: { top: 40, right: 5, index: 1, scale: 45 },
      url: "#",
    },
    {
      src: "_portada/1/1_4.jpg",
      desktopStyle: { top: 25, right: 2, index: 1, scale: 55 },
      mobileStyle: { bottom: 5, left: 12, index: 0, scale: 35 },
      url: "#",
    },
  ],

  // SET 2
  [
    {
      src: "_portada/2/2_1.jpg",
      desktopStyle: { top: 30, left: 5, index: 2, scale: 45 },
      mobileStyle: { bottom: 0, left: 20, index: 0, scale: 25 },
      url: "#",
    },
    {
      src: "_portada/2/2_2.jpg",
      desktopStyle: { bottom: 10, left: 15, index: 1, scale: 40 },
      mobileStyle: { bottom: 10, right: 10, index: 2, scale: 32 },
      url: "#",
    },
    {
      src: "_portada/2/2_3.jpg",
      desktopStyle: { top: 5, left: 20, index: 1, scale: 65 },
      mobileStyle: { top: 45, left: 5, index: 1, scale: 25 },
      url: "#",
    },
    {
      src: "_portada/2/2_4.jpg",
      desktopStyle: { bottom: 0, right: 5, index: 0, scale: 85 },
      mobileStyle: { top: 10, right: 5, index: 0, scale: 50 },
      url: "#",
    },
  ],

  // SET 3
  [
    {
      src: "_portada/3/3_1.jpg",
      desktopStyle: { top: 10, left: 10, index: 0, scale: 80 },
      mobileStyle: { top: 15, left: 5, index: 0, scale: 48 },
      url: "#",
    },
    {
      src: "_portada/3/3_2.jpg",
      desktopStyle: { bottom: 10, right: 20, index: 1, scale: 65 },
      mobileStyle: { top: 50, right: 5, index: 0, scale: 35 },
      url: "#",
    },
    {
      src: "_portada/3/3_3.jpg",
      desktopStyle: { top: 20, right: 10, index: 2, scale: 30 },
      mobileStyle: { bottom: 5, left: 20, index: 0, scale: 18 },
      url: "#",
    },
  ],
];

let selectedGallery = 0;

// 2) Datos de proyectos: nombre, categoría, status (on/off), url
/*propuesta: y si cuando sean de otros artistas el titulo sale dentro y fuera solo se ve un numero romano que equivale al proyecto? en plan si hay 2 proyectos de hifas studio el primero en ingresar en el index sera el i y el 2o sera el ii y asi */
/*o sea es que queda raro como ese guion*/

const projects = [
  {
    name: "quien no corre vuela",
    category: "editorial",
    status: true,
    url: "#",
  },
  {
    name: "recogeteme el pelo",
    category: "investigación",
    status: true,
    url: "#",
  },
  { name: "aines", category: "artist image", status: true, url: "#" },
  { name: "testigodelpero", category: "artist image", status: true, url: "#" },
  { name: "st. frances", category: "artist image", status: true, url: "#" },
  {
    name: "8kito",
    category: "artist image",
    status: true,
    url: "proyectos/8kito/8kito.html",
  },
  { name: "ariezz", category: "artist image", status: true, url: "#" },
  { name: "estrella fugaz", category: "artist image", status: true, url: "#" },
  { name: "high tide", category: "fashion story", status: true, url: "#" },
  {
    name: "waiting the rain",
    category: "fashion story",
    status: true,
    url: "#",
  },
  {
    name: "working on the periphery",
    category: "fashion story",
    status: true,
    url: "#",
  },
  {
    name: "lost letter for a tale thief",
    category: "fashion story",
    status: true,
    url: "#",
  },
  { name: "spin-collection", category: "product", status: true, url: "#" },
  {
    name: "dear xx. are you mad at me?",
    category: "look book",
    status: true,
    url: "#",
  },
  { name: "diario", category: "personal", status: true, url: "#" },
  { name: "sangre y sal", category: "album design", status: true, url: "#" },
  { name: "magical theys", category: "artist image", status: true, url: "#" },
];

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
  const imgs = container.querySelectorAll(".portada");
  let loaded = 0;
  /*
            function check() {
                if (++loaded === imgs.length) añadirLabelsDebug();
            }
            imgs.forEach(i => i.complete ? check() : i.onload = check);
            */
}

// Render project links
function renderProjects() {
  const linksContainer = document.getElementById("links-container");
  linksContainer.innerHTML = "";
  const isMobile = window.innerWidth <= 768;
  const active = projects.filter((p) => p.status);
  shuffle(active);

  // 🔸 PASO 1: recoger las categorías seleccionadas
  const selectedCategories = Array.from(
    document.querySelectorAll("#category-nav .category-btn.active")
  ).map((b) => b.textContent.trim());

  active.forEach((p) => {
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

//4. funciones de UI:
// Setup theme buttons and gallery initialization
function setupTemaNav() {
  const nav = document.getElementById("tema-nav");
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

function setupCategoryNav() {
  const nav = document.getElementById("category-nav");
  const sel = new Set();
  Array.from(new Set(projects.map((p) => p.category))).forEach((cat) => {
    const b = document.createElement("button");
    b.textContent = cat;
    b.className = "category-btn";
    b.addEventListener("click", () => {
      b.classList.toggle("active");
      if (b.classList.contains("active")) sel.add(cat);
      else sel.delete(cat);
      document
        .querySelectorAll("#links-container .project-link")
        .forEach((link) => {
          const name = link.querySelector("a").textContent.trim();
          const catOf = projects.find((p) => p.name === name).category;
          link.style.display =
            sel.size === 0 || sel.has(catOf) ? "block" : "none";
        });
    });
    nav.appendChild(b);
  });
}

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

//5. manejador de redimensionado
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
  // 6.1 Configurar la navegación de temas
  setupTemaNav();

  // 6.2 Selección aleatoria de tema al cargar
  const btns = document.querySelectorAll("#tema-nav .tema-btn");
  const rand = Math.floor(Math.random() * btns.length);
  selectedGallery = rand;
  btns[rand].classList.add("active");

  // 6.3 Renderizado inicial de galería y proyectos
  renderGallery();
  renderProjects();

  // 6.4 Configurar filtros y popup
  setupCategoryNav();
  setupAndreaPopup();

  // 6.5 Forzar que todos los <a> abran en nueva pestaña
  document.querySelectorAll("a").forEach((a) => (a.target = "_blank"));
});
