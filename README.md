# andrea carilla

Portfolio de **Andrea Carilla** ([andreacarilla.work](https://andreacarilla.work)).
Sigue la receta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack):
el contenido vive en JSON, `build/build.mjs` escribe la web entera en `dist/`
y el navegador recibe HTML con todo dentro. La única dependencia, `sharp`
(las imágenes para compartir): `npm ci`.

**Para actualizar la web (Andrea): [GUIA.md](GUIA.md).**

## regla de oro

**solo se tocan `projects/`, `data/` y `_portada/`.** lo demás es el código.

## estructura

```
andreacarilla/
├── projects/<slug>/       un proyecto, una carpeta
│   ├── project.json       title, short, url, place, date, text, credits, cover, photos (layout)
│   └── img/               1.webp, 2.webp… (imgToWeb)
├── data/
│   ├── site.json          title, url, description, email, social; lists (el índice:
│   │                      qué sale, en qué categoría y en qué orden); gallery (la home)
│   └── about.json         el texto del popup "andrea carilla"
├── _portada/1/ 2/ 3/      las fotos de la galería de la home (1.webp, 2.webp…)
├── index.html             plantilla de la home: los <!-- build:x --> los rellena el build
├── proyecto.html          plantilla para la vista previa (en dist/, redirige ?slug=)
├── schema/                site.json, about.json, project.json: qué campos hay (VS Code y el build)
├── build/
│   ├── build.mjs          lee, valida y escribe dist/
│   ├── paginas.mjs        json → html. La usan el build y la vista previa
│   ├── validar.mjs        el esquema y que estén las fotos: build y vista previa
│   └── preview.mjs        Live Server sin build: pinta desde los json
├── js/main.js             todas las páginas: popup "andrea carilla"
├── js/home.js             la home: galería, enlaces repartidos y filtros
├── js/transicion.js       la transición de la casa (con css/transicion.css)
├── css/style.css
├── tools/imgToWeb/        copia de imgToWeb, con sus librerías dentro
├── formateador.html       formulario que escribe un project.json
├── wrangler.jsonc         la copia de Andrea → Workers Builds (su Cloudflare)
├── GUIA.md                para Andrea
├── TRASPASO.md            pasarle esta versión a su copia
└── CLAUDE.md              si el build falla
```

## cómo funciona

- **el build** (`node build/build.mjs`) escribe en `dist/` la home, una página
  por proyecto (`projects/<slug>/`), su `og.jpg` de 1200×630 (sharp, en caché
  en `.cache/`), sitemap y robots. si algo no cuadra (un JSON roto, un campo
  que no dice `schema/`, una foto que no existe, un proyecto de `lists` sin
  carpeta) para con un mensaje en castellano y no escribe nada.
- **dos sitios, el mismo repo**: en nuestra copia, la Action
  (`.github/workflows/deploy.yml`, solo si el dueño es `meowrhino`) publica en
  `meowrhino.github.io/andreacarilla/` con `noindex` (el build mira
  `GITHUB_ACTIONS`); en la de Andrea, Workers Builds (`wrangler.jsonc`) en la
  raíz con el `url` de `site.json`. si la Action falla, abre un issue con el
  error (y lo cierra al volver a publicar); cómo arreglarlo, `CLAUDE.md`.
- **ocultos**: en `lists`, `{ "project": "x", "visible": false }`: tiene su
  página (con `noindex`) pero no sale en la home ni en el sitemap.
- **transición**: la de la casa (JAMstack, patrones §6c), sin dibujo propio:
  fundido al blanco.
- **el JS** solo hace lo que no es contenido: colocar las portadas de la home
  (con la medida que deja el build en `#home-data`), repartir los enlaces sin
  que se pisen, filtros, botones 1/2/3, popup. sin JS la web se lee entera.
- **vista previa**: Live Server sobre la carpeta. lo que pararía el build
  (schema, una foto que falta) sale en pantalla en vez de la página. `index.html` y `proyecto.html`
  llevan `data-preview` y `main.js` carga `build/preview.mjs`, que pinta con
  la misma plantilla leyendo los JSON en vivo. los enlaces van a
  `proyecto.html?slug=x`. el build quita `data-preview`.
- **textos**: mini-markdown (`**negrita**`, `*cursiva*`, `[link](url)`); lo
  demás se escapa.
- **direcciones antiguas**: `proyectos/<slug>/` y `proyecto.html?slug=` llevan a
  `projects/<slug>/`.

## seo

- cada página lleva `title`, `description`, `og:*`, `twitter:*`, `canonical` y
  json-ld (`Person` + `WebSite` en la home, `CreativeWork` en cada proyecto)
- las URLs absolutas salen de `url` en `data/site.json`
  (`https://andreacarilla.work/`); en nuestra copia, de
  `meowrhino.github.io/andreacarilla/`, con `noindex` en cada página y en
  `robots.txt`

## los dos repos

- `carillagonzalezandrea-source/andreacarilla`: el de Andrea, con el dominio
  (`CNAME`). ahí edita ella. **sigue con la estructura de antes**
  (`data/<slug>/<slug>.json`, `home.json`, la Action commitea `proyectos/`) y
  su propia `GUIA.md`. esta versión la publica Workers Builds en su
  Cloudflare (no hace falta tocar Settings → Pages): `TRASPASO.md`.
- `meowrhino/andreacarilla`: nuestra copia. no comparten historia: los cambios
  se pasan copiando el árbol (y antes, trayendo su `projects/`, `data/` y
  `_portada/` si ella ha tocado algo).

## créditos

- **fotografía y dirección creativa**: andrea carilla
- **desarrollo web**: meowrhino
