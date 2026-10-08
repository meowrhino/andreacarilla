// home.js - galeria de portadas, enlaces a proyectos y filtros de la home
//
// Los enlaces ya estan en el HTML (los escribe build.js con su data-category);
// aqui solo se reparten por la pantalla y se filtran. La galeria se monta con
// los gallerySets de data/home.json. En local (Live Server) los enlaces se
// rehacen tambien desde home.json, para ver los cambios sin el build.

const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const linksContainer = document.getElementById("links-container");
let links = [...linksContainer.querySelectorAll(".project-link")];
const galleryContainer = document.getElementById("gallery-container");

const activeCategories = new Set();
let gallerySets = [];
let selectedGallery = 0;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const isMobile = () => window.innerWidth <= 768;

// Las portadas crecen o encogen un poco segun el ancho de pantalla
function responsiveFactor() {
  const w = window.innerWidth;
  if (w >= 320 && w < 375) return 1 - ((375 - w) / 55) * 0.15;
  if (w >= 375 && w < 768) return 1 + ((w - 375) / 393) * 0.75;
  if (w >= 1000) return 1 + ((w - 1000) / 800) * 0.4;
  return 1;
}

// Medidas de las portadas que build.js deja en el <head>: permiten colocar
// cada portada antes de que cargue, sin esperar a naturalWidth
const imageSizes = (() => {
  try {
    return JSON.parse(document.getElementById("img-sizes")?.textContent || "{}");
  } catch {
    return {};
  }
})();

// ---------------------------------------------------------------------------
// Enlaces a proyectos
// ---------------------------------------------------------------------------

// Reparte los enlaces visibles en posiciones aleatorias sin que se pisen.
// Si tras 50 intentos un enlace no cabe, la zona crece hacia abajo (scroll).
function scatterLinks() {
  const visible = links.filter((link) => {
    const show = activeCategories.size === 0 || activeCategories.has(link.dataset.category);
    link.hidden = !show;
    return show;
  });

  const placed = [];
  let areaHeight = linksContainer.clientHeight;

  shuffle(visible).forEach((link, index) => {
    // Volver a meterlo en el DOM reinicia la animacion de entrada (y el orden
    // del tabulador sigue al barajado)
    link.style.top = link.style.left = "";
    linksContainer.append(link);
    link.style.animationDelay = `${index * 30}ms`; // aparecen uno tras otro

    const { width: w, height: h } = link.getBoundingClientRect();
    let pos = null;
    for (let i = 1; !pos; i++) {
      // -1px: pegado al borde derecho el texto se parte por redondeo y crece
      const left = Math.random() * Math.max(0, linksContainer.clientWidth - w - 1);
      const top = Math.random() * Math.max(0, areaHeight - h);
      const overlaps = placed.some(
        (r) => left < r.left + r.w && r.left < left + w && top < r.top + r.h && r.top < top + h
      );
      if (!overlaps) pos = { left, top };
      else if (i % 50 === 0) areaHeight += h;
    }
    placed.push({ ...pos, w, h });
    link.style.top = `${pos.top}px`;
    link.style.left = `${pos.left}px`;
  });
}

// Botones de categoria: se pueden activar varios a la vez; ninguno = todos
function renderCategoryNav() {
  const nav = document.getElementById("category-nav");
  const categories = [...new Set(links.map((link) => link.dataset.category))].sort();

  nav.replaceChildren(
    ...categories.map((cat) => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.textContent = cat;
      const sync = () => {
        btn.classList.toggle("active", activeCategories.has(cat));
        btn.setAttribute("aria-pressed", String(activeCategories.has(cat)));
      };
      sync();
      btn.addEventListener("click", () => {
        if (activeCategories.has(cat)) activeCategories.delete(cat);
        else activeCategories.add(cat);
        sync();
        scatterLinks();
      });
      return btn;
    })
  );
}

// ---------------------------------------------------------------------------
// Galeria de portadas
// ---------------------------------------------------------------------------

