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
    <div class="content">
        <p>Graduada en Comunicación Audiovisual por la Universidad de Granada en 2019, su práctica fotográfica se
            articula entre la moda, el diario personal y la fotografía robada, tensionando los límites entre lo
            documental y lo construido. </p>
        <p>​​Es cofundadora de la editorial de autoedición <a
            href="https://quiennocorrevuela.bigcartel.com/" target="_blank" rel="noopener noreferrer">Quien no corre, vuela</a>, desde donde ha publicado
            <i>archivo en pixel</i> y <i>no time left for square</i>, investigando nuevas formas de narrar, publicar y distribuir
            fotografía contemporánea desde los márgenes.</p>
        <p>Su trabajo se construye desde la serialidad y la repetición: las imágenes no funcionan de forma aislada,
            sino que se organizan como fragmentos de una narrativa abierta. Dispara desde el impulso y el error, con
            una cámara que no busca certezas ni discursos cerrados, sino que reacciona ante lo que hiere, incomoda o
            emociona. Una mirada crítica, permeable y radicalmente encarnada en lo cotidiano.</p>
        <div class="footer">
            <a href="mailto:carillagonzalezandrea@gmail.com">carillagonzalezandrea@gmail.com</a>
            <a href="https://www.instagram.com/andreacarilla/" target="_blank" rel="noopener noreferrer">@andreacarilla</a>
            <span style="position:absolute; bottom:1rem;">
                web: <a href="https://meowrhino.github.io/becasDigMeow/" target="_blank" rel="noopener noreferrer">meowrhino</a>
            </span>
        </div>
    </div>
