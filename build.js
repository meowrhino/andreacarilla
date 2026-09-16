#!/usr/bin/env node
// build.js - genera una pagina estatica por proyecto en proyectos/<slug>/
//
// Por que existe: proyecto.html es un esqueleto vacio que se rellena con JS,
// asi que los scrapers de WhatsApp, Instagram, Facebook o Twitter -que no
// ejecutan JS- veian siempre "proyecto" sin imagen ni descripcion. Estas
// paginas llevan el <head> ya escrito, asi que las previsualizaciones al
// compartir funcionan. El body lo sigue montando js/main.js igual que antes.
//
// No toca ningun json: lee data/home.json y data/<slug>/<slug>.json tal cual
// los deja el formateador, y mide las imagenes leyendo los propios ficheros.
//
// Uso: node build.js

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "proyectos");

// ---------------------------------------------------------------------------
// URL del sitio: sale del CNAME si lo hay, y si no del remote de git.
// Asi el mismo script funciona en el repo del cliente (andreacarilla.work)
// y en la copia (meowrhino.github.io/andreacarilla) sin configurar nada.
// ---------------------------------------------------------------------------
function detectSiteUrl() {
  const cname = path.join(ROOT, "CNAME");
  if (fs.existsSync(cname)) {
    const host = fs.readFileSync(cname, "utf8").trim();
    if (host) return `https://${host}`;
  }
  try {
    const remote = execSync("git config --get remote.origin.url", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const m = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/i);
    if (m) return `https://${m[1].toLowerCase()}.github.io/${m[2]}`;
  } catch (_) {}
  return "";
}

// ---------------------------------------------------------------------------
// Dimensiones de un webp sin dependencias. Hace falta para reservar el hueco
// de cada imagen y que la pagina no salte al cargar (CLS).
// ---------------------------------------------------------------------------
function webpSize(file) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(32);
    const read = fs.readSync(fd, buf, 0, 32, 0);
    if (read < 30) return null;
    if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;

    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      // lossy: 3 bytes frame tag + sync code 9d 01 2a + 2 bytes ancho + 2 alto
      if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
      return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
      // lossless: firma 0x2f + 14 bits ancho-1 + 14 bits alto-1
      if (buf[20] !== 0x2f) return null;
      const bits = buf.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") {
      // extendido: ancho-1 y alto-1 en 24 bits little endian
      return {
        w: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
        h: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
      };
    }
    return null;
  } catch (_) {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

// ---------------------------------------------------------------------------
// Mismas reglas de titulo y descripcion que js/components.js, para que el
// <head> estatico y el que inyecta el JS digan exactamente lo mismo.
// ---------------------------------------------------------------------------
const stripHtml = (s) => String(s).replace(/<[^>]*>/g, "");
const normalizeWhitespace = (s) => String(s).replace(/\s+/g, " ").trim();

// Identico al truncate de js/components.js: si no, el <head> estatico y el que
// inyecta el JS dirian cosas distintas en las descripciones largas
function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3).trimEnd() + "...";
}

function projectTitle(data, fallback = "proyecto") {
  return data?.titulo || data?.slug || fallback;
}

function projectDescription(data) {
  const d = data.descripcion;
  let candidate = "";
  if (d) {
    const paragraphs = Array.isArray(d.texto) ? d.texto : Array.isArray(d.es) ? d.es : [];
    if (paragraphs.length > 0) candidate = paragraphs[0];
    else if (d.titulo) candidate = d.titulo;
  }
  if (!candidate) candidate = projectTitle(data, "Proyecto");
  return truncate(normalizeWhitespace(stripHtml(candidate)), 160);
}

function firstImage(data) {
  if (data.primera_imatge?.src) return data.primera_imatge.src;
  const list = Array.isArray(data.imatges) ? data.imatges : [];
  for (const entry of list) {
    const src = typeof entry === "string" ? entry : entry?.src;
    if (src) return src;
  }
  return "";
}

