#!/usr/bin/env node
// build.js - escribe en HTML todo el contenido de la web a partir de los json
//
// Genera:
//   proyectos/<slug>/index.html   una pagina completa por proyecto
//   index.html                    solo los bloques entre <!-- build:x --> y <!-- /build:x -->
//   sitemap.xml, robots.txt
//
// Por que: si el contenido lo pinta el JS, Google ve una pagina vacia y los
// scrapers de WhatsApp, Instagram o Twitter (que no ejecutan JS) no ven ni
// titulo ni imagen. Asi el navegador recibe el HTML ya hecho y el JS solo
// coloca cosas e interactua (galeria de la home, filtros, popup).
//
// No toca ningun json: lee data/home.json y data/<slug>/<slug>.json tal cual
// los deja el formateador, y mide las imagenes leyendo los propios ficheros.
// Sin dependencias. Lo ejecuta la Action en cada push que toque data/.
//
// Uso: node build.js

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  escapeHtml,
  galleryImages,
  homeLinks,
  imagePath,
  projectDescription,
  projectMain,
  projectTitle,
  visibleProjects,
} from "./js/plantillas.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "proyectos");

// ---------------------------------------------------------------------------
// URL del sitio: siempre el dominio de Andrea, tambien en la copia
// (meowrhino.github.io/andreacarilla). Asi el canonical de la copia apunta al
// original y Google no indexa dos webs iguales.
// ---------------------------------------------------------------------------
const SITE_URL = "https://andreacarilla.work";
const SITE_NAME = "andrea carilla";
const HOME_DESCRIPTION =
  "Portfolio de fotografía de Andrea Carilla. Proyectos de moda, editorial y diario personal.";

// Bio del popup "andrea carilla". Va en el HTML de todas las paginas
const BIO_HTML = `
            <p>Graduada en Comunicación Audiovisual por la Universidad de Granada en 2019, su práctica fotográfica se
                articula entre la moda, el diario personal y la fotografía robada, tensionando los límites entre lo
                documental y lo construido.</p>
            <p>Es cofundadora de la editorial de autoedición <a href="https://quiennocorrevuela.bigcartel.com/"
                    target="_blank" rel="noopener noreferrer">Quien no corre, vuela</a>, desde donde ha publicado
                <i>archivo en pixel</i> y <i>no time left for square</i>, investigando nuevas formas de narrar,
                publicar y distribuir fotografía contemporánea desde los márgenes.</p>
            <p>Su trabajo se construye desde la serialidad y la repetición: las imágenes no funcionan de forma
                aislada, sino que se organizan como fragmentos de una narrativa abierta. Dispara desde el impulso y
                el error, con una cámara que no busca certezas ni discursos cerrados, sino que reacciona ante lo que
                hiere, incomoda o emociona. Una mirada crítica, permeable y radicalmente encarnada en lo cotidiano.</p>
            <div class="footer">
                <a href="mailto:carillagonzalezandrea@gmail.com">carillagonzalezandrea@gmail.com</a>
                <a href="https://www.instagram.com/andreacarilla/" target="_blank" rel="noopener noreferrer">@andreacarilla</a>
                <span class="credit">web: <a href="https://meowrhino.studio/" target="_blank" rel="noopener noreferrer">meowrhino</a></span>
            </div>`;

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

// JSON incrustado en el HTML: hay que cortar </script> o rompe el documento
const escapeJson = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

// Tamaño de una imagen a partir de su ruta desde la raiz de la web
const sizeOf = (file) => webpSize(path.join(ROOT, file));

// ---------------------------------------------------------------------------
// Piezas de HTML comunes
// ---------------------------------------------------------------------------

// Boton "andrea carilla" + popup con la bio, y "home" fuera de la home
function siteChrome({ isHome }) {
  return `    <nav id="andrea-nav">
        <button id="open-andrea" aria-haspopup="dialog" aria-controls="andrea-popup" aria-expanded="false">andrea carilla</button>
    </nav>
    <div id="andrea-popup" role="dialog" aria-modal="true" aria-label="sobre andrea carilla">
        <button class="close-btn" id="close-andrea">cerrar</button>
        <div class="content">${BIO_HTML}
        </div>
    </div>${isHome ? "" : `\n    <a class="home-button" href="./">home</a>`}`;
}

function metaTags({ title, description, url, imageUrl }) {
  return [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    imageUrl && `<meta property="og:image" content="${escapeHtml(imageUrl)}">`,
    `<meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    imageUrl && `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
  ]
    .filter(Boolean)
    .map((m) => "    " + m)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Pagina de proyecto (el contenido sale de js/plantillas.js)
// ---------------------------------------------------------------------------

function projectPage(slug, data) {
  const title = projectTitle(data);
  const description = projectDescription(data);
  const url = `${SITE_URL}/proyectos/${slug}/`;
  const first = data.primera_imatge?.src || galleryImages(data)[0]?.src;
  const imageUrl = first ? `${SITE_URL}/${imagePath(slug, first)}` : "";

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url,
    author: { "@type": "Person", name: "Andrea Carilla", url: SITE_URL },
  };
  if (imageUrl) ld.image = imageUrl;

  // <base> relativo: sirve igual en la raiz (andreacarilla.work) que en
  // subcarpeta (meowrhino.github.io/andreacarilla)
  return `<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="../../">
    <title>${escapeHtml(title)} · ${SITE_NAME}</title>
${metaTags({ title, description, url, imageUrl })}
    <link rel="stylesheet" href="./css/style.css">
    <script type="application/ld+json">${escapeJson(ld)}</script>
</head>

<body data-page-type="proyecto" data-slug="${escapeHtml(slug)}">

    <main>
${projectMain(slug, data, sizeOf)}
    </main>

${siteChrome({ isHome: false })}

    <script type="module" src="./js/main.js"></script>

</body>

</html>
`;
}

