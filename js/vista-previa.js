// vista-previa.js - solo en local (Live Server, localhost o 127.0.0.1)
//
// Lo publicado son paginas ya generadas por build.js. En local eso obligaria a
// ejecutar el build para ver cada cambio, asi que aqui se vuelve a pintar el
// contenido leyendo los json en vivo, con la misma plantilla que usa el build.
// Live Server recarga al guardar un json y el cambio se ve al momento.

import { escapeHtml, homeLinks, projectMain, projectTitle, visibleProjects } from "./plantillas.js";

// Pagina de proyecto: rehace <main> con lo que diga ahora el json
export async function previewProject(slug) {
  const main = document.querySelector("main");
  try {
    const response = await fetch(`data/${slug}/${slug}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`no existe data/${slug}/${slug}.json`);
    const data = await response.json(); // si falta una coma, el error dice donde
    data.slug = slug;
    main.innerHTML = projectMain(slug, data);
    document.title = `${projectTitle(data)} · andrea carilla`;
    console.info(`[vista previa] ${slug} pintado desde su json`);
  } catch (error) {
    main.innerHTML = `<p style="padding: 2rem; color: red;">vista previa de ${escapeHtml(slug)}: ${escapeHtml(
      error.message
    )}</p>`;
  }
}

// Home: rehace los enlaces con lo que diga ahora home.json. Los proyectos que
// aun no tienen pagina generada se abren con proyecto.html?slug=, que en
// local tambien pinta desde el json
export function previewHomeLinks(home, container) {
  const generated = new Set([...container.querySelectorAll(".project-link")].map((a) => a.getAttribute("href")));
  container.innerHTML = homeLinks(visibleProjects(home), (slug) =>
    generated.has(`./proyectos/${slug}/`) ? `./proyectos/${slug}/` : `./proyecto.html?slug=${encodeURIComponent(slug)}`
  );
  console.info("[vista previa] enlaces de la home pintados desde home.json");
}
