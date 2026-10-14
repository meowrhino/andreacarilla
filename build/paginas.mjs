// paginas.mjs - json → html. Una sola plantilla para dos sitios:
//   - build.mjs (node) la usa para escribir dist/
//   - preview.mjs (navegador, Live Server) la usa para pintar al momento lo
//     que dicen los json, sin ejecutar el build
// Asi lo que se ve en local y lo que se publica no pueden ser distintos.
//
// Funciones puras: no tocan el disco ni el DOM.

// ---------------------------------------------------------------------------
// Texto
// ---------------------------------------------------------------------------
export const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Enlace externo: siempre en pestaña nueva y sin pasarle la ventana
const externalLink = (href, html) =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;

// Mini-markdown de los textos: **negrita**, *cursiva* y [enlace](https://…).
// Lo demas se escapa: un < suelto no rompe la pagina
export const md = (s) =>
  escapeHtml(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => externalLink(href.replace(/&amp;/g, "&"), text))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");

// El mismo texto sin marcas, para <meta description>
const plain = (s) =>
  String(s)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (s, max) => (s.length <= max ? s : s.slice(0, max - 3).trimEnd() + "...");

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------

// Los proyectos publicados, en el orden de las listas de site.json, cada uno
// con su lista: [{ slug, list, listName }]
export const listedProjects = (site) =>
  Object.entries(site.lists || {}).flatMap(([list, { name, projects }]) =>
    (projects || []).map((slug) => ({ slug, list, listName: name || list }))
  );

export const photoPath = (slug, n) => `projects/${slug}/img/${n}.webp`;
export const portadaPath = (set, n) => `_portada/${set + 1}/${n}.webp`;

// El nombre de un proyecto en la home y en la pestaña del navegador
export const projectName = (p) => p.short || p.title || p.slug;

export const projectDescription = (p) => truncate(plain(p.text?.[0] || p.title || p.slug), 160);

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

// Lista, lugar, fecha y creditos
function projectMeta(p) {
  const items = [];
  if (p.list) items.push(`<a href="./?categoria=${encodeURIComponent(p.list)}">${escapeHtml(p.listName)}</a>`);
  if (p.place) items.push(md(p.place));
  if (p.date) items.push(escapeHtml(p.date));
  for (const c of p.credits || []) {
    const name = c.url ? externalLink(c.url, escapeHtml(c.name)) : escapeHtml(c.name);
    items.push(c.role ? `${name} <span class="meta">${escapeHtml(c.role)}</span>` : name);
  }
  if (!items.length) return "";
  return `
        <div class="project-meta">
            <ul>
${items.map((i) => `                <li>${i}</li>`).join("\n")}
            </ul>
        </div>`;
}

function projectText(p) {
  const parts = [];
  if (p.title) parts.push(`<h2>${p.url ? externalLink(p.url, escapeHtml(p.title)) : escapeHtml(p.title)}</h2>`);
  for (const t of p.text || []) parts.push(`<p>${md(t)}</p>`);
  if (!parts.length) return "";
  return `
        <div class="project-description">
${parts.map((t) => `            ${t}`).join("\n")}
        </div>`;
}

function standardBody(p, sizeOf) {
  const name = projectName(p);
  const out = [];
  if (p.cover?.[0]) {
    const header = imgTag(photoPath(p.slug, p.cover[0]), `Portada del proyecto ${name}`, 'fetchpriority="high"', sizeOf);
    out.push(`    <div class="project-header">\n        ${header}\n    </div>`);
  }
  out.push(`    <div class="project-body">${projectText(p)}${projectMeta(p)}\n    </div>`);
  const photos = (p.photos || []).map(
    (n, i) =>
      "        " +
      imgTag(photoPath(p.slug, n), `Imagen ${i + 1} del proyecto ${name}`, 'loading="lazy" decoding="async"', sizeOf)
  );
  if (photos.length) out.push(`    <div class="project-gallery">\n${photos.join("\n")}\n    </div>`);
  return out.join("\n");
}

// "layout": "diary" → solo una tira horizontal de fotos
function diaryBody(p, sizeOf) {
  const photos = (p.photos || []).map(
    (n, i) =>
      "        " +
      imgTag(
        photoPath(p.slug, n),
        `Imagen ${i + 1} del ${projectName(p)}`,
        i === 0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"',
        sizeOf
      )
  );
  return `    <div class="diario-gallery">\n${photos.join("\n")}\n    </div>`;
}

// Lo que va dentro de <main> en la pagina de un proyecto
export function projectMain(p, sizeOf = () => null) {
  const body = p.layout === "diary" ? diaryBody : standardBody;
  return `    <h1 class="visually-hidden">${escapeHtml(projectName(p))}</h1>
${body(p, sizeOf)}`;
}

// ---------------------------------------------------------------------------
// Todas las paginas: boton "andrea carilla" + popup con el about
// ---------------------------------------------------------------------------
export function siteChrome(site, about, { isHome }) {
  const social = (site.social || []).map(
    (url) => `                ${externalLink(url, escapeHtml("@" + url.replace(/\/+$/, "").split("/").pop()))}`
  );
  return `    <nav id="andrea-nav">
        <button id="open-andrea" aria-haspopup="dialog" aria-controls="andrea-popup" aria-expanded="false">${escapeHtml(site.title)}</button>
    </nav>
    <div id="andrea-popup" role="dialog" aria-modal="true" aria-label="sobre ${escapeHtml(site.title)}">
        <button class="close-btn" id="close-andrea">cerrar</button>
        <div class="content">
${(about.text || []).map((t) => `            <p>${md(t)}</p>`).join("\n")}
            <div class="footer">
${[
  site.email && `                <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>`,
  ...social,
  `                <span class="credit">web: ${externalLink("https://meowrhino.studio/", "meowrhino")}</span>`,
]
  .filter(Boolean)
  .join("\n")}
            </div>
        </div>
    </div>${isHome ? "" : `\n    <a class="home-button" href="./">home</a>`}`;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

// Enlaces a proyectos. home.js los reparte por la pantalla; sin JS se ven en fila.
// hrefOf(slug) permite a la vista previa enlazar a proyecto.html?slug=
export const homeLinks = (projects, hrefOf = (slug) => `./projects/${slug}/`) =>
  projects
    .map(
      (p) =>
        `            <a class="project-link" href="${escapeHtml(hrefOf(p.slug))}" data-category="${escapeHtml(
          p.list
        )}">${escapeHtml(projectName(p))}</a>`
    )
    .join("\n");

// Lo que necesita home.js: las galerias de portadas (con su medida, si se
// sabe) y el nombre de cada lista para los botones de filtro
export function homeData(site, projects, hrefOf, sizeOf = () => null) {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return {
    lists: Object.fromEntries(Object.entries(site.lists || {}).map(([k, l]) => [k, l.name || k])),
    gallery: (site.gallery || []).map((set, i) =>
      set.map((item) => {
        const src = portadaPath(i, item.photo);
        const size = sizeOf(src);
        const p = bySlug.get(item.project);
        return {
          src,
          href: hrefOf(item.project),
          alt: `Portada del proyecto ${p ? projectName(p) : item.project}`,
          size: size ? [size.w, size.h] : null,
          desktop: item.desktop,
          mobile: item.mobile,
        };
      })
    ),
  };
}

// JSON incrustado en el HTML: hay que cortar </script> o rompe el documento
export const escapeJson = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