function allImages(data) {
  const out = [];
  if (data.primera_imatge?.src) out.push(data.primera_imatge.src);
  for (const entry of Array.isArray(data.imatges) ? data.imatges : []) {
    const src = typeof entry === "string" ? entry : entry?.src;
    if (src) out.push(src);
  }
  return out;
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// JSON incrustado en el HTML: hay que cortar </script> o rompe el documento
const escapeJson = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

// ---------------------------------------------------------------------------

function imageSizeMap(slug, data) {
  const sizes = {};
  for (const src of allImages(data)) {
    const clean = src.replace(/^\.\//, "");
    const size = webpSize(path.join(DATA, slug, clean));
    if (size) sizes[src] = [size.w, size.h];
  }
  return sizes;
}

function projectPage({ slug, data, siteUrl }) {
  const title = projectTitle(data);
  const description = projectDescription(data);
  const url = siteUrl ? `${siteUrl}/proyectos/${slug}/` : "";
  const img = firstImage(data);
  const imageUrl = img && siteUrl ? `${siteUrl}/data/${slug}/${img.replace(/^\.\//, "")}` : "";
  const sizes = imageSizeMap(slug, data);

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    author: { "@type": "Person", name: "Andrea Carilla" },
  };
  if (url) ld.url = url;
  if (imageUrl) ld.image = imageUrl;

  const meta = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="website">`,
    url && `<meta property="og:url" content="${escapeHtml(url)}">`,
    imageUrl && `<meta property="og:image" content="${escapeHtml(imageUrl)}">`,
    `<meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    imageUrl && `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`,
    url && `<link rel="canonical" href="${escapeHtml(url)}">`,
  ].filter(Boolean);

  // <base> relativo: sirve igual en la raiz (andreacarilla.work) que en
  // subcarpeta (meowrhino.github.io/andreacarilla)
  return `<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="../../">
    <title>${escapeHtml(title)}</title>
${meta.map((m) => "    " + m).join("\n")}
    <link rel="stylesheet" href="./css/style.css">
    <link rel="modulepreload" href="./js/components.js">
    <link rel="preload" as="fetch" href="./data/${slug}/${slug}.json" crossorigin>
    <script type="application/ld+json">${escapeJson(ld)}</script>
    <script type="application/json" id="img-sizes">${escapeJson(sizes)}</script>
</head>

<body data-page-type="proyecto" data-slug="${escapeHtml(slug)}">

    <noscript>
        <p style="padding: 1rem;">Activa JavaScript para cargar el proyecto. <a href="./index.html">Volver al inicio</a></p>
    </noscript>

    <script type="module" src="./js/main.js"></script>

</body>

</html>
`;
}

// Bloque generado dentro de index.html, entre marcas, para no pisar el resto
function homeBlock({ home, siteUrl }) {
  const sizes = {};
  for (const set of Array.isArray(home.gallerySets) ? home.gallerySets : []) {
    for (const item of set) {
      if (!item?.src) continue;
      const size = webpSize(path.join(ROOT, item.src));
      if (size) sizes[item.src] = [size.w, size.h];
    }
  }

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Andrea Carilla",
      jobTitle: "Fotografa",
      email: "carillagonzalezandrea@gmail.com",
      sameAs: ["https://www.instagram.com/andreacarilla/"],
      ...(siteUrl ? { url: siteUrl } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "andrea carilla",
      ...(siteUrl ? { url: siteUrl } : {}),
    },
  ];

  return [
    `    <link rel="modulepreload" href="./js/components.js">`,
    `    <link rel="preload" as="fetch" href="./data/home.json" crossorigin>`,
    `    <script type="application/ld+json">${escapeJson(ld)}</script>`,
    `    <script type="application/json" id="img-sizes">${escapeJson(sizes)}</script>`,
  ].join("\n");
}

function updateHome(block) {
  const file = path.join(ROOT, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const start = "<!-- build:start -->";
  const end = "<!-- build:end -->";
  if (!html.includes(start) || !html.includes(end)) {
    throw new Error("index.html no tiene las marcas <!-- build:start --> / <!-- build:end -->");
  }
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  const next = html.replace(re, `${start}\n${block}\n    ${end}`);
  if (next === html) return false;
  fs.writeFileSync(file, next);
  return true;
}

// ---------------------------------------------------------------------------

function main() {
  const siteUrl = detectSiteUrl();
  if (!siteUrl) {
    console.warn("[build] aviso: sin CNAME ni remote de github, las urls absolutas (og:url, canonical) se omiten");
  } else {
    console.log(`[build] sitio: ${siteUrl}`);
  }

  const home = JSON.parse(fs.readFileSync(path.join(DATA, "home.json"), "utf8"));
  const slugs = (home.projectes_visibles || [])
    .filter((p) => p.visible !== false)
    .map((p) => p.slug)
    .filter(Boolean);

  fs.mkdirSync(OUT, { recursive: true });

  let written = 0;
  const generated = new Set();

  for (const slug of slugs) {
    const jsonPath = path.join(DATA, slug, `${slug}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`[build] sin json, me lo salto: ${slug}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (!data.slug) data.slug = slug;

    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "index.html");
    const html = projectPage({ slug, data, siteUrl });

    const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (prev !== html) {
      fs.writeFileSync(file, html);
      written++;
    }
    generated.add(slug);
  }

  // Borrar paginas de proyectos que ya no estan en home.json
  let removed = 0;
  for (const entry of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) {
    if (!generated.has(entry) && fs.statSync(path.join(OUT, entry)).isDirectory()) {
      fs.rmSync(path.join(OUT, entry), { recursive: true, force: true });
      removed++;
    }
  }

  const homeChanged = updateHome(homeBlock({ home, siteUrl }));

  console.log(
    `[build] ${generated.size} proyectos | ${written} paginas escritas | ${removed} eliminadas | index.html ${homeChanged ? "actualizado" : "sin cambios"}`
  );
}

main();
