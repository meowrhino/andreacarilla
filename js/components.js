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
            href="https://quiennocorrevuela.bigcartel.com/" target="_blank">Quien no corre, vuela</a>, desde donde ha publicado
            <i>archivo en pixel</i> y <i>no time left for square</i>, investigando nuevas formas de narrar, publicar y distribuir
            fotografía contemporánea desde los márgenes.</p>
        <p>Su trabajo se construye desde la serialidad y la repetición: las imágenes no funcionan de forma aislada,
            sino que se organizan como fragmentos de una narrativa abierta. Dispara desde el impulso y el error, con
            una cámara que no busca certezas ni discursos cerrados, sino que reacciona ante lo que hiere, incomoda o
            emociona. Una mirada crítica, permeable y radicalmente encarnada en lo cotidiano.</p>
        <div class="footer">
            <a href="mailto:carillagonzalezandrea@gmail.com">carillagonzalezandrea@gmail.com</a>
            <a href="https://www.instagram.com/andreacarilla/" target="_blank">@andreacarilla</a>
            <span style="position:absolute; bottom:1rem;">
                web: <a href="https://meowrhino.github.io/becasDigMeow/" target="_blank">meowrhino</a>
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
    if (projectData.titulo) {
      document.title = projectData.titulo;
    } else if (projectData.slug) {
      document.title = projectData.slug;
    }
    
    // Verificar si es proyecto tipo diario
    const isDiario = projectData.configuracion?.tipo_layout === 'diario';
    
    if (isDiario) {
      renderDiarioProject(projectData);
    } else {
      renderStandardProject(projectData);
    }
  } catch (error) {
    console.error('Error cargando proyecto:', error);
    document.body.innerHTML = '<p style="padding: 2rem;">Error cargando el proyecto</p>';
  }
}

function renderStandardProject(projectData) {
  const body = document.body;
  body.innerHTML = ''; // Limpiar
  
  // Header con imagen principal
  if (projectData.primera_imatge?.src) {
    const header = document.createElement('div');
    header.className = 'project-header';
    
    const img = document.createElement('img');
    img.src = `data/${projectData.slug}/${projectData.primera_imatge.src}`;
    const titleText = projectData.titulo || projectData.slug || '';
    img.alt = `${titleText} portada`;
    
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
        const anchor = document.createElement('a');
        anchor.href = descData.link;
        anchor.textContent = descData.titulo;
        anchor.target = '_blank';
        heading.appendChild(anchor);
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
      li.textContent = projectData.tipo_proyecto;
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
          li.innerHTML += ` <span class="meta">${credito.rol}</span>`;
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
      const titleText = projectData.titulo || projectData.slug || 'imagen';
      img.alt = `${titleText} imagen ${idx + 1}`;
      img.loading = 'lazy';
      
      gallery.appendChild(img);
    });
    
    body.appendChild(gallery);
  }
}

function renderDiarioProject(projectData) {
  const body = document.body;
  body.innerHTML = ''; // Limpiar
  
  const gallery = document.createElement('div');
  gallery.className = 'diario-gallery';
  
  if (projectData.imatges && projectData.imatges.length > 0) {
    projectData.imatges.forEach((imgData, idx) => {
      const normalized = normalizeImageEntry(imgData);
      if (!normalized) return;
      const img = document.createElement('img');
      img.src = `data/${projectData.slug}/${normalized.src}`;
      const titleText = projectData.titulo || projectData.slug || 'imagen';
      img.alt = `${titleText} imagen ${idx + 1}`;
      img.loading = 'lazy';
      
      gallery.appendChild(img);
    });
  }
  
  body.appendChild(gallery);
}
