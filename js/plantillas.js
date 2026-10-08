// plantillas.js - json → html. Una sola plantilla para dos sitios:
//   - build.js (node) la usa para escribir las paginas que se publican
//   - vista-previa.js (navegador, solo en local con Live Server) la usa para
//     pintar al momento lo que hay en los json, sin ejecutar el build
// Asi lo que se ve en local y lo que se publica no pueden ser distintos.
//
// Funciones puras: no tocan el disco ni el DOM.

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------
export const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const stripHtml = (s) => String(s).replace(/<[^>]*>/g, "");
const normalizeWhitespace = (s) => String(s).replace(/\s+/g, " ").trim();

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3).trimEnd() + "...";
}

// "Evento " y "eventos" son la misma categoria
export function normalizeCategory(value) {
  if (!value) return "";
  const normalized = String(value).trim().replace(/\s+/g, " ").toLowerCase();
  const aliases = { evento: "eventos", producto: "product", investigacion: "investigación" };
  return aliases[normalized] || normalized;
}

// Enlace externo: siempre en pestaña nueva y sin pasarle la ventana
const externalLink = (href, text) =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;

// ---------------------------------------------------------------------------
// Lectura del json de proyecto
// ---------------------------------------------------------------------------
export const projectTitle = (data) => data.titulo || data.slug;

// Los parrafos admiten html (negrita, cursiva, enlaces del formateador).
// "es" es el nombre antiguo de "texto"
function paragraphs(data) {
  const d = data.descripcion || {};
  return Array.isArray(d.texto) ? d.texto : Array.isArray(d.es) ? d.es : [];
}

// Para <meta description>: primer parrafo sin html, o el titulo
export function projectDescription(data) {
  const candidate = paragraphs(data)[0] || data.descripcion?.titulo || projectTitle(data);
  return truncate(normalizeWhitespace(stripHtml(candidate)), 160);
}

// Las imagenes pueden ser "./img/1.webp" o { src, alt }
const imageEntry = (entry) =>
  typeof entry === "string" ? { src: entry, alt: "" } : entry?.src ? { src: entry.src, alt: entry.alt || "" } : null;

export const galleryImages = (data) =>
  (Array.isArray(data.imatges) ? data.imatges : []).map(imageEntry).filter(Boolean);

// Ruta de una imagen del proyecto vista desde la raiz de la web
export const imagePath = (slug, src) => `data/${slug}/${src.replace(/^\.\//, "")}`;

// <img> con su ancho y alto reales (si se conocen), para que el navegador
// reserve el hueco. sizeOf(ruta) → { w, h } o null
function imgTag(file, alt, attrs, sizeOf) {
  const size = sizeOf(file);
  const dims = size ? ` width="${size.w}" height="${size.h}"` : "";
  return `<img src="./${escapeHtml(file)}" alt="${escapeHtml(alt)}"${dims}${attrs ? " " + attrs : ""}>`;
}

// ---------------------------------------------------------------------------
// Pagina de proyecto
// ---------------------------------------------------------------------------

// Tipo, ubicacion, fecha y creditos. La ubicacion admite html (enlaces a
// espacios y galerias); la fecha es texto libre o { mes, anio }
function projectMeta(data) {
  const items = [];

  const category = normalizeCategory(data.tipo_proyecto);
  if (category) {
    items.push(`<a href="./?categoria=${encodeURIComponent(category)}">${escapeHtml(data.tipo_proyecto)}</a>`);
  }
  if (data.ubicacion) items.push(data.ubicacion);

  const fecha = data.fecha;
  if (typeof fecha === "string" && fecha) items.push(escapeHtml(fecha));
  else if (fecha?.mes || fecha?.anio) {
    items.push(`${escapeHtml(fecha.mes || "")} <span class="meta">${escapeHtml(fecha.anio || "")}</span>`.trim());
  }

  for (const c of Array.isArray(data.creditos) ? data.creditos : []) {
    const name = c.link ? externalLink(c.link, c.nombre) : escapeHtml(c.nombre);
    items.push(c.rol ? `${name} <span class="meta">${escapeHtml(c.rol)}</span>` : name);
  }

  if (!items.length) return "";
  return `
        <div class="project-meta">
            <ul>
${items.map((i) => `                <li>${i}</li>`).join("\n")}
            </ul>
        </div>`;
}

function projectDescriptionHtml(data) {
  const d = data.descripcion || {};
  const parts = [];
  if (d.titulo) parts.push(`<h2>${d.link ? externalLink(d.link, d.titulo) : escapeHtml(d.titulo)}</h2>`);
  for (const p of paragraphs(data)) parts.push(`<p>${p}</p>`);
  if (!parts.length) return "";
  return `
        <div class="project-description">
${parts.map((p) => `            ${p}`).join("\n")}
        </div>`;
}

function standardBody(slug, data, sizeOf) {
  const title = projectTitle(data);
  const cfg = data.configuracion || {};
  const out = [];

  if (cfg.mostrar_header !== false && data.primera_imatge?.src) {
    const header = imgTag(
      imagePath(slug, data.primera_imatge.src),
      `Portada del proyecto ${title}`,
      'fetchpriority="high"',
      sizeOf
    );
    out.push(`    <div class="project-header">\n        ${header}\n    </div>`);
  }

  const description = projectDescriptionHtml(data);
  const meta = cfg.mostrar_meta !== false ? projectMeta(data) : "";
  if (description || meta) out.push(`    <div class="project-body">${description}${meta}\n    </div>`);

  const images = galleryImages(data);
  if (images.length) {
    const tags = images.map(
      (img, i) =>
        "        " +
        imgTag(
          imagePath(slug, img.src),
          img.alt.trim() || `Imagen ${i + 1} del proyecto ${title}`,
          'loading="lazy" decoding="async"',
          sizeOf
        )
    );
    out.push(`    <div class="project-gallery">\n${tags.join("\n")}\n    </div>`);
  }
  return out.join("\n");
}

// Diario: solo una tira horizontal de fotos
function diarioBody(slug, data, sizeOf) {
  const tags = galleryImages(data).map(
    (img, i) =>
      "        " +
      imgTag(
        imagePath(slug, img.src),
        img.alt.trim() || `Imagen ${i + 1} del diario`,
        i === 0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"',
        sizeOf
      )
  );
  return `    <div class="diario-gallery">\n${tags.join("\n")}\n    </div>`;
}

// Lo que va dentro de <main> en la pagina de un proyecto
export function projectMain(slug, data, sizeOf = () => null) {
  const body = data.configuracion?.tipo_layout === "diario" ? diarioBody : standardBody;
  return `    <h1 class="visually-hidden">${escapeHtml(projectTitle(data))}</h1>
${body(slug, data, sizeOf)}`;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

// Enlaces a proyectos. home.js los reparte por la pantalla; sin JS se ven en fila.
// hrefOf(slug) permite a la vista previa enlazar proyectos aun sin generar
export function homeLinks(projects, hrefOf = (slug) => `./proyectos/${slug}/`) {
  return projects
    .map(
      (p) =>
        `            <a class="project-link" href="${escapeHtml(hrefOf(p.slug))}" data-category="${escapeHtml(
          normalizeCategory(p.category || "otros")
        )}">${escapeHtml(p.name || p.slug)}</a>`
    )
    .join("\n");
}

// Proyectos de home.json que se publican
export const visibleProjects = (home) => (home.projectes_visibles || []).filter((p) => p.visible !== false && p.slug);
