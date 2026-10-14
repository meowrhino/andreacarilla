#!/usr/bin/env node
// build.mjs - lee data/ y projects/, comprueba que todo cuadra y escribe la
// web entera en dist/ (que no se commitea: la publica la Action).
//
//   dist/index.html                 la home, con los enlaces y el about dentro
//   dist/projects/<slug>/index.html una pagina por proyecto, con sus fotos
//   dist/projects/<slug>/og.jpg     la imagen al compartir (ffmpeg)
//   dist/proyectos/<slug>/          redirige las direcciones de antes
//   dist/sitemap.xml, robots.txt
//
// Por que: si el contenido lo pinta el JS, Google ve una pagina vacia y
// WhatsApp o Instagram (que no ejecutan JS) no ven ni titulo ni imagen. Asi
// el navegador recibe el HTML ya hecho y el JS solo coloca e interactua.
//
// Si algo no cuadra (una coma, una foto que no existe, un proyecto que no
// esta) para con un mensaje en castellano y no escribe nada: la web publicada
// se queda como estaba.
//
// Uso: node build/build.mjs   (sin dependencias; ffmpeg opcional)

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  escapeHtml,
  escapeJson,
  homeData,
  homeLinks,
  listedProjects,
  photoPath,
  portadaPath,
  projectDescription,
  projectMain,
  projectName,
  siteChrome,
} from "./paginas.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");
const at = (...p) => path.join(ROOT, ...p);

const errors = [];
const fail = () => {
  console.error(`\n✗ ${errors.join("\n✗ ")}\n\nNo se ha publicado nada: la web sigue como estaba.\n`);
  process.exit(1);
};

