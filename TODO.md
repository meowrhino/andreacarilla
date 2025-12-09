# TODO

## Bloqueos (prioridad alta)
- Arreglar rutas absolutas (`/data/...`, `/proyecto.html`, `/index.html`) para que funcionen en subcarpeta/GitHub Pages y evitar el error `Unexpected token '<'` en home.json. Propuesta: usar `const base = document.querySelector('base')?.href || window.location.origin + window.location.pathname.replace(/\\/[^/]*$/, '/')` y construir URLs relativas, o añadir `<base href="/">` solo si se sirve en raíz.
- Añadir fallback `<noscript>` mínimo en `index.html` y `proyecto.html` para crawlers sin JS.

## SEO / Social
- Incluir en `index.html` y `proyecto.html`: `meta description`, `og:title/description/type/url`, `og:image`, `twitter:card`, `link rel="canonical"`. En proyectos, poblar dinámicamente con título, primer párrafo y primera imagen.
- Añadir `<h1>` visible (home + cada proyecto) y jerarquía de headings en descripciones.
- Generar JSON-LD: `Person` (Andrea) + `WebSite` en home; `CreativeWork`/`ImageObject` por proyecto con título/fecha/colaboradores.

## Accesibilidad
- Portadas del home: `alt` descriptivo (nombre del proyecto/tema) y `loading="lazy"` + dimensiones para evitar CLS.
- Botones de tema/categoría/popup/home: `aria-label`, foco inicial en popup y cierre con Escape; añadir `rel="noopener noreferrer"` en enlaces externos.

## Contenido y layout de proyecto
- En `renderProject`: renderizar `<main>` + `<h1>` con título del proyecto antes de la descripción/galería.
- Añadir `noscript` con mensaje “cargando proyecto…” y enlaces básicos a home.

## CSS
- Ajustar `.diario-gallery` para móvil (`width: min(80vw, 512px)`, evitar `position: fixed` en pantallas pequeñas). Limpiar reglas redundantes (`flex-direction` sobre grid, doble `display` en `.footer`).

## Documentación
- Reescribir `README.md` para reflejar que solo hay que tocar `data/home.json` al añadir proyectos; documentar despliegue en subcarpeta y SEO/OG.

## Verificación
- Probar en servidor local y en entorno simulado de subcarpeta (ej.: servir en `/andreacarilla/`) para confirmar rutas.
- Revisar que las cards OG/Twitter muestran la imagen y texto correctos para home y un proyecto.
