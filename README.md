# andrea carilla - web con estructura json

## descripción

web de andrea carilla con estructura basada en json. los proyectos se cargan dinámicamente desde archivos json mediante javascript.

## estructura

```
andreacarilla_web/
├── index.html              # página principal (home)
├── proyecto.html           # solo redirige enlaces antiguos ?slug=
├── build.js                # genera proyectos/<slug>/index.html
├── proyectos/              # GENERADO, no editar a mano
│   ├── 8kito/index.html
│   └── ...
├── css/
│   └── style.css           # estilos de la web
├── js/
│   ├── main.js             # javascript principal
│   └── components.js       # componentes y renderizado
├── _portada/               # imágenes de la galería home
│   ├── 1/
│   ├── 2/
│   └── 3/
└── data/
    ├── home.json           # configuración global
    ├── 8kito/
    │   ├── 8kito.json      # datos del proyecto
    │   └── img/            # imágenes del proyecto
    ├── aines/
    │   ├── aines.json
    │   └── img/
    └── ...                 # 24 proyectos en total
```

## funcionamiento

### página home (index.html)

- galería de imágenes posicionadas absolutamente (sets definidos en `data/home.json`)
- lista de proyectos con filtros por categoría (datos de `projectes_visibles` en `data/home.json`)
- navegación entre 3 sets de galería
- botón "refrescar" que mezcla aleatoriamente los proyectos

### página de proyecto (proyectos/{slug}/)

cada proyecto tiene su propia página en `proyectos/{slug}/index.html`. **son
archivos generados: no se editan a mano.** los crea `build.js` a partir de los
json, y el GitHub Action los regenera solo en cada push que toque `data/`.

existen porque los scrapers de whatsapp, instagram, facebook o twitter no
ejecutan javascript: si los meta se inyectan en cliente, al compartir el enlace
sale una tarjeta vacía. estas páginas llevan el `<head>` ya escrito (título,
descripción, `og:image`, `canonical`, json-ld) y el cuerpo lo sigue montando el
javascript igual que antes.

`proyecto.html?slug=8kito` sigue funcionando: redirige a `proyectos/8kito/`.

cada página:
1. lee el slug de `data-slug` en el `<body>`
2. carga el json desde `data/{slug}/{slug}.json`
3. renderiza dinámicamente el contenido según los campos presentes
4. soporta dos tipos de layout:
   - **proyecto**: con header, descripción, metadata y galería
   - **diario**: solo galería de imágenes

### estructura json de proyectos

todos los campos son opcionales excepto `slug`:

```json
{
  "slug": "8kito",
  "titulo": "8kito",
  "primera_imatge": {
    "src": "./img/1.webp"
  },
  "descripcion": {
    "es": ["párrafo 1", "párrafo 2"]
  },
  "tipo_proyecto": "artist image",
  "fecha": {
    "mes": "diciembre",
    "anio": "2024"
  },
  "ubicacion": "barcelona",
  "creditos": [
    {
      "nombre": "andrea carilla",
      "rol": "photography, retouch",
      "link": ""
    }
  ],
  "imatges": [
    "./img/2.webp"
  ],
  "configuracion": {
    "mostrar_header": true,
    "mostrar_meta": true,
    "tipo_layout": "proyecto"
  }
}
```

las entradas de `imatges` suelen ser rutas (strings); si necesitas un `alt` específico en la galería, puedes usar objetos con `src` y `alt`. El `alt` se genera automáticamente cuando no se define. En la portada, el `alt` también se genera automáticamente.

## características

### renderizado dinámico

el javascript (`components.js`) lee el json y renderiza:
- imagen principal (si existe)
- descripción con html (si existe)
- metadata estructurada (tipo, fecha, ubicación, créditos)
- galería de imágenes

### casos especiales

- **proyecto "diario"**: sin header ni metadata, solo galería
- **descripciones con html**: soporta enlaces, párrafos con estilos
- **múltiples colaboradores**: array flexible de créditos

### ventajas

1. **mantenimiento fácil**: editar un json es más simple que html
2. **consistencia**: todos los proyectos siguen la misma estructura
3. **flexibilidad**: campos opcionales permiten diferentes tipos de proyectos
4. **escalabilidad**: fácil añadir nuevos campos sin romper proyectos existentes
5. **organización**: cada proyecto tiene su carpeta con json e imágenes

## cómo usar

### servidor local

para probar la web localmente, necesitas un servidor http:

```bash
# con python 3
python3 -m http.server 8000

# con node.js
npx http-server -p 8000

# luego abrir: http://localhost:8000
```

### añadir un nuevo proyecto

1. crear carpeta `data/nuevo-proyecto/`
2. crear archivo `data/nuevo-proyecto/nuevo-proyecto.json` con los datos
3. crear carpeta `data/nuevo-proyecto/img/` y copiar imágenes
4. añadir entrada en `data/home.json` en `projectes_visibles` (no hace falta tocar JS):
```json
{
  "slug": "nuevo-proyecto",
  "name": "nombre legible",
  "category": "categoría",
  "visible": true
}
```
5. opcional: añadir una portada en alguno de los `gallerySets` de `data/home.json` (para que salga en la galería principal).

la página `proyectos/nuevo-proyecto/index.html` se genera sola al hacer push.
si trabajas en local y quieres verla antes de subir, ejecuta `node build.js`.

las imágenes se convierten a webp con <https://meowrhino.github.io/imgToWeb/>,
con los valores por defecto: lado largo máximo 2000px y calidad 85.

### modificar un proyecto

1. editar el archivo json en `data/{slug}/{slug}.json`
2. reemplazar imágenes en `data/{slug}/img/` si es necesario
3. recargar la página

### ocultar un proyecto

en `data/home.json`, cambiar:
```json
"visible": true
```
por:
```json
"visible": false
```

## compatibilidad

- funciona igual que la versión html original
- mantiene todos los estilos css existentes
- preserva la funcionalidad de navegación y filtros
- compatible con todos los navegadores modernos

## notas técnicas

- los json están en `data/{slug}/` junto con sus imágenes
- el javascript usa es6 modules (`type="module"`)
- las rutas son relativas (`./css/`, `data/...`), funciona igual en dominio raíz o subcarpeta (GitHub Pages)
- las páginas de `proyectos/` llevan `<base href="../../">`, por eso las rutas relativas siguen funcionando desde una subcarpeta
- `build.js` no depende de nada externo: lee los json tal cual y saca las medidas de cada imagen del propio fichero webp
- las medidas van incrustadas en el `<head>` como `#img-sizes` para reservar el hueco de cada imagen y que la página no salte al cargar
- `build.js` deduce la url del sitio del `CNAME`, y si no hay, del remote de git

## créditos

- **fotografía y dirección creativa**: andrea carilla
- **desarrollo web**: meowrhino
- **estructura json**: basada en el sistema de miranda perez hita