function renderGallery() {
  const set = gallerySets[selectedGallery];
  if (!set) return;

  const mobile = isMobile();
  const factor = responsiveFactor();
  const nameBySlug = new Map(links.map((link) => [link.pathname.split("/").filter(Boolean).pop(), link.textContent]));

  galleryContainer.replaceChildren(
    ...set.map((item) => {
      // Posicion, capa y escala de cada portada, distintas en movil y escritorio
      const style = (mobile ? item.mobileStyle : item.desktopStyle) || {};
      const scale = ((style.scale || 100) / 1000) * factor;
      const slug = item.slug || item.url;

      const wrapper = document.createElement("a");
      wrapper.className = "portada-wrapper";
      wrapper.href = `./proyectos/${slug}/`;
      wrapper.style.zIndex = style.index || 0;
      for (const dir of ["top", "left", "right", "bottom"]) {
        if (style[dir] != null) wrapper.style[dir] = `${style[dir]}%`;
      }

      const img = document.createElement("img");
      img.className = "portada";
      img.src = item.src;
      img.alt = item.alt?.trim() || `Portada del proyecto ${nameBySlug.get(slug) || slug}`;
      wrapper.append(img);

      const resize = () => {
        const [w, h] = img.naturalWidth ? [img.naturalWidth, img.naturalHeight] : imageSizes[item.src] || [];
        if (!w || !h) return;
        wrapper.style.width = `${w * scale}px`;
        wrapper.style.height = `${h * scale}px`;
      };
      resize();
      img.addEventListener("load", () => {
        resize();
        img.classList.add("is-loaded"); // fundido de entrada (css)
      });
      img.addEventListener("error", () => console.error(`[home] no se pudo cargar la portada ${item.src}`));
      return wrapper;
    })
  );
}

// Botones 1, 2, 3... para cambiar de galeria
function renderTemaNav() {
  const nav = document.getElementById("tema-nav");
  const buttons = gallerySets.map((_, i) => {
    const btn = document.createElement("button");
    btn.className = "tema-btn";
    btn.textContent = String(i + 1);
    btn.setAttribute("aria-label", `galería ${i + 1}`);
    btn.addEventListener("click", () => {
      selectedGallery = i;
      sync();
      renderGallery();
    });
    return btn;
  });
  const sync = () =>
    buttons.forEach((btn, i) => {
      btn.classList.toggle("active", i === selectedGallery);
      btn.setAttribute("aria-pressed", String(i === selectedGallery));
    });
  sync();
  nav.replaceChildren(...buttons);
}

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

// ?categoria=eventos llega desde los enlaces de categoria de cada proyecto
const initialCategory = new URLSearchParams(location.search).get("categoria");
if (links.some((link) => link.dataset.category === initialCategory)) activeCategories.add(initialCategory);

renderCategoryNav();
scatterLinks();
document.getElementById("shuffle-btn").addEventListener("click", scatterLinks);

try {
  const response = await fetch("data/home.json", isLocal ? { cache: "no-store" } : {});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const home = await response.json();
  gallerySets = home.gallerySets || [];

  if (isLocal) {
    const { previewHomeLinks } = await import("./vista-previa.js");
    previewHomeLinks(home, linksContainer);
    links = [...linksContainer.querySelectorAll(".project-link")];
    renderCategoryNav();
    scatterLinks();
  }
} catch (error) {
  console.error("[home] no se pudo cargar data/home.json:", error);
}
selectedGallery = Math.floor(Math.random() * gallerySets.length);
renderTemaNav();
renderGallery();

// Solo si cambia el ancho: en movil, al hacer scroll la barra del navegador
// aparece y desaparece, salta "resize" y los enlaces se movian solos
let lastWidth = window.innerWidth;
window.addEventListener(
  "resize",
  debounce(() => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    renderGallery();
    scatterLinks();
  }, 200)
);