// ---------------------------------------------------------------------------
// Home: solo se reescriben los bloques marcados de index.html
// ---------------------------------------------------------------------------

function homeHead(home) {
  // Medidas de las portadas: la galeria las coloca antes de que carguen
  const sizes = {};
  for (const set of home.gallerySets || []) {
    for (const item of set) {
      const size = item?.src && webpSize(path.join(ROOT, item.src));
      if (size) sizes[item.src] = [size.w, size.h];
    }
  }
  const firstCover = home.gallerySets?.[0]?.[0]?.src;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Andrea Carilla",
      jobTitle: "Fotógrafa",
      email: "carillagonzalezandrea@gmail.com",
      sameAs: ["https://www.instagram.com/andreacarilla/"],
      url: SITE_URL,
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  ];

  return [
    metaTags({
      title: SITE_NAME,
      description: HOME_DESCRIPTION,
      url: `${SITE_URL}/`,
      imageUrl: firstCover ? `${SITE_URL}/${firstCover}` : "",
    }),
    `    <link rel="modulepreload" href="./js/home.js">`,
    `    <link rel="preload" as="fetch" href="./data/home.json" crossorigin>`,
    `    <script type="application/ld+json">${escapeJson(ld)}</script>`,
    `    <script type="application/json" id="img-sizes">${escapeJson(sizes)}</script>`,
  ].join("\n");
}

// Sustituye lo que hay entre <!-- build:name --> y <!-- /build:name -->
function replaceBlock(html, name, content) {
  const start = `<!-- build:${name} -->`;
  const end = `<!-- /build:${name} -->`;
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1) throw new Error(`index.html no tiene las marcas ${start} / ${end}`);
  const indent = html.slice(html.lastIndexOf("\n", from) + 1, from);
  return html.slice(0, from + start.length) + `\n${content}\n${indent}` + html.slice(to);
}

// ---------------------------------------------------------------------------

// Escribe solo si cambia, para que la Action no haga commits vacios
function writeIfChanged(file, content) {
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (prev === content) return false;
  fs.writeFileSync(file, content);
  return true;
}

function main() {
  const home = JSON.parse(fs.readFileSync(path.join(DATA, "home.json"), "utf8"));
  const visible = visibleProjects(home);

  fs.mkdirSync(OUT, { recursive: true });

  let written = 0;
  const published = [];
  const keep = new Set(); // carpetas de proyectos/ que no se borran

  for (const project of visible) {
    const { slug } = project;
    const jsonPath = path.join(DATA, slug, `${slug}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.warn(`[build] sin json, me lo salto: ${slug}`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    } catch (error) {
      // Un json roto no debe tumbar toda la web: se avisa y se salta
      console.error(`[build] ${slug}.json no se puede leer (¿falta una coma?): ${error.message}`);
      process.exitCode = 1;
      keep.add(slug); // se queda la pagina de la ultima vez que estaba bien
      continue;
    }
    data.slug = slug; // la carpeta manda: es la que sale en la url

    fs.mkdirSync(path.join(OUT, slug), { recursive: true });
    if (writeIfChanged(path.join(OUT, slug, "index.html"), projectPage(slug, data))) written++;
    published.push(project);
    keep.add(slug);
  }

  // Borrar paginas de proyectos que ya no estan en home.json
  let removed = 0;
  for (const entry of fs.readdirSync(OUT)) {
    if (!keep.has(entry) && fs.statSync(path.join(OUT, entry)).isDirectory()) {
      fs.rmSync(path.join(OUT, entry), { recursive: true, force: true });
      removed++;
    }
  }

  // index.html
  const indexFile = path.join(ROOT, "index.html");
  let index = fs.readFileSync(indexFile, "utf8");
  index = replaceBlock(index, "head", homeHead(home));
  index = replaceBlock(index, "links", homeLinks(published));
  index = replaceBlock(index, "chrome", siteChrome({ isHome: true }));
  const homeChanged = writeIfChanged(indexFile, index);

  // sitemap.xml y robots.txt
  const urls = [`${SITE_URL}/`, ...published.map((p) => `${SITE_URL}/proyectos/${p.slug}/`)];
  writeIfChanged(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`
  );
  writeIfChanged(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log(
    `[build] ${published.length} proyectos | ${written} paginas escritas | ${removed} eliminadas | index.html ${
      homeChanged ? "actualizado" : "sin cambios"
    }`
  );
}

main();
