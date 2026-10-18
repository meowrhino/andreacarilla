#!/usr/bin/env node
// build.mjs - lee data/ y projects/, comprueba que todo cuadra y escribe la
// web entera en dist/ (que no se commitea: la publica la Action).
//
//   dist/index.html                 la home, con los enlaces y el about dentro
//   dist/projects/<slug>/index.html una pagina por proyecto, con sus fotos
//   dist/projects/<slug>/og.jpg     la imagen al compartir (sharp)
//   dist/proyectos/<slug>/          redirige las direcciones de antes
//   dist/sitemap.xml, robots.txt
//
// Por que: si el contenido lo pinta el JS, Google ve una pagina vacia y
// WhatsApp o Instagram (que no ejecutan JS) no ven ni titulo ni imagen. Asi
// el navegador recibe el HTML ya hecho y el JS solo coloca e interactua.
//
// Si algo no cuadra (una coma, un campo que no dice schema/, una foto que no
// existe, un proyecto que no esta) para con un mensaje en castellano y no
// escribe nada: la web publicada se queda como estaba (en la Action, ademas,
// un issue: CLAUDE.md). La vista previa (Live Server) lo enseña igual.
//
// Donde se publica, segun donde se construye (JAMstack, patrones.md §5): en
// la Action de GitHub (nuestra copia), meowrhino.github.io/andreacarilla/ y
// sin indexar; en cualquier otro sitio (Workers Builds, la copia de Andrea:
// wrangler.jsonc), la raiz con el dominio de data/site.json → "url".
//
// Uso: npm ci && node build/build.mjs   (la unica dependencia, sharp, es opcional)

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
import { cargar, leerJSON, validar } from "./validar.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");
const at = (...p) => path.join(ROOT, ...p);

const errors = [];
const fail = () => {
  console.error(`\n✗ ${errors.join("\n✗ ")}\n\nNo se ha publicado nada: la web sigue como estaba. En VS Code sale subrayado en rojo; la vista previa (Live Server) lo enseña igual.\n`);
  process.exit(1);
};

// Cada JSON se lee y se comprueba con su esquema (schema/), el mismo con el
// que VS Code subraya lo que esta mal: un JSON roto dice donde, y un campo
// mal escrito o del tipo que no es para el build
const schema = (type) => JSON.parse(fs.readFileSync(at("schema", `${type}.json`), "utf8"));
function read(file, type) {
  let data;
  try {
    data = leerJSON(fs.readFileSync(at(file), "utf8"), file);
  } catch (e) {
    errors.push(e.code === "ENOENT" ? `falta ${file}` : e.message);
    return null;
  }
  errors.push(...validar(data, schema(type), file));
  return data;
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
const site = read("data/site.json", "site");
const about = read("data/about.json", "about");
if (errors.length) fail();

const files = new Map();
for (const { slug } of listedProjects(site)) {
  const file = `projects/${slug}/project.json`;
  if (fs.existsSync(at(file))) files.set(file, read(file, "project"));
}
if (errors.length) fail();

const github = process.env.GITHUB_ACTIONS === "true";
const [owner, repo] = (process.env.GITHUB_REPOSITORY || "meowrhino/andreacarilla").split("/");
if (github) site.url = `https://${owner}.github.io/${repo}/`;
site.noindex = github;
const abs = (p) => new URL(p, site.url).href;

const { projects, errors: wrong, warnings } = cargar(site, {
  json: (file) => files.get(file),
  exists: (file) => fs.existsSync(at(file)),
  folders: fs.readdirSync(at("projects")).filter((slug) => fs.statSync(at("projects", slug)).isDirectory()),
});
for (const w of warnings) console.warn(`⚠ ${w}`);
errors.push(...wrong);
if (errors.length) fail();

// ---------------------------------------------------------------------------
// La imagen al compartir (og:image): 1200×630 en JPG, que es lo que esperan
// WhatsApp, Instagram y compañia. La foto entera sobre blanco, con aire.
// La hace sharp (npm ci; va igual en la Action que en Workers Builds, donde
// no hay ffmpeg) en .cache/og/, con nombre segun la foto de la que sale, asi
// que solo se rehace si cambia. Sin sharp se comparte la foto tal cual y se avisa.
// ---------------------------------------------------------------------------
const OG_W = 1200;
const OG_H = 630;
const AIR = 48; // margen blanco alrededor, en px
const WHITE = { r: 255, g: 255, b: 255 };

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch (e) {
  console.warn(`⚠ sin sharp (${e.code || e.message}): al compartir sale la foto tal cual. Se arregla con: npm ci`);
}

async function makeOg(src) {
  const cached = at(".cache", "og", createHash("sha1").update(src).digest("hex").slice(0, 12) + ".jpg");
  if (fs.existsSync(cached) && fs.statSync(cached).mtimeMs >= fs.statSync(at(src)).mtimeMs) return cached;
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  await sharp(at(src))
    .resize(OG_W - 2 * AIR, OG_H - 2 * AIR, { fit: "contain", background: WHITE })
    .flatten({ background: WHITE })
    .extend({ top: AIR, bottom: AIR, left: AIR, right: AIR, background: WHITE })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(cached);
  return cached;
}

// Su ruta en dist/ → la foto de la que sale: la de la home, la primera de la
// galeria; la de cada proyecto, su portada
const ogs = new Map();
const first = site.gallery?.[0]?.[0];
if (first) ogs.set("og.jpg", portadaPath(0, first.photo));
for (const p of projects) {
  const cover = p.cover?.[0] ?? p.photos?.[0];
  if (cover != null) ogs.set(`projects/${p.slug}/og.jpg`, photoPath(p.slug, cover));
}
const ogDone = new Map(); // su ruta en dist/ → la hecha, en .cache/og/
if (sharp) {
  for (const [out, src] of ogs) {
    try {
      ogDone.set(out, await makeOg(src));
    } catch (e) {
      console.warn(`⚠ ${src}: no se ha podido hacer la imagen para compartir (${e.message})`);
    }
  }
}
const ogImage = (out) => (ogDone.has(out) ? out : ogs.get(out) || "");

// ---------------------------------------------------------------------------
// Piezas de las paginas
// ---------------------------------------------------------------------------
function metaTags({ title, description, url, image, noindex = site.noindex }) {
  return [
    noindex && `<meta name="robots" content="noindex">`,
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

// La transicion de la casa (js/transicion.js): el <script> del <head> que tapa
// la pagina antes de pintar si se llega de otra. Uno solo, el de index.html
const tapar = template("index.html").match(/ *<script>\{\n[\s\S]*?\n *\}<\/script>/)[0];

function homePage() {
  const image = ogImage("og.jpg");
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
  const image = ogImage(`projects/${p.slug}/og.jpg`);
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
${tapar}
    <title>${escapeHtml(title)} · ${escapeHtml(site.title)}</title>
${metaTags({ title, description, url, image, noindex: site.noindex || p.hidden })}
    <link rel="stylesheet" href="./css/transicion.css">
    <link rel="stylesheet" href="./css/style.css">
    <script type="application/ld+json">${escapeJson(ld)}</script>
</head>

<body data-page-type="proyecto">

    <main>
${projectMain(p, sizeOf)}
    </main>

${siteChrome(site, about, { isHome: false })}

    <script src="./js/transicion.js" defer></script>
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
for (const file of ["formateador.html", "CNAME", "_headers"]) {
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
for (const [out, cached] of ogDone) fs.copyFileSync(cached, path.join(OUT, out));

fs.writeFileSync(
  path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[abs(""), ...projects.filter((p) => !p.hidden).map((p) => abs(`projects/${p.slug}/`))].map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
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
