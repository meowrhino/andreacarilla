// scripts/components.js

export function injectComponents() {
  // Botón "andrea carilla"
  const nav = document.createElement("nav");
  nav.id = "andrea-nav";
  nav.innerHTML = `
        <button id="open-andrea">andrea carilla</button>
    `;
  document.body.appendChild(nav);

// Popup bio
const popup = document.createElement("div");
popup.id = "andrea-popup";
popup.innerHTML = `
    <button class="close-btn" id="close-andrea">cerrar</button>
    <div class="content">
        <p>Graduada en Comunicación Audiovisual por la Universidad de Granada en 2019, su práctica fotográfica se
            articula entre la moda, el diario personal y la fotografía robada, tensionando los límites entre lo
            documental y lo construido. </p>
        <p>​​Es cofundadora de la editorial de autoedición <a
            href="https://quiennocorrevuela.bigcartel.com/" target="_blank">Quien no corre, vuela</a>, desde donde ha publicado
            <i>archivo en pixel</i> y <i>no time left for square</i>, investigando nuevas formas de narrar, publicar y distribuir
            fotografía contemporánea desde los márgenes.</p>
        <p>Su trabajo se construye desde la serialidad y la repetición: las imágenes no funcionan de forma aislada,
            sino que se organizan como fragmentos de una narrativa abierta. Dispara desde el impulso y el error, con
            una cámara que no busca certezas ni discursos cerrados, sino que reacciona ante lo que hiere, incomoda o
            emociona. Una mirada crítica, permeable y radicalmente encarnada en lo cotidiano.</p>
        <div class="footer">
            <a href="mailto:carillagonzalezandrea@gmail.com">carillagonzalezandrea@gmail.com</a>
            <a href="https://www.instagram.com/andreacarilla/" target="_blank">@andreacarilla</a>
            <span style="position:absolute; bottom:1rem;">
                web: <a href="https://meowrhino.github.io/becasDigMeow/" target="_blank">meowrhino</a>
            </span>
        </div>
    </div>
`;
document.body.appendChild(popup);

  // Botón "home"
  if (document.body.dataset.pageType !== "home") {
    const homeBtn = document.createElement("button");
    homeBtn.className = "home-button";
    homeBtn.textContent = "home";
    homeBtn.addEventListener("click", () => {
      window.location.href = `${window.location.origin}`;
    });
    document.body.appendChild(homeBtn);
  }

  // Eventos de abrir/cerrar
  setTimeout(() => {
    const open = document.getElementById("open-andrea");
    const close = document.getElementById("close-andrea");
    const popup = document.getElementById("andrea-popup");
    if (!open || !close || !popup) return;

    open.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.add("visible");
    });

    close.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.remove("visible");
    });
  }, 0);
}

// --------------------------------------------------------
// Función para poblar .project-gallery automáticamente:
export function populateProjectGallery() {
  const gallery = document.querySelector(".project-gallery");
  if (!gallery) return;

  let i = 2;
  function tryLoadNext() {
    const imgPath = `./img/${i}.jpg`;
    const testImg = new Image();
    testImg.onload = () => {
      const el = document.createElement("img");
      el.src = imgPath;
      el.alt = `Imagen ${i}`;
      gallery.appendChild(el);

      i++;
      tryLoadNext();
    };
    testImg.onerror = () => {
      // Cuando falle, ya no hay más imágenes; paramos.
    };
    testImg.src = imgPath;
  }
  tryLoadNext();
}

// scripts/diario-gallery.js

export function initDiarioGallery() {
  const gallery = document.querySelector(".diario-gallery");
  if (!gallery) return;

  const imgWidth = 512;

function calculateMargin() {
  const vw = document.documentElement.clientWidth;
  const imgWidth = 512;
  const gap = 50;

  // centrado = (viewport - imagen) / 2
  // pero restamos medio gap para que visualmente no se desplace por el espacio entre imágenes
  return (vw - imgWidth) / 2;
}

  function addScrollMargin() {
    const m = document.createElement("div");
    m.classList.add("galleryMargin");
    m.style.width = `${calculateMargin()}px`;
    gallery.appendChild(m);
  }

  let i = 1;
  const extensions = ["jpg", "jpeg", "png"];

  function tryLoadNext() {
    let extIndex = 0;

    function tryNextExtension() {
      if (extIndex >= extensions.length) {
        // No se encontró ninguna imagen → fin
        addScrollMargin(); // ← ahora sí es el final
        gallery.style.visibility = "visible";
        return;
      }

      const ext = extensions[extIndex];
      const testImg = new Image();
      testImg.onload = () => {
        const img = document.createElement("img");
        img.src = testImg.src;
        img.classList.add("profilePic");
        gallery.appendChild(img);
        i++;
        tryLoadNext();
      };
      testImg.onerror = () => {
        extIndex++;
        tryNextExtension();
      };
      testImg.src = `img/${i}.${ext}`;
    }

    tryNextExtension();
  }

  addScrollMargin();
  tryLoadNext();

  // También activamos resize para márgenes
  window.addEventListener("resize", () => {
    document
      .querySelectorAll(".galleryMargin")
      .forEach((m) => (m.style.width = `${calculateMargin()}px`));
  });
}
