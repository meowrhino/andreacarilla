// components.js - Componentes reutilizables de la web

export function injectComponents() {
  // Botón "andrea carilla"
  const nav = document.createElement("nav");
  nav.id = "andrea-nav";
  nav.innerHTML = `
        <button id="open-andrea">andrea carilla</button>
    `;
  document.body.appendChild(nav);

  // Popup bio
  const popup = document.createElement("div");
  popup.id = "andrea-popup";
  popup.innerHTML = `
    <button class="close-btn" id="close-andrea">cerrar</button>
    <div class="andrea-content">
      <p>
        andrea es diseñadora gráfica que hace cosas con música, fotos y tipografía.
        también es dj y hace sesiones de música. hace portadas de discos, carteles,
        y diseño de imagen para artistas, así como dirección de arte para sesiones de
        fotos y videoclips.
      </p>
      <p>
        este espacio recoge algunos de los trabajos y proyectos que ha realizado en los últimos años.
      </p>
    </div>
  `;
  document.body.appendChild(popup);

  // Listeners popup
  document.getElementById("open-andrea").addEventListener("click", () => {
    popup.classList.add("open");
  });

  document.getElementById("close-andrea").addEventListener("click", () => {
    popup.classList.remove("open");
  });

  // Botón "home"
  const homeBtn = document.createElement("button");
  homeBtn.id = "home-btn";
  homeBtn.textContent = "home";
  homeBtn.addEventListener("click", () => {
    window.location.href = "./index.html";
  });
  document.body.appendChild(homeBtn);
}

// Extraer slug de la URL (?slug=xxx)
function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

// Renderizar página de proyecto genérico
export async function renderProject() {
  const slug = getSlugFromURL();
  
  if (!slug) {
    document.body.innerHTML = '<p style="padding: 2rem;">No se especificó ningún proyecto</p>';
    return;
  }
  
  try {
    const response = await fetch(`./data/${slug}/${slug}.json`);
    if (!response.ok) throw new Error(`No se pudo cargar ${slug}.json`);
    
    const projectData = await response.json();

    // Cargar categoría desde home.json
    let projectCategory = null;
    try {
      const homeResponse = await fetch('./data/home.json');
      if (homeResponse.ok) {
        const homeData = await homeResponse.json();
        const list = homeData.projectes_visibles || [];
        const entry = list.find(p => p.slug === slug || p.slug === projectData.slug);
        if (entry && entry.category) {
          projectCategory = entry.category;
        }
      }
    } catch (err) {
      console.warn('No se pudo cargar home.json para la categoría', err);
    }

    if (projectData.titulo) {
      document.title = projectData.titulo;
    } else if (projectData.slug) {
      document.title = projectData.slug;
    }

    const main = document.querySelector("main") || document.body;

    const wrapper = document.createElement("div");
    wrapper.className = "project-wrapper";
    main.appendChild(wrapper);

    const header = document.createElement("header");
    header.className = "project-header";
    wrapper.appendChild(header);

    const title = document.createElement("h1");
    title.textContent = projectData.titulo || projectData.slug || slug;
    header.appendChild(title);

    // Primera imagen
    if (projectData.primera_imatge) {
      const firstImgWrapper = document.createElement("div");
      firstImgWrapper.className = "project-first-image";

      const firstImg = document.createElement("img");
      firstImg.src = `./data/${projectData.slug}/${projectData.primera_imatge.src}`;
      firstImg.alt = projectData.primera_imatge.alt || "";
      firstImg.loading = "lazy";

      firstImgWrapper.appendChild(firstImg);
      wrapper.appendChild(firstImgWrapper);
    }

    const projectBody = document.createElement("section");
    projectBody.className = "project-body";
    wrapper.appendChild(projectBody);

    // Descripción
    if (projectData.descripcion && Array.isArray(projectData.descripcion.es)) {
      const desc = document.createElement("div");
      desc.className = "project-description";
      
      projectData.descripcion.es.forEach(paragraph => {
        if (paragraph.startsWith('<')) {
          desc.innerHTML += paragraph;
        } else {
          const p = document.createElement('p');
          p.innerHTML = paragraph;
          desc.appendChild(p);
        }
      });
      
      projectBody.appendChild(desc);
    }
    
    // Metadata
    const showMeta = projectData.configuracion?.mostrar_meta !== false;
    if (showMeta && (projectCategory || projectData.fecha || projectData.ubicacion || projectData.creditos)) {
      const meta = document.createElement('div');
      meta.className = 'project-meta';
      
      const ul = document.createElement('ul');
      
      // Categoría (desde home.json)
      if (projectCategory) {
        const li = document.createElement('li');
        li.textContent = projectCategory;
        ul.appendChild(li);
      }

      // Fecha
      if (projectData.fecha) {
        const li = document.createElement('li');
        li.innerHTML = `${projectData.fecha.mes} <span class="meta">${projectData.fecha.anio}</span>`;
        ul.appendChild(li);
      }
      
      // Ubicación
      if (projectData.ubicacion) {
        const li = document.createElement('li');
        li.textContent = projectData.ubicacion;
        ul.appendChild(li);
      }
      
      // Créditos
      if (projectData.creditos) {
        projectData.creditos.forEach(credito => {
          const li = document.createElement('li');
          
          if (credito.link) {
            li.innerHTML = `<a href="${credito.link}">${credito.nombre}</a>`;
          } else {
            li.textContent = credito.nombre;
          }
          
          if (credito.rol) {
            const span = document.createElement('span');
            span.className = 'meta';
            span.textContent = ` ${credito.rol}`;
            li.appendChild(span);
          }
          
          ul.appendChild(li);
        });
      }
      
      meta.appendChild(ul);
      projectBody.appendChild(meta);
    }
    
    // Galería de imágenes extra
    if (projectData.imatges && Array.isArray(projectData.imatges)) {
      const gallery = document.createElement('section');
      gallery.className = 'project-gallery';
      
      projectData.imatges.forEach((imgData, idx) => {
        const normalized = normalizeImageEntry(imgData);
        if (!normalized) return;
        const img = document.createElement('img');
        img.src = `./data/${projectData.slug}/${normalized.src}`;
        const titleText = projectData.titulo || projectData.slug || 'imagen';
        img.alt = `${titleText} imagen ${idx + 1}`;
        img.loading = 'lazy';
        
        gallery.appendChild(img);
      });
      
      projectBody.appendChild(gallery);
    }

  } catch (error) {
    console.error(error);
    document.body.innerHTML = '<p style="padding: 2rem;">Error cargando el proyecto</p>';
  }
}

// Normalizar entrada de imagen en imatges[] (string o objeto)
function normalizeImageEntry(entry) {
  if (typeof entry === 'string') {
    return { src: entry, alt: '' };
  }
  if (entry && typeof entry === 'object' && entry.src) {
    return { src: entry.src, alt: entry.alt || '' };
  }
  return null;
}
