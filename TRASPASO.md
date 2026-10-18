# Traspaso: la versión nueva a la copia de Andrea

Andrea ya tiene su copia (`carillagonzalezandrea-source/andreacarilla`) y su
dominio: hoy `andreacarilla.work` lo sirve GitHub Pages desde esa copia, con la
estructura de antes (`data/<slug>/<slug>.json`, `home.json`, la Action commitea
`proyectos/`). Esta versión no la publica GitHub Pages sino **su Cloudflare**
(Workers Builds, `wrangler.jsonc`): así no hace falta que ella cambie
Settings → Pages, que era lo que lo tenía parado (`TODO.md`).

Todo viaja dentro del repositorio: el código, los JSON, las fotos y cómo se
publica. En su copia la Action no corre (lleva
`if: github.repository_owner == 'meowrhino'`) y el build, al no estar en
GitHub, publica en la raíz con el `url` de `site.json`
(`https://andreacarilla.work/`), sin `noindex`.

Tiempo: unos 30 minutos, más lo que tarden los DNS. **Solo con el ok de manu.**

## Antes

- [ ] `main` de meowrhino al día y sin cambios a medias (`git status` limpio).
- [ ] ¿Ha tocado algo Andrea en su copia desde el 2026-10-14?
      `gh api repos/carillagonzalezandrea-source/andreacarilla/commits --jq '.[0:3][].commit.message'`.
      Si sí, pasar sus cambios (`data/<slug>/<slug>.json` → `projects/<slug>/project.json`,
      `home.json` → `lists` y `gallery` de `site.json`) aquí antes de seguir.
- [ ] El DNS de `andreacarilla.work` ya está en Cloudflare (`dig NS andreacarilla.work`:
      `*.ns.cloudflare.com`). Mirar **en qué cuenta**: tiene que ser la de Andrea (si es la
      nuestra, se mueve la zona a la suya primero).

## 1. La versión nueva, en una rama de su copia

Las dos copias no comparten historia. Se sube a una rama aparte para que su web
siga igual mientras se prepara Cloudflare:

- [ ] `git push https://github.com/carillagonzalezandrea-source/andreacarilla.git main:receta`
      (tenemos permiso de escribir).

## 2. Cloudflare (con Andrea, en su cuenta)

- [ ] **Workers & Pages → Create → Import a repository** → `carillagonzalezandrea-source/andreacarilla`,
      rama de producción **`receta`**. Lo demás lo lee de `wrangler.jsonc` (instala sharp con
      `npm install`, build `node build/build.mjs`, sale `dist/`).
- [ ] Mirar la web en su `*.workers.dev`: la home, un proyecto, el diario.
- [ ] **Settings → Domains & Routes → Add → Custom domain**: `andreacarilla.work` (y `www`).
      Cloudflare cambia los registros A que apuntaban a GitHub Pages.

## 3. `main` pasa a ser la versión nueva

- [ ] Guardar la de antes: `git push <su-repo> <sha-de-su-main>:refs/heads/antes`.
- [ ] `git push --force-with-lease=main:<sha-de-su-main> <su-repo> main` (desde nuestra `main`).
- [ ] En Cloudflare, rama de producción → **`main`**. Borrar la rama `receta`.
- [ ] Andrea, en su repo: Settings → Pages → **Unpublish site** (ya no sirve nada; el `CNAME`
      se puede quedar).

## 4. Que nos deje entrar

- [ ] GitHub: ya somos colaboradores (escribir basta).
- [ ] Cloudflare: Manage account → Members → nos invita. Ahí se ve el error entero de un
      build que falla.

## 5. Comprobar en su dominio

- [ ] La home (los botones 1 2 3, los filtros), un proyecto (`/projects/tuttiPari/`), el diario
      y una dirección vieja (`/proyectos/tuttiPari/`, `/proyecto.html?slug=diario`).
- [ ] `view-source:`: `canonical` y `og:url` con `andreacarilla.work`, y **sin**
      `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` dice `Allow` y `/sitemap.xml` tiene las direcciones de su dominio.
- [ ] Compartir un proyecto por WhatsApp: sale su foto (la og).

## 6. Search Console, con su cuenta de Google

- [ ] Dar de alta el dominio (el registro TXT, en el DNS de Cloudflare) y enviar `sitemap.xml`.

## 7. Andrea en su ordenador

Con ella delante, siguiendo [GUIA.md](GUIA.md):

- [ ] Sincroniza su carpeta (la estructura cambia entera: si tenía cambios sin subir, antes
      los apunta aparte).
- [ ] Live Server: **Go Live** y ve la vista previa.
- [ ] Un cambio pequeño (una coma en el about), Commit → Sync, y la bolita verde en GitHub.

## 8. Al acabar

- [ ] `TODO.md`: fuera lo de Settings → Pages. La fila de andreacarilla en
      `JAMstack/inventario.md`, con las dos direcciones.
- [ ] La copia de meowrhino sigue en `meowrhino.github.io/andreacarilla/` con `noindex`.