// Un JSON roto dice cual y donde
function read(file) {
  try {
    return JSON.parse(fs.readFileSync(at(file), "utf8"));
  } catch (e) {
    errors.push(
      e.code === "ENOENT" ? `falta ${file}` : `${file} no es un JSON válido (casi siempre es una coma): ${e.message}`
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// Medidas de un webp sin dependencias: el navegador reserva el hueco de cada
// foto y la pagina no salta al cargar
// ---------------------------------------------------------------------------
function webpSize(file) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(32);
    if (fs.readSync(fd, buf, 0, 32, 0) < 30) return null;
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
      return { w: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1, h: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1 };
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}
const sizeOf = (file) => webpSize(at(file));

// ---------------------------------------------------------------------------
// Leer y comprobar
// ---------------------------------------------------------------------------
const site = read("data/site.json");
const about = read("data/about.json");
if (!site || !about) fail();
if (!site.url) errors.push('falta "url" en data/site.json: la dirección donde se publica la web');
const abs = (p) => new URL(p, site.url).href;

const projects = [];
const seen = new Map();
for (const entry of listedProjects(site)) {
  const where = `la lista «${entry.list}» de data/site.json`;
  if (seen.has(entry.slug)) {
    errors.push(`${where} repite «${entry.slug}», que ya está en «${seen.get(entry.slug)}»`);
    continue;
  }
  seen.set(entry.slug, entry.list);
  const file = `projects/${entry.slug}/project.json`;
  if (!fs.existsSync(at(file))) {
    errors.push(`${where} nombra «${entry.slug}», y no hay ${file}`);
    continue;
  }
  const data = read(file);
  if (!data) continue;
  const p = { ...data, ...entry };
  if (!p.title && !p.short) errors.push(`${file}: le falta «title»`);
  for (const field of ["cover", "photos"]) {
    if (p[field] != null && !Array.isArray(p[field])) {
      errors.push(`${file}: «${field}» va entre corchetes, así: ["1", "2"]`);
      continue;
    }
    for (const n of p[field] || []) {
      if (!fs.existsSync(at(photoPath(p.slug, n)))) errors.push(`${file}: en «${field}», ${n} no está en su carpeta img/ (falta ${n}.webp)`);
    }
  }
  projects.push(p);
}
if (!projects.length) errors.push("data/site.json: no hay ningún proyecto en «lists»");

(site.gallery || []).forEach((set, i) =>
  set.forEach((item) => {
    if (!fs.existsSync(at(portadaPath(i, item.photo)))) errors.push(`data/site.json: en «gallery» ${i + 1}, falta ${portadaPath(i, item.photo)}`);
    if (!seen.has(item.project)) errors.push(`data/site.json: en «gallery» ${i + 1}, «${item.project}» no está en ninguna lista`);
  })
);

for (const slug of fs.readdirSync(at("projects"))) {
  if (fs.statSync(at("projects", slug)).isDirectory() && !seen.has(slug)) {
    console.warn(`⚠ projects/${slug} no está en ninguna lista de data/site.json: no sale en la web`);
  }
}

if (errors.length) fail();

// ---------------------------------------------------------------------------
// La imagen al compartir (og:image): 1200×630 en JPG, que es lo que esperan
// WhatsApp, Instagram y compañia. La foto entera sobre blanco, con aire.
// La hace ffmpeg (en la Action la instala el workflow) en .cache/og/, con
// nombre segun la foto de la que sale, asi que solo se rehace si cambia.
// Sin ffmpeg se comparte la foto tal cual y se avisa.
// ---------------------------------------------------------------------------
const FIT = "scale=1104:534:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2:white";
let ffmpeg = true;

function ogImage(out, src) {
  const cached = at(".cache", "og", createHash("sha1").update(src).digest("hex").slice(0, 12) + ".jpg");
  let ok = fs.existsSync(cached) && fs.statSync(cached).mtimeMs >= fs.statSync(at(src)).mtimeMs;
  if (!ok && ffmpeg) {
    try {
      fs.mkdirSync(path.dirname(cached), { recursive: true });
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", at(src), "-vf", FIT, "-q:v", "3", cached]);
      ok = true;
    } catch {
      ffmpeg = false;
      console.warn("⚠ sin ffmpeg (brew install ffmpeg): al compartir sale la foto tal cual");
    }
  }
  if (!ok) return src;
  fs.copyFileSync(cached, path.join(OUT, out));
  return out;
}

// ---------------------------------------------------------------------------
// Piezas de las paginas
// ---------------------------------------------------------------------------
function metaTags({ title, description, url, image }) {
  return [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:site_name" content="${escapeHtml(site.title)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    image && `<meta property="og:image" content="${escapeHtml(abs(image))}">`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    image && `<meta name="twitter:image" content="${escapeHtml(abs(image))}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
  ]
    .filter(Boolean)
    .map((m) => "    " + m)
    .join("\n");
}

// Sustituye lo que hay entre <!-- build:name --> y <!-- /build:name -->
function replaceBlock(html, name, content) {
  const start = `<!-- build:${name} -->`;
  const end = `<!-- /build:${name} -->`;
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1) throw new Error(`falta la marca ${start} / ${end}`);
  const indent = html.slice(html.lastIndexOf("\n", from) + 1, from);
  return html.slice(0, from + start.length) + `\n${content}\n${indent}` + html.slice(to);
}

// Las plantillas index.html y proyecto.html llevan data-preview: con eso
// main.js sabe que esta en Live Server sin build. En dist/ se quita
const template = (file) => fs.readFileSync(at(file), "utf8").replace(" data-preview", "");

function homePage() {
  const first = site.gallery?.[0]?.[0];
  const image = first ? ogImage("og.jpg", portadaPath(0, first.photo)) : "";
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.title,
      jobTitle: "Fotógrafa",
      email: site.email,
      sameAs: site.social,
      url: abs(""),
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: site.title, url: abs("") },
  ];
  const head = [
    metaTags({ title: site.title, description: site.description, url: abs(""), image }),
    `    <script type="application/ld+json">${escapeJson(ld)}</script>`,
    `    <script type="application/json" id="home-data">${escapeJson(homeData(site, projects, (s) => `./projects/${s}/`, sizeOf))}</script>`,
  ].join("\n");

  let html = template("index.html");
  html = replaceBlock(html, "head", head);
  html = replaceBlock(html, "links", homeLinks(projects));
  html = replaceBlock(html, "chrome", siteChrome(site, about, { isHome: true }));
  return html;
}

function projectPage(p) {
  const title = projectName(p);
  const description = projectDescription(p);
  const url = abs(`projects/${p.slug}/`);
  const cover = p.cover?.[0] ?? p.photos?.[0];
  const image = cover != null ? ogImage(`projects/${p.slug}/og.jpg`, photoPath(p.slug, cover)) : "";
  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url,
    author: { "@type": "Person", name: site.title, url: abs("") },
  };
  if (image) ld.image = abs(image);

  // <base> relativo: sirve igual en la raiz (andreacarilla.work) que en
  // subcarpeta (meowrhino.github.io/andreacarilla)
  return `<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="../../">
    <title>${escapeHtml(title)} · ${escapeHtml(site.title)}</title>
${metaTags({ title, description, url, image })}
    <link rel="stylesheet" href="./css/style.css">
    <script type="application/ld+json">${escapeJson(ld)}</script>
</head>

<body data-page-type="proyecto">

    <main>
${projectMain(p, sizeOf)}
    </main>

${siteChrome(site, about, { isHome: false })}

    <script type="module" src="./js/main.js"></script>

</body>

</html>
`;
}

// Las direcciones de antes (proyectos/<slug>/ y proyecto.html?slug=) siguen
// funcionando: llevan a la nueva
const redirect = (to) => `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <link rel="canonical" href="${escapeHtml(abs(to))}">
    <meta http-equiv="refresh" content="0; url=../../${escapeHtml(to)}">
    <title>${escapeHtml(site.title)}</title>
</head>
<body><a href="../../${escapeHtml(to)}">${escapeHtml(site.title)}</a></body>
</html>
`;

const oldProjectUrl = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <title>${escapeHtml(site.title)}</title>
    <script>
        var slug = new URLSearchParams(location.search).get('slug');
        location.replace(slug ? './projects/' + encodeURIComponent(slug) + '/' : './');
    </script>
</head>
<body><a href="./">${escapeHtml(site.title)}</a></body>
</html>
`;

// ---------------------------------------------------------------------------
// Escribir dist/
// ---------------------------------------------------------------------------
// Se vacia dist/ sin borrar la carpeta: si Live Server la esta sirviendo y
// desaparece, deja de mirarla
fs.mkdirSync(OUT, { recursive: true });
for (const name of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, name), { recursive: true, force: true });

for (const dir of ["css", "js", "_portada"]) fs.cpSync(at(dir), path.join(OUT, dir), { recursive: true });
for (const file of ["formateador.html", "CNAME"]) {
  if (fs.existsSync(at(file))) fs.copyFileSync(at(file), path.join(OUT, file));
}

for (const p of projects) {
  const dir = path.join(OUT, "projects", p.slug);
  fs.cpSync(at("projects", p.slug, "img"), path.join(dir, "img"), { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), projectPage(p));
  fs.mkdirSync(path.join(OUT, "proyectos", p.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, "proyectos", p.slug, "index.html"), redirect(`projects/${p.slug}/`));
}
fs.writeFileSync(path.join(OUT, "index.html"), homePage());
fs.writeFileSync(path.join(OUT, "proyecto.html"), oldProjectUrl);

fs.writeFileSync(
  path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[abs(""), ...projects.map((p) => abs(`projects/${p.slug}/`))].map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`
);
fs.writeFileSync(
  path.join(OUT, "robots.txt"),
  site.noindex ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n\nSitemap: ${abs("sitemap.xml")}\n`
);
// GitHub Pages: servir los archivos tal cual, sin pasar por Jekyll
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

console.log(`✓ dist/: home y ${projects.length} proyectos, sitemap y robots`);
