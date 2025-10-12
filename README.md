# Portfolio de Andrea Carilla — Guía de mantenimiento

Sitio **estático**, fácil de mantener y extender. HTML + CSS + **JS vanilla**. Un pequeño “builder” inyecta navegación, bio y galerías por convención de carpetas. Este documento explica **cómo está formada la web** y **cómo añadir proyectos**.

---

## 1. Resumen
- **Stack:** HTML, CSS, JavaScript puro (sin React, sin bundlers).
- **Arquitectura:** `index.html` (home), páginas de proyecto en `proyectos/<slug>/<slug>.html`.
- **Builder:** `js/components.js` y utilidades en `scripts/*.js` (inyectan nav, bio, botón Home y gestionan galerías).
- **Galerías:** imágenes numeradas; se **autodetectan** extensiones y fin de secuencia para evitar parpadeos.

---

## 2. Estructura de carpetas

```
/ (raíz del proyecto)
├─ index.html                    # Home
├─ css/
│  └─ style.css
├─ js/
│  ├─ components.js             # Inyección de nav, popup bio, helpers de galería
│  └─ main.js                   # Inicializaciones generales
├─ scripts/                     # (opcional) homeBtn.js, gallery.js, etc.
└─ proyectos/
   ├─ diario/
   │  ├─ diario.html            # Página del proyecto
   │  └─ img/                   # Imágenes numeradas (1.jpg, 2.jpg, ...)
   ├─ blackCover/
   │  ├─ blackCover.html
   │  └─ img/
   └─ ...
```

> Puede existir `/_portada/<slug>/…` para imágenes de portada que se muestran en la home.

---

## 3. Plantilla de página de proyecto

Crea un HTML por proyecto en `proyectos/<slug>/<slug>.html`. Cambia `data-slug` al nombre de la carpeta.

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Andrea Carilla — Proyecto</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body data-page-type="project" data-slug="miProyecto">
  <main id="project-root">
    <h1 id="project-title"></h1>
    <div id="gallery" class="gallery hidden"></div>
  </main>

  <script src="/js/components.js"></script>
  <script src="/js/projects.js"></script> <!-- opcional, si usas JSON -->
  <script src="/js/main.js"></script>
</body>
</html>
```

---

## 4. Cómo funciona la galería

- El builder carga imágenes numeradas: `proyectos/<slug>/img/1.jpg`, `2.jpg`, … (también `.png`/`.jpeg`).
- Prueba extensiones en orden (`.jpg`, `.png`, …) y detiene al no encontrar la siguiente.
- Muestra el contenedor de galería **después** de resolver la secuencia (sin parpadeos).
- Portadas opcionales en `/_portada/<slug>/1.jpg`.

---

## 5. Añadir un proyecto nuevo (modo simple)

1. Crear carpeta `proyectos/<slug>/`.
2. Crear `proyectos/<slug>/<slug>.html` usando la plantilla (poner `data-slug="<slug>"`).
3. Subir las fotos en `proyectos/<slug>/img/` como `1.jpg`, `2.jpg`, `3.jpg`, …
4. (Opcional) añadir portada en `/_portada/<slug>/1.jpg`.
5. Subir cambios. **Listo.** No hace falta tocar JS.

---

## 6. (Opcional) JSON para autogenerar la home

Si quieres que la home muestre tarjetas automáticamente, añade:

- `data/projects.json`
- `js/projects.js` (incluido de ejemplo en este paquete)

### `data/projects.json` (ejemplo)
```json
{
  "projects": [
    {
      "slug": "diario",
      "title": "Diario",
      "summary": "Serie documental",
      "cover": "/_portada/diario/1.jpg"
    },
    {
      "slug": "blackCover",
      "title": "Black Cover",
      "cover": "/_portada/blackCover/1.jpg"
    }
  ]
}
```

### Hook en `index.html`
```html
<section id="projects-list" class="grid"></section>
<script src="/js/projects.js"></script>
```

---

## 7. Reglas y buenas prácticas
- Cargar imágenes con `loading="lazy"` y `decoding="async"`.
- Botón “home” visible solo fuera de la home (`data-page-type !== "home"`).
- Mantener nombres de carpetas/archivos limpios y consistentes con el `slug`.
- Evitar parpadeos ocultando la galería hasta que esté montada.

---

## 8. Checklist para Andrea
- [ ] Carpeta creada en `proyectos/<slug>/`
- [ ] HTML principal en `proyectos/<slug>/<slug>.html` con `data-slug`
- [ ] Fotos numeradas en `proyectos/<slug>/img/`
- [ ] (Opcional) portada en `/_portada/<slug>/1.jpg`
- [ ] (Opcional) entrada en `data/projects.json` si usas la home automática

---

## 9. Solución de problemas
- **No aparece la galería:** revisa `data-slug` y que exista `img/1.jpg`.
- **Portada rota:** revisa la ruta de `/_portada/<slug>/1.jpg`.
- **Home vacía (usando JSON):** valida `data/projects.json` (puedes usar jsonlint.com) y que se sirva desde `/data/`.
