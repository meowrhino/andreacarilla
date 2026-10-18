# andreacarilla, para Claude

La web de Andrea Carilla, hecha por meowrhino con la receta del estudio
([meowrhino/JAMstack](https://github.com/meowrhino/JAMstack)). Se habla en
castellano. Cómo está hecha: [README.md](README.md); lo que edita Andrea:
[GUIA.md](GUIA.md).

## Si el build falla (la web no se ha publicado)

Cuando falla, la web se queda como estaba. Para arreglarlo:

1. **El error**, en uno de estos sitios:
   - En nuestra copia (`meowrhino/andreacarilla`), la Action abre un issue con la
     etiqueta `build` y el mensaje dentro: `gh issue list --label build` y
     `gh issue view <n>`. El registro entero: `gh run list -L 3` y
     `gh run view <id> --log-failed`.
   - En la copia de Andrea (Workers Builds, en su Cloudflare), el registro
     está en su Cloudflare. No hace falta ir: el paso 2 da el mismo mensaje.
2. **Reprodúcelo aquí**: `npm ci && node build/build.mjs`. Es el mismo build que
   en la nube y dice lo mismo: cada línea con ✗ trae el fichero y qué pasa.
3. **Arréglalo donde dice**, casi siempre en `data/*.json` o en
   `projects/<slug>/project.json`:
   - "no es un JSON válido (línea 12…)": una coma de más o de menos, o unas
     comillas sin cerrar, cerca de esa línea.
   - "no es un campo de aquí", "falta…", "no tiene la forma que toca": lo dice
     el esquema (`schema/<tipo>.json`); el mensaje lleva cómo va el campo.
   - "en «photos», 29 no está en su carpeta img/ (falta 29.webp)": una foto de
     `photos` (o de `cover`) que no está en `img/`. Pregunta si falta subirla;
     si no, quítala de `photos` (y de `cover`) y dilo.
   - "en «gallery» 2, falta _portada/2/5.webp": una foto de la home que no está.
   - "«x» está oculto": un proyecto con `"visible": false` no puede salir en
     `gallery` (la home): o se quita de ahí, o se vuelve a mostrar.
   - "la lista … nombra …, y no hay projects/…/project.json": el slug de
     `data/site.json` → `lists` y el nombre de la carpeta no son iguales.
4. **Comprueba**: `node build/build.mjs` sin ✗ (los ⚠ no paran nada).

No cambies el build, las plantillas ni el esquema para que pase: si el dato
está bien y el build se queja, es un fallo del build, y hay que decírselo a
manu. No borres fotos ni proyectos.

Commit y push solo cuando te lo pidan: mensaje en castellano diciendo qué se
arregla. Al publicarse, la Action cierra el issue sola.