`;
  document.body.appendChild(popup);

  // Botón "home"
  if (document.body.dataset.pageType !== "home") {
    const homeBtn = document.createElement("button");
    homeBtn.className = "home-button";
    homeBtn.textContent = "home";
    homeBtn.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
    document.body.appendChild(homeBtn);
  }

  // Eventos de abrir/cerrar
  setTimeout(() => {
    const open = document.getElementById("open-andrea");
    const close = document.getElementById("close-andrea");
    const popup = document.getElementById("andrea-popup");
    if (!open || !close || !popup) return;

    open.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.add("visible");
    });

    close.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.remove("visible");
    });
  }, 0);
}

export function normalizeCategory(value) {
  if (!value) return '';
  const normalized = value.trim().replace(/\s+/g, ' ').toLowerCase();
  const aliases = {
    evento: 'eventos',
    producto: 'product',
    investigacion: 'investigación',
  };
  return aliases[normalized] || normalized;
}

function getProjectTitle(projectData, fallback = 'proyecto') {
  return projectData?.titulo || projectData?.slug || fallback;
}

function appendVisuallyHiddenTitle(container, title) {
  if (!title) return;
  const h1 = document.createElement('h1');
  h1.className = 'visually-hidden';
  h1.textContent = title;
  container.appendChild(h1);
}

function createExternalLink(href, text) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function ensureExternalRel(container) {
  container.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
    anchor.rel = 'noopener noreferrer';
  });
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, '');
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3).trimEnd() + '...';
}

function setMetaTag(attr, key, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkTag(rel, href) {
  if (!href) return;
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function applyMeta({ title, description, url, imageUrl, type }) {
  if (title) document.title = title;

  setMetaTag('name', 'description', description);
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:type', type);
  setMetaTag('property', 'og:url', url);
  if (imageUrl) setMetaTag('property', 'og:image', imageUrl);

  setMetaTag('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  if (imageUrl) setMetaTag('name', 'twitter:image', imageUrl);

  setLinkTag('canonical', url);
}

export function applyHomeMeta({ title, description, imageUrl }) {
  const url = window.location.origin + window.location.pathname;
  applyMeta({
    title,
    description,
    url,
    imageUrl,
    type: 'website',
  });
}

function buildProjectDescription(projectData) {
  const descData = projectData.descripcion;
  let candidate = '';

  if (descData) {
    const paragraphs = Array.isArray(descData.texto)
      ? descData.texto
      : Array.isArray(descData.es)
        ? descData.es
        : [];
    if (paragraphs.length > 0) {
      candidate = paragraphs[0];
    } else if (descData.titulo) {
      candidate = descData.titulo;
    }
  }

  if (!candidate) {
    candidate = getProjectTitle(projectData, 'Proyecto');
  }

  const cleaned = normalizeWhitespace(stripHtml(candidate));
  return truncate(cleaned, 160);
}

function resolveAssetUrl(path) {
  if (!path) return '';
  return new URL(path, window.location.href).href;
}

function applyProjectMeta(projectData, titleText) {
  const description = buildProjectDescription(projectData);
  const base = `data/${projectData.slug}/`;
  let imagePath = projectData.primera_imatge?.src || '';

  if (!imagePath && Array.isArray(projectData.imatges) && projectData.imatges.length > 0) {
    const normalized = normalizeImageEntry(projectData.imatges[0]);
    if (normalized?.src) imagePath = normalized.src;
  }

  const imageUrl = imagePath ? resolveAssetUrl(`${base}${imagePath}`) : '';

  applyMeta({
    title: titleText,
    description,
    url: window.location.href,
    imageUrl,
    type: 'website',
  });
}

// Obtener slug de la URL
function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

function normalizeImageEntry(imgData) {
  if (typeof imgData === 'string') {
    return { src: imgData, alt: '' };
  }
  if (imgData && typeof imgData === 'object' && imgData.src) {
    return { src: imgData.src, alt: imgData.alt || '' };
  }
  return null;
}

// Función para renderizar proyecto desde JSON
export async function renderProject() {
  const slug = getSlugFromURL();
  
  if (!slug) {
    document.body.innerHTML = '<p style="padding: 2rem;">No se especificó ningún proyecto</p>';
    return;
  }
  
  try {
    const response = await fetch(`data/${slug}/${slug}.json`);
    if (!response.ok) throw new Error(`No se pudo cargar ${slug}.json`);
    
    const projectData = await response.json();
    const dataSlug = typeof projectData.slug === 'string' ? projectData.slug.trim() : '';
    if (!dataSlug) {
      console.warn(`[proyecto] JSON sin "slug" para ${slug}. Se usa el slug de la URL.`);
      projectData.slug = slug;
    } else if (dataSlug !== slug) {
      console.warn(`[proyecto] slug URL (${slug}) no coincide con JSON (${dataSlug}). Se usa el slug de la URL para rutas.`);
      projectData.slug = slug;
    } else {
      projectData.slug = dataSlug;
    }
    const titleText = getProjectTitle(projectData);
    applyProjectMeta(projectData, titleText);
    
    // Verificar si es proyecto tipo diario
    const isDiario = projectData.configuracion?.tipo_layout === 'diario';
    
    if (isDiario) {
      renderDiarioProject(projectData, titleText);
    } else {
      renderStandardProject(projectData, titleText);
    }
  } catch (error) {
    console.error('Error cargando proyecto:', error);
    document.body.innerHTML = '<p style="padding: 2rem;">Error cargando el proyecto</p>';
  }
}

function renderStandardProject(projectData, titleText) {
  const body = document.body;
  body.innerHTML = ''; // Limpiar

  const projectTitle = titleText || getProjectTitle(projectData);
  appendVisuallyHiddenTitle(body, projectTitle);
  
  // Header con imagen principal
  if (projectData.primera_imatge?.src) {
    const header = document.createElement('div');
    header.className = 'project-header';
    
    const img = document.createElement('img');
    img.src = `data/${projectData.slug}/${projectData.primera_imatge.src}`;
    const headerAlt = `Portada del proyecto ${projectTitle}`;
    img.alt = headerAlt;
    img.addEventListener('error', () => {
      console.error(`[proyecto] No se pudo cargar portada: ${img.src} (slug: ${projectData.slug})`);
    });
    
    header.appendChild(img);
    body.appendChild(header);
  }
  
  // Project body
  const projectBody = document.createElement('div');
  projectBody.className = 'project-body';
  
  // Descripción
  if (projectData.descripcion) {
    const desc = document.createElement('div');
    desc.className = 'project-description';

    const descData = projectData.descripcion;

    if (descData.titulo) {
      const heading = document.createElement('h2');
      if (descData.link) {
        heading.appendChild(createExternalLink(descData.link, descData.titulo));
      } else {
        heading.textContent = descData.titulo;
      }
      desc.appendChild(heading);
    }

    const paragraphs = Array.isArray(descData.texto)
      ? descData.texto
      : Array.isArray(descData.es)
        ? descData.es
        : [];

    paragraphs.forEach((paragraph) => {
      const p = document.createElement('p');
      p.innerHTML = paragraph;
      desc.appendChild(p);
    });

    ensureExternalRel(desc);

    projectBody.appendChild(desc);
  }
  
  // Metadata
  const showMeta = projectData.configuracion?.mostrar_meta !== false;
  if (showMeta && (projectData.tipo_proyecto || projectData.fecha || projectData.ubicacion || projectData.creditos)) {
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    
    const ul = document.createElement('ul');
    
    // Tipo de proyecto
    if (projectData.tipo_proyecto) {
      const li = document.createElement('li');
      const normalizedCategory = normalizeCategory(projectData.tipo_proyecto);
      if (normalizedCategory) {
        const link = document.createElement('a');
        link.href = `./index.html?categoria=${encodeURIComponent(normalizedCategory)}`;
        link.textContent = projectData.tipo_proyecto;
        li.appendChild(link);
      } else {
        li.textContent = projectData.tipo_proyecto;
      }
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
          li.appendChild(createExternalLink(credito.link, credito.nombre));
        } else {
          li.textContent = credito.nombre;
        }
        
        if (credito.rol) {
          const role = document.createElement('span');
          role.className = 'meta';
          role.textContent = credito.rol;
          li.appendChild(document.createTextNode(' '));
          li.appendChild(role);
        }
        
        ul.appendChild(li);
      });
    }
    
    meta.appendChild(ul);
    projectBody.appendChild(meta);
  }
  
  body.appendChild(projectBody);
  
  // Galería
  if (projectData.imatges && projectData.imatges.length > 0) {
    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';
    
    projectData.imatges.forEach((imgData, idx) => {
      const normalized = normalizeImageEntry(imgData);
      if (!normalized) return;
      const img = document.createElement('img');
      img.src = `data/${projectData.slug}/${normalized.src}`;
      const imageAlt = normalized.alt?.trim() || `Imagen ${idx + 1} del proyecto ${projectTitle}`;
      img.alt = imageAlt;
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        console.error(`[proyecto] No se pudo cargar imagen ${idx + 1}: ${img.src} (slug: ${projectData.slug})`);
      });
      
      gallery.appendChild(img);
    });
    
    body.appendChild(gallery);
  }
}

function renderDiarioProject(projectData, titleText) {
  const body = document.body;
  body.innerHTML = ''; // Limpiar

  const projectTitle = titleText || getProjectTitle(projectData, 'diario');
  appendVisuallyHiddenTitle(body, projectTitle);
  
  const gallery = document.createElement('div');
  gallery.className = 'diario-gallery';
  
  if (projectData.imatges && projectData.imatges.length > 0) {
    projectData.imatges.forEach((imgData, idx) => {
      const normalized = normalizeImageEntry(imgData);
      if (!normalized) return;
      const img = document.createElement('img');
      img.src = `data/${projectData.slug}/${normalized.src}`;
      const imageAlt = normalized.alt?.trim() || `Imagen ${idx + 1} del diario ${projectTitle}`;
      img.alt = imageAlt;
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        console.error(`[diario] No se pudo cargar imagen ${idx + 1}: ${img.src} (slug: ${projectData.slug})`);
      });
      
      gallery.appendChild(img);
    });
  }
  
  body.appendChild(gallery);
}
