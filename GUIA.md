# Cómo actualizar tu web

Hola, Andrea. Esta guía es para que cambies tu web tú misma: añadir un
proyecto, cambiar fotos o textos, cambiar las categorías… Todo se hace con
**Visual Studio Code**, un programa gratuito: cambias los archivos en tu
ordenador y, al subirlos, la web se publica sola.

> **La regla de oro**: solo tocas **tres carpetas**: `projects/` (tus
> proyectos), `data/` (lo general de la web) y `_portada/` (las fotos de la
> home). Lo demás es el código: mejor no tocarlo.

Cuando subes un cambio, la web se actualiza sola en **2 o 3 minutos**. Si te
equivocas en algo, la web **no se rompe**: se queda como estaba hasta que lo
arregles (punto 7, *Si algo va mal*).

---

## 0. Antes de empezar (solo la primera vez)

1. Instala **Visual Studio Code**: https://code.visualstudio.com
2. Ábrelo y trae la web: a la izquierda, el icono de las ramas
   (**Source Control**) → **Clone Repository** → **Clone from GitHub** → entra
   con tu cuenta → elige `carillagonzalezandrea-source/andreacarilla` → elige
   una carpeta de tu ordenador → **Open**. Si te pide instalar Git, acepta.

Desde aquí, la web es esa carpeta: cada vez que abras VS Code, se abre ahí.

Para preparar las fotos, **imgToWeb**: https://meowrhino.github.io/imgToWeb/
(las pasa al formato de la web, `.webp`, del tamaño justo, y las numera:
`1.webp`, `2.webp`…). **Ábrelo en Chrome o Firefox**, no en Safari: Safari no
sabe hacer `.webp` y imgToWeb se salta las fotos.

---

## 1. Cómo está organizado

```
projects/                  ← tus proyectos, uno por carpeta
  tuttiPari/
    project.json           ← los textos del proyecto
    img/                   ← sus fotos: 1.webp, 2.webp, 3.webp…
  diario/
    project.json
    img/
  …
data/
  site.json                ← qué proyectos salen y en qué categoría, tu email,
                             tu Instagram, las fotos de la home
  about.json               ← el texto que sale al pulsar "andrea carilla"
_portada/                  ← las fotos de la home: 1/, 2/, 3/ (los botones 1 2 3)
formateador.html           ← un formulario que te escribe el project.json
```

El **nombre de la carpeta** de un proyecto es su dirección en la web:
`projects/tuttiPari/` → `andreacarilla.work/projects/tuttiPari/`. Sin espacios
ni tildes.

---

## 2. Cómo se hace un cambio con VS Code

1. **Antes de nada, baja la última versión**: en la barra de abajo del todo,
   pulsa las flechas ⟳ (**Sync**).
2. En la columna de la izquierda, abre el archivo (por ejemplo
   `projects/tuttiPari/project.json`) y cambia lo que quieras. Guarda con
   **Cmd+S**. Si algo sale **subrayado en rojo**, hay una coma o unas comillas
   mal: arréglalo antes de seguir (punto 7).
3. A la izquierda, el icono de las ramas (**Source Control**): escribe en una
   línea qué has cambiado ("texto de tutti pari") y pulsa **Commit**.
4. Pulsa **Sync Changes** (el mismo botón azul).

Ya está: en 2-3 minutos sale en la web.

**Para añadir fotos**: arrástralas a su carpeta (por ejemplo
`projects/tuttiPari/img/`) en la columna de la izquierda de VS Code, y luego
los pasos 3 y 4.

---

## 3. Lo que más vas a hacer

### Cambiar un texto de un proyecto

En su `project.json`. Los nombres de los campos van en inglés (`title`, el
título; `text`, el texto…: la tabla del punto 5 los explica todos). El texto es
una **lista de párrafos**, cada uno entre comillas y separados por comas:

```json
"text": [
  "Primer párrafo.",
  "Segundo párrafo, con **negrita**, *cursiva* y un [link](https://www.instagram.com/usuario/)."
]
```

### Cambiar el orden de las fotos, o quitar una

En `photos`, el orden es el de la página. Las fotos van por su **número**
(`"5"` es la `5.webp` de su carpeta `img/`). Para cambiar el orden, mueve los
números; para quitar una, bórrala de la lista (la foto puede quedarse en
`img/`, no pasa nada):

```json
"cover": ["1"],
"photos": ["2", "3", "5", "4", "6"]
```

`cover` es la portada: la foto grande de arriba y la que sale cuando alguien
comparte el enlace por WhatsApp o Instagram.

### Añadir fotos a un proyecto

1. Pásalas por imgToWeb. **Ojo**: imgToWeb las numera desde el 1. Si el
   proyecto ya tiene 16 fotos, cámbiales el nombre a 17, 18… antes de subirlas.
2. Arrástralas a su carpeta `img/`.
3. Añade sus números a `photos` en el `project.json`.

### Cambiar de categoría, cambiar el orden, o esconder un proyecto

En `data/site.json`, en `lists`. Cada categoría tiene su nombre (`name`, el que
sale en los filtros de la home) y sus proyectos (`projects`, el nombre de su
carpeta):

```json
"lists": {
  "artist-image": {
    "name": "artist image",
    "projects": ["presskit8kito", "naciConElDestinoDeUnaRosa", "testigoDelPero"]
  },
  "eventos": {
    "name": "eventos",
    "projects": ["core8kiInvita", "granadaFilmFest", "tuttiPari"]
  }
}
```

- Para **esconder** un proyecto sin borrarlo, quítalo de la lista. Para que
  vuelva, lo pones otra vez.
