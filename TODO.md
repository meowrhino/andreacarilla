# TODO

## pendiente
- pasar los cambios de esta copia al repo de Andrea (carillagonzalezandrea-source/andreacarilla), poco a poco
- revisar `formateador.html` (700 líneas) con la misma lupa: no se ha tocado en esta pasada
- preguntar a Andrea por el orden de las fotos: en 8 proyectos (vozMal, fleaMarket, lostLetter, tawla, henshin, diario, arcEnPix, dearxx) `imatges` va 1, 10, 11… 2, 3 (orden alfabético, no numérico). ¿es a propósito?
- dar de alta andreacarilla.work en Google Search Console y enviar `sitemap.xml`

## hecho (2026-10)
- SEO: todo el contenido en el html (build.js), meta + og + canonical + json-ld en todas las páginas, sitemap.xml y robots.txt
- canonical de la copia apuntando a andreacarilla.work
- accesibilidad: `<main>`, h1 por página, popup con foco y Escape, `aria-pressed` en filtros, imágenes con alt, width/height y lazy
- enlaces de la home sin solaparse y con carga suave; portadas con fundido
- js: components.js eliminado (el html ya viene hecho); main.js (popup) + home.js (home)
- css ordenado por secciones, sin reglas muertas; diario adaptado a móvil
