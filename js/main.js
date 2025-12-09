import { injectComponents, renderProject } from "./components.js";

// Detectar si estamos en página de proyecto
const pageType = document.body.dataset.pageType;

if (pageType === "proyecto" || pageType === "diario") {
  // Página de proyecto individual
  renderProject().then(() => {
    injectComponents();
  });
} else if (pageType === "home") {
  // Página home
  initHome();
}

// ============================================================================
// CÓDIGO HOME
// ============================================================================

async function initHome() {
  injectComponents();
  
  // Cargar home.json
  const homeData = await fetch('data/home.json').then(r => r.json());
  
  // Datos de proyectos leídos desde home.json
  const projects = (homeData.projectes_visibles || [])
    .filter((p) => p.visible !== false)
    .map((p) => ({
      name: p.name || p.slug,
      category: p.category || "otros",
      status: true,
      url: p.slug,
    }));
  
  // Datos de galería leídos desde home.json
  const gallerySets = Array.isArray(homeData.gallerySets) ? homeData.gallerySets : [];
  const activeCategories = new Set();
  let selectedGallery = 0;

  // Utilidades
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function computeResponsiveFactor() {
    const w = window.innerWidth;
    if (w < 375 && w >= 320) {
      const t = (375 - w) / (375 - 320);
      return 1 - t * 0.15;
    } else if (w >= 375 && w < 768) {
      const t = (w - 375) / (768 - 375);
      return 1 + t * 0.75;
    } else if (w >= 1000) {
      return 1 + ((w - 1000) / 800) * 0.4;
    }
    return 1;
  }

  // Renderizar galería usando tamaños naturales de imagen
  function renderGallery() {
    const container = document.getElementById("gallery-container");
    if (!container || !gallerySets[selectedGallery]) return;
    container.innerHTML = "";
    const isMobile = window.innerWidth <= 768;
    const factor = computeResponsiveFactor();

    gallerySets[selectedGallery].forEach((item) => {
      const style = isMobile ? item.mobileStyle : item.desktopStyle;
      const baseScale = (style?.scale || 100) / 1000;

      const wrapper = document.createElement("a");
      wrapper.className = "portada-wrapper";
      const slug = item.slug || item.url;
      wrapper.href = `./proyecto.html?slug=${slug}`;
      wrapper.style.zIndex = style?.index || 0;
      container.appendChild(wrapper);

      const img = document.createElement("img");
      img.className = "portada";
      img.src = item.src;
      img.alt = "";
      wrapper.appendChild(img);

      function resizeWrapper() {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;

        const widthPx = w * baseScale * factor;
        const heightPx = h * baseScale * factor;

        wrapper.style.width = `${widthPx}px`;
        wrapper.style.height = `${heightPx}px`;

        ["top", "left", "right", "bottom"].forEach((dir) => {
          if (style && style[dir] != null) wrapper.style[dir] = style[dir] + "%";
        });

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
      }

      img.addEventListener("load", resizeWrapper);
      if (img.complete) resizeWrapper();
    });
  }

  // Renderizar proyectos
  function renderProjects() {
    const container = document.getElementById("links-container");
    if (!container) return;
    container.innerHTML = "";

    const activeProjects = projects.filter((p) => p.status);
    shuffle(activeProjects);

    activeProjects.forEach((project) => {
      const link = document.createElement("a");
      link.href = `./proyecto.html?slug=${project.url}`;
      link.className = "project-link";
      link.textContent = project.name;
      container.appendChild(link);

      // Colocar cada enlace en una posición aleatoria dentro del contenedor usando el tamaño real
      const maxTopPx = Math.max(0, container.clientHeight - link.offsetHeight);
      const maxLeftPx = Math.max(0, container.clientWidth - link.offsetWidth);
      const top = Math.random() * (maxTopPx || 1);
      const left = Math.random() * (maxLeftPx || 1);
      link.style.top = `${top}px`;
      link.style.left = `${left}px`;
    });
  }

  function applyCategoryFilter() {
    if (activeCategories.size === 0) {
      projects.forEach((p) => (p.status = true));
    } else {
      projects.forEach((p) => (p.status = activeCategories.has(p.category)));
    }
    renderProjects();
  }

  // Renderizar navegación de categorías
  function renderCategoryNav() {
    const nav = document.getElementById("category-nav");
    if (!nav) return;
    nav.innerHTML = "";

    const categories = [...new Set(projects.map((p) => p.category))];
    categories.sort();

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        if (activeCategories.has(cat)) {
          activeCategories.delete(cat);
          btn.classList.remove("active");
        } else {
          activeCategories.add(cat);
          btn.classList.add("active");
        }
        applyCategoryFilter();
      });
      nav.appendChild(btn);
    });
  }

  // Renderizar navegación de temas (galerías)
  function renderTemaNav() {
    const nav = document.getElementById("tema-nav");
    if (!nav) return;

    nav.innerHTML = "";
    for (let i = 0; i < gallerySets.length; i++) {
      const btn = document.createElement("button");
      btn.className = "tema-btn" + (i === selectedGallery ? " active" : "");
      btn.textContent = (i + 1).toString();
      btn.addEventListener("click", () => {
        selectedGallery = i;
        document.querySelectorAll(".tema-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderGallery();
      });
      nav.appendChild(btn);
    }
  }

  // Botón shuffle
  const shuffleBtn = document.getElementById("shuffle-btn");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      renderProjects();
    });
  }

  // Seleccionar galería inicial al azar si hay sets
  if (gallerySets.length > 0) {
    selectedGallery = Math.floor(Math.random() * gallerySets.length);
  }

  // Inicializar
  renderGallery();
  renderProjects();
  renderCategoryNav();
  renderTemaNav();

  // Responsive
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const onResize = debounce(() => renderGallery(), 200);
  window.addEventListener("resize", onResize);
}