- Para **cambiarlo de categoría**, lo mueves de una lista a otra.
- Para una **categoría nueva**, copia un bloque entero (desde `"eventos": {`
  hasta su `}`), pégalo debajo con una coma entre los dos, y cámbiale el
  nombre y los proyectos.

### Cambiar el about, tu email o tu Instagram

- El texto, en `data/about.json`: una lista de párrafos, como el de un proyecto.
- El email y el Instagram, en `data/site.json`: `"email"` y `"social"`.

### Cambiar las fotos de la home

Son las carpetas `_portada/1/`, `_portada/2/` y `_portada/3/` (los botones 1 2 3
de la home). Cada foto está en `data/site.json`, en `gallery`, con su número
(`photo`), el proyecto al que lleva (`project`) y dónde se coloca en ordenador
(`desktop`) y en móvil (`mobile`): `top`, `left`, `right`, `bottom` en % de la
pantalla, `scale` el tamaño e `index` cuál va encima. Para cambiar una foto
por otra, basta con sustituir el `.webp` por otro con el mismo nombre.

---

## 4. Añadir un proyecto nuevo

1. **Las fotos**: pásalas por imgToWeb en el orden en que quieras que salgan
   y descarga el zip.
2. **La carpeta**: en VS Code, clic derecho en `projects/` → **New Folder** →
   el nombre (por ejemplo `nuevoProyecto`). Dentro, otra carpeta `img`, y
   arrastra ahí las fotos del zip.
3. **Los textos**: abre `formateador.html` en Chrome (doble clic en el archivo,
   desde la carpeta de la web), rellénalo y pulsa **descargar project.json**.
   Mueve ese archivo a `projects/nuevoProyecto/`. (O copia el `project.json`
   de otro proyecto y cámbialo.)
4. **Que salga**: en `data/site.json`, añade `"nuevoProyecto"` a los
   `projects` de su categoría.
5. Sube el cambio (punto 2, pasos 3 y 4).

Un `project.json`:

```json
{
  "title": "NUEVO PROYECTO",
  "short": "nuevo proyecto",
  "url": "https://www.instagram.com/usuario/",
  "place": "Barcelona",
  "date": "Octubre 2026",
  "text": [
    "Primer párrafo.",
    "Segundo párrafo."
  ],
  "credits": [
    { "role": "FOTOGRAFÍA", "name": "Andrea Carilla" },
    { "role": "MODELO", "name": "Nombre Apellido", "url": "https://www.instagram.com/usuario/" }
  ],
  "cover": ["1"],
  "photos": ["2", "3", "4", "5"]
}
```

La imagen que sale al compartir el enlace (en WhatsApp, Instagram…) **se hace
sola** con la portada: no tienes que hacer nada.

---

## 5. Qué va en cada campo de un proyecto

| campo | qué es | ejemplo |
|---|---|---|
| `title` | el título grande de la página | `"TUTTI PARI"` |
| `short` | el nombre en la home (y en la pestaña del navegador) | `"tutti pari"` |
| `url` | *(opcional)* adónde lleva el título al pulsarlo | `"https://www.instagram.com/tuttiispace/"` |
| `place` | *(opcional)* el lugar; admite links | `"[Hangar](https://…) Barcelona"` |
| `date` | *(opcional)* la fecha, como quieras escribirla | `"Marzo 2026"` |
| `text` | *(opcional)* el texto, lista de párrafos | `["Uno.", "Dos."]` |
| `credits` | *(opcional)* quién hizo qué: una persona por línea, con `role`, `name` y, si quieres, `url` | ver arriba |
| `cover` | *(opcional)* la portada | `["1"]` |
| `photos` | las fotos de la página, en orden | `["2", "3", "4"]` |
| `layout` | *(solo el diario)* `"diary"`: solo una tira de fotos, sin textos | `"diary"` |

En los textos (`text`, `place` y el about): `**negrita**`, `*cursiva*` y
`[texto del link](https://…)`.

---

## 6. Ver los cambios antes de subirlos *(opcional)*

Con la extensión **Live Server** de VS Code (búscala en Extensions, el icono de
los cuadraditos, e instálala): abajo a la derecha pulsa **Go Live** y se abre
la web en el navegador, leyendo tus archivos. Cada vez que guardas, se
actualiza.

---

## 7. Si algo va mal

**Casi siempre es una coma o unas comillas.** En un `.json`:

- cada texto va entre comillas dobles: `"así"`;
- entre dos cosas de una lista va una coma: `["1", "2", "3"]`;
- **después de la última, no**: `["1", "2", "3",]` ✗.

**Cómo saber si ha ido bien**: en tu repositorio en github.com, pestaña
**Actions**. Lo último que has subido sale con un círculo:

- 🟢 verde: publicado.
- 🟡 amarillo: publicándose (2-3 minutos).
- 🔴 rojo: no se ha publicado, y **la web sigue como estaba**. Entra, pulsa en
  **build** y verás una línea con ✗ que dice qué pasa y dónde. Por ejemplo:

  ```
  ✗ projects/tuttiPari/project.json no es un JSON válido (casi siempre es una coma): … (line 12 column 5)
  ✗ projects/tuttiPari/project.json: en «photos», 29 no está en su carpeta img/ (falta 29.webp)
  ✗ la lista «eventos» de data/site.json nombra «tutiPari», y no hay projects/tutiPari/project.json
  ```

  Arréglalo (el número de línea te dice dónde mirar), sube otra vez, y listo.

Si no ves qué es, escríbeme con el mensaje en rojo y lo miramos.
