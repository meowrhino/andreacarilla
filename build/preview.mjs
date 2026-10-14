// preview.mjs - solo en local, abriendo la carpeta con Live Server
//
// Lo publicado son las paginas que escribe build.mjs en dist/. Para ver un
// cambio sin ejecutar el build, index.html y proyecto.html (las plantillas,
// con data-preview) se pintan aqui leyendo los json en vivo, con la misma
// plantilla que usa el build. Live Server recarga al guardar un json.

import { escapeHtml, homeData, homeLinks, listedProjects, projectMain, projectName, siteChrome } from "./paginas.mjs";

async function get(file) {
  const response = await fetch(file, { cache: "no-store" });
  if (!response.ok) throw new Error(`no existe ${file}`);
  return response.json(); // si falta una coma, el error dice donde
}

const hrefOf = (slug) => `./proyecto.html?slug=${encodeURIComponent(slug)}`;

export async function preview() {
  const main = document.querySelector("main");
  try {
    const [site, about] = await Promise.all([get("data/site.json"), get("data/about.json")]);
    const listed = listedProjects(site);
    const isHome = document.body.dataset.pageType === "home";
    document.body.insertAdjacentHTML("beforeend", siteChrome(site, about, { isHome }));

    if (isHome) {
      const projects = await Promise.all(
        listed.map(async (entry) => ({ ...(await get(`projects/${entry.slug}/project.json`)), ...entry }))
      );
      document.getElementById("links-container").innerHTML = homeLinks(projects, hrefOf);
      const data = document.createElement("script");
      data.type = "application/json";
      data.id = "home-data";
      data.textContent = JSON.stringify(homeData(site, projects, hrefOf));
      document.head.append(data);
    } else {
      const slug = new URLSearchParams(location.search).get("slug");
      const entry = listed.find((p) => p.slug === slug) || { slug };
      const p = { ...(await get(`projects/${slug}/project.json`)), ...entry };
      main.innerHTML = projectMain(p);
      document.title = `${projectName(p)} · ${site.title}`;
    }
    console.info("[vista previa] pintado desde los json");
  } catch (error) {
    main.insertAdjacentHTML(
      "afterbegin",
      `<p style="padding: 2rem; color: red;">vista previa: ${escapeHtml(error.message)}</p>`
    );
  }
}
