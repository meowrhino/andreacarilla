# andrea carilla

Portfolio de **Andrea Carilla** ([andreacarilla.work](https://andreacarilla.work)).
Sigue la receta de [meowrhino/JAMstack](https://github.com/meowrhino/JAMstack):
el contenido vive en JSON, `build/build.mjs` escribe la web entera en `dist/`
y el navegador recibe HTML con todo dentro. Sin dependencias.

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
├── build/
│   ├── build.mjs          lee, valida y escribe dist/
│   ├── paginas.mjs        json → html. La usan el build y la vista previa
│   └── preview.mjs        Live Server sin build: pinta desde los json
├── js/main.js             todas las páginas: popup "andrea carilla"
├── js/home.js             la home: galería, enlaces repartidos y filtros
├── css/style.css
├── formateador.html       formulario que escribe un project.json
└── GUIA.md                para Andrea
```

## cómo funciona

- **el build** (`node build/build.mjs`) escribe en `dist/` la home, una página
  por proyecto (`projects/<slug>/`), su `og.jpg` de 1200×630 (ffmpeg, en caché
  en `.cache/`), sitemap y robots. si algo no cuadra (un JSON roto, una foto que
  no existe, un proyecto de `lists` sin carpeta) para con un mensaje en
  castellano y no escribe nada.
- **la Action** (`.github/workflows/deploy.yml`) lo ejecuta en cada push y
  publica `dist/` en GitHub Pages (Settings → Pages → Source: **GitHub Actions**).
- **el JS** solo hace lo que no es contenido: colocar las portadas de la home
  (con la medida que deja el build en `#home-data`), repartir los enlaces sin
  que se pisen, filtros, botones 1/2/3, popup. sin JS la web se lee entera.
- **vista previa**: Live Server sobre la carpeta. `index.html` y `proyecto.html`
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
- las URLs absolutas salen de `url` en `data/site.json`: siempre
  `https://andreacarilla.work/`, también en la copia de meowrhino
  (`meowrhino.github.io/andreacarilla`), así su canonical apunta al original y
  Google no indexa dos webs iguales

## los dos repos

- `carillagonzalezandrea-source/andreacarilla`: el de Andrea, con el dominio
  (`CNAME`). ahí edita ella.
- `meowrhino/andreacarilla`: nuestra copia. no comparten historia: los cambios
  se pasan copiando el árbol (y antes, trayendo su `projects/`, `data/` y
  `_portada/` si ella ha tocado algo).

## créditos

- **fotografía y dirección creativa**: andrea carilla
- **desarrollo web**: meowrhino
