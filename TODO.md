# TODO

## pendiente
- repo de Andrea: sigue con la estructura de antes (`data/<slug>/<slug>.json`, la Action commitea `proyectos/`). Pasarle esta versión ya no pide Settings → Pages: la publica Workers Builds en su Cloudflare. Con el ok de manu, `TRASPASO.md`
- preguntar a Andrea por el orden de las fotos: en 8 proyectos (vozMal, fleaMarket, lostLetter, tawla, henshin, diario, arcEnPix, dearxx) `photos` va 1, 10, 11… 2, 3 (orden alfabético, no numérico). ¿es a propósito?
- dar de alta andreacarilla.work en Google Search Console y enviar `sitemap.xml`

## hecho (2026-10)
- receta del 2026-10-18: transición de la casa, sharp (fuera ffmpeg), los dos hostings (base por `GITHUB_ACTIONS`, guarda en la Action, `wrangler.jsonc`), JSON Schema (`schema/`), ocultos, la vista previa enseña los errores, issue y `CLAUDE.md` si falla, `engines` y `package-lock.json`, `TRASPASO.md`
- nombres de la casa: `projects/<slug>/project.json` + `img/`, `data/site.json` (con `lists` y `gallery`) y `data/about.json`; campos en inglés; fotos por número
- build a `dist/` (sin commitear) con validación y mensajes en castellano; publica la Action en Pages; og:image 1200×630 con ffmpeg
- formateador con los campos nuevos; `GUIA.md` para Andrea
- SEO: todo el contenido en el html, meta + og + canonical + json-ld, sitemap.xml y robots.txt
- accesibilidad: `<main>`, h1 por página, popup con foco y Escape, `aria-pressed` en filtros, imágenes con alt, width/height y lazy
- enlaces de la home sin solaparse y con carga suave; portadas con fundido
- vista previa con Live Server sin build (build/preview.mjs, misma plantilla que el build)
