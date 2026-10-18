// preview.mjs - solo en local, abriendo la carpeta con Live Server
//
// Lo publicado son las paginas que escribe build.mjs en dist/. Para ver un
// cambio sin ejecutar el build, index.html y proyecto.html (las plantillas,
// con data-preview) se pintan aqui leyendo los json en vivo, con la misma
// plantilla que usa el build. Live Server recarga al guardar un json.

import { escapeHtml, homeData, homeLinks, listedProjects, photoPath, portadaPath, projectMain, projectName, siteChrome } from "./paginas.mjs";
import { cargar, leerJSON, validar } from "./validar.mjs";

// Un JSON de la carpeta, o undefined si no esta; si esta roto, lo dice
async function get(file) {
  const response = await fetch(file, { cache: "no-store" });
  return response.ok ? leerJSON(await response.text(), file) : undefined;
}

// Si esta una foto (sin bajarla: HEAD)
const exists = async (file) => (await fetch(file, { method: "HEAD", cache: "no-store" }).catch(() => null))?.ok;

// Lo que pararia el build, en vez de la pagina
class Wrong extends Error {
  constructor(lines) {
    super(lines.join("\n"));
    this.lines = lines;
  }
}

const hrefOf = (slug) => `./proyecto.html?slug=${encodeURIComponent(slug)}`;

// Lee todo y lo comprueba como el build: schema/ y que esten las fotos
async function load() {
  const schemas = Object.fromEntries(
    await Promise.all(["site", "about", "project"].map(async (t) => [t, await get(`schema/${t}.json`)]))
  );
  const [site, about] = await Promise.all([get("data/site.json"), get("data/about.json")]);
  if (!site || !about) throw new Wrong(["Falta data/site.json o data/about.json."]);
  const invalid = [...validar(site, schemas.site, "data/site.json"), ...validar(about, schemas.about, "data/about.json")];
  if (invalid.length) throw new Wrong(invalid);

  const files = new Map(
    await Promise.all(
      listedProjects(site).map(async ({ slug }) => {
        const file = `projects/${slug}/project.json`;
        return [file, await get(file)];
      })
    )
  );
  for (const [file, data] of files) if (data) invalid.push(...validar(data, schemas.project, file));
  if (invalid.length) throw new Wrong(invalid);

  // el navegador no puede mirar que hay en una carpeta: se piden las fotos que nombran los JSON
  const wanted = [
    ...listedProjects(site).flatMap(({ slug }) => {
      const data = files.get(`projects/${slug}/project.json`);
      return data ? [...(data.cover || []), ...(data.photos || [])].map((n) => photoPath(slug, n)) : [];
    }),
    ...(site.gallery || []).flatMap((set, i) => set.map((item) => portadaPath(i, item.photo))),
  ];
  const found = new Set((await Promise.all(wanted.map(async (f) => (await exists(f)) && f))).filter(Boolean));
  const { projects, errors } = cargar(site, { json: (f) => files.get(f), exists: (f) => found.has(f) });
  if (errors.length) throw new Wrong(errors);
  return { site, about, projects };
}

export async function preview() {
  const main = document.querySelector("main");
  try {
    const { site, about, projects } = await load();
    const isHome = document.body.dataset.pageType === "home";
    document.body.insertAdjacentHTML("beforeend", siteChrome(site, about, { isHome }));

    if (isHome) {
      document.getElementById("links-container").innerHTML = homeLinks(projects, hrefOf);
      const data = document.createElement("script");
      data.type = "application/json";
      data.id = "home-data";
      data.textContent = JSON.stringify(homeData(site, projects, hrefOf));
      document.head.append(data);
    } else {
      const slug = new URLSearchParams(location.search).get("slug");
      const p = projects.find((p) => p.slug === slug);
      if (!p) throw new Wrong([`No hay ningún proyecto «${slug}» en «lists» de data/site.json.`]);
      main.innerHTML = projectMain(p);
      document.title = `${projectName(p)} · ${site.title}`;
    }
    console.info("[vista previa] pintado desde los json");
  } catch (error) {
    // en vez de la pagina, lo que esta mal, como lo diria el build
    const lines = error.lines || [error.message];
    document.body.removeAttribute("data-page-type");
    document.body.innerHTML = `<main style="padding: clamp(24px, 6vw, 80px); font: 18px/1.5 system-ui, sans-serif">
<h1 style="font-weight: 400; color: #c00">${error.lines ? "Así no se publicaría" : error.json ? "Hay un error en un JSON" : "La vista previa ha fallado"}</h1>
${lines.map((l) => `<p style="max-width: 70ch">✗ ${escapeHtml(l)}</p>`).join("\n")}
<p>Arréglalo y guarda: esta página se recarga sola.</p>
</main>`;
  }
}
