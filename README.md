# andrea carilla - web con estructura json

## regla de oro

**solo se tocan `data/` y `_portada/`.** todo lo demás que lleva contenido
(`proyectos/`, los bloques marcados de `index.html`, `sitemap.xml`,
`robots.txt`) lo escribe `build.js`, y la GitHub Action lo ejecuta sola en cada
push que toque `data/`.

## estructura

```
andreacarilla/
├── index.html              # home. Los bloques <!-- build:x --> los rellena build.js
├── proyecto.html           # solo redirige enlaces antiguos ?slug=
├── build.js                # json → html (proyectos, home, sitemap, robots)
├── proyectos/              # GENERADO, no editar a mano
│   ├── 8kito/index.html
│   └── ...
├── sitemap.xml, robots.txt # GENERADOS
├── formateador.html        # editor de proyectos: rellenas el formulario y sale el json
├── css/style.css
├── package.json            # solo dice a node que los .js son módulos (sin dependencias)
├── js/
│   ├── main.js             # todas las páginas: popup "andrea carilla"
│   ├── home.js             # solo la home: galería, enlaces y filtros
│   ├── plantillas.js       # json → html. La usan build.js y la vista previa
│   └── vista-previa.js     # solo en local: pinta desde los json en vivo
├── _portada/               # imágenes de la galería de la home (1/, 2/, 3/)
└── data/
    ├── home.json           # lista de proyectos + sets de la galería
    └── <slug>/
        ├── <slug>.json     # datos del proyecto
        └── img/            # imágenes del proyecto
```

## cómo funciona

el navegador recibe el html con el contenido ya escrito (textos, créditos,
imágenes con su tamaño, enlaces, bio). así google lo lee entero y al compartir
un enlace por whatsapp o instagram sale la tarjeta con su título e imagen. el
javascript solo hace lo que no es contenido:

- **home**: coloca las portadas de la galería (posiciones de `data/home.json`),
  reparte los enlaces a proyectos al azar sin que se pisen, filtros por
  categoría, botones 1/2/3 de galería y "refrescar"
- **todas las páginas**: abrir y cerrar el popup "andrea carilla" (también con Escape)

si el javascript falla, la web se sigue leyendo: los enlaces salen en fila y
cada proyecto se ve completo.

### seo

- cada página lleva `title`, `description`, `og:*`, `twitter:*`, `canonical` y json-ld
  (`Person` + `WebSite` en la home, `CreativeWork` en cada proyecto)
- `sitemap.xml` con la home y todos los proyectos visibles; `robots.txt` apunta a él
- las urls siempre son de `https://andreacarilla.work`, también en la copia de
  meowrhino (`meowrhino.github.io/andreacarilla`): así el canonical de la copia
  apunta al original y google no indexa dos webs iguales
- la descripción de la home está en `HOME_DESCRIPTION`, arriba de `build.js`

## estructura json de proyectos

todos los campos son opcionales excepto `slug` (que es el nombre de la carpeta):

```json
{
  "slug": "8kito",
  "titulo": "8kito",
  "primera_imatge": {
    "src": "./img/1.webp"
  },
  "descripcion": {
    "titulo": "título de la descripción",
    "link": "https://... (opcional, el título enlaza aquí)",
    "texto": ["párrafo 1", "párrafo 2 con <b>negrita</b> o <a href=\"...\">enlace</a>"]
  },
  "tipo_proyecto": "artist image",
  "fecha": "diciembre 2024",
  "ubicacion": "barcelona",
  "creditos": [
    {
      "nombre": "andrea carilla",
      "rol": "photography, retouch",
      "link": ""
    }
  ],
  "imatges": [
    "./img/2.webp",
    { "src": "./img/3.webp", "alt": "descripción de la foto" }
  ],
  "configuracion": {
    "mostrar_header": true,
    "mostrar_meta": true,
    "tipo_layout": "proyecto"
  }
}
```

- `texto` y `ubicacion` admiten html (lo que sale del formateador)
- `fecha` puede ser texto libre o `{ "mes": "diciembre", "anio": "2024" }` (el año sale en gris)
- `imatges`: rutas, u objetos con `src` y `alt` si quieres un texto alternativo propio;
  si no, se genera solo
- `tipo_layout: "diario"`: sin cabecera ni créditos, solo una tira horizontal de fotos
- `mostrar_header` / `mostrar_meta` a `false` ocultan la imagen principal / los créditos

## cómo usar

### añadir un nuevo proyecto

1. crear `data/nuevo-proyecto/nuevo-proyecto.json` (con el formateador)
2. meter las imágenes en `data/nuevo-proyecto/img/`, pasadas por
   <https://meowrhino.github.io/imgToWeb/> con los valores por defecto (lado
   largo máximo 2000px, calidad 85)
3. añadir la entrada en `data/home.json`, en `projectes_visibles`:
   ```json
   {
     "slug": "nuevo-proyecto",
     "name": "nombre legible",
     "category": "categoría",
     "visible": true
   }
   ```
4. opcional: añadir una portada en alguno de los `gallerySets` de `data/home.json`
5. push. la action genera `proyectos/nuevo-proyecto/index.html`, añade el enlace
   en la home y lo mete en el sitemap

### modificar u ocultar un proyecto

- modificar: editar `data/{slug}/{slug}.json` o sus imágenes y hacer push
- ocultar: en `data/home.json`, `"visible": false`. su página se borra en el siguiente build

### verlo en local antes de subir (Live Server)

igual que siempre: abrir la carpeta en VS Code y darle a "Go Live". al guardar
un json, Live Server recarga y el cambio se ve al momento, **sin ejecutar nada**.

cómo: en local (`localhost` / `127.0.0.1`) el javascript vuelve a pintar el
contenido leyendo los json en vivo, con la misma plantilla que usa el build
(`js/plantillas.js`). los proyectos nuevos que aún no tienen página salen en
la home y se abren con `proyecto.html?slug=...`. si un json tiene un error, la
página lo dice con la línea y la columna. en la web publicada esto no se
carga: allí se sirve el html generado.

si un json tiene un error (una coma que falta), `build.js` lo dice con el
nombre del archivo, deja la página de ese proyecto como estaba y la action sale
en rojo. el resto de la web no se rompe.

## notas técnicas

- sin dependencias: `build.js` es node puro y saca el tamaño de cada imagen del propio webp
- cada `<img>` lleva `width` y `height` reales para que la página no salte al cargar;
  las portadas de la home los leen de `#img-sizes` en el `<head>`
- las rutas son relativas (`./css/`, `data/...`): funciona igual en dominio raíz o en
  subcarpeta. las páginas de `proyectos/` llevan `<base href="../../">` por eso
- la web es siempre blanca (`color-scheme: light`), también con el modo oscuro del sistema
- `proyecto.html?slug=8kito` sigue funcionando: redirige a `proyectos/8kito/`

## créditos

- **fotografía y dirección creativa**: andrea carilla
- **desarrollo web**: meowrhino
- **estructura json**: basada en el sistema de miranda perez hita
