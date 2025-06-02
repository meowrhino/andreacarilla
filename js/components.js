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
            </div>
        </div>
    `;
  document.body.appendChild(popup);

  // Botón "home"
  if (document.body.dataset.pageType === "proyecto") {
    const homeBtn = document.createElement("button");
    homeBtn.className = "home-button";
    homeBtn.textContent = "home";
    homeBtn.addEventListener("click", () => {
      window.location.href = "/";
    });
    document.body.appendChild(homeBtn);
  }

  // Eventos de abrir/cerrar
  document.getElementById("open-andrea").addEventListener("click", (e) => {
    e.preventDefault();
    popup.classList.add("visible");
  });

  document.getElementById("close-andrea").addEventListener("click", (e) => {
    e.preventDefault();
    popup.classList.remove("visible");
  });
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
  const currentNumberEl = document.getElementById("current-number");

  const imgWidth = 512;

  function calculateMargin() {
    const vw = document.documentElement.clientWidth;
    return (vw - imgWidth) / 2;
  }

  function addScrollMargin() {
    const m = document.createElement("div");
    m.classList.add("galleryMargin");
    m.style.width = `${calculateMargin()}px`;
    gallery.appendChild(m);
  }

  function updateCurrentImage() {
    const images = document.querySelectorAll('.profilePic');
    const rect = gallery.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    let closest = null, minDiff = Infinity;
    images.forEach(img => {
      const r2 = img.getBoundingClientRect();
      const imgCenter = r2.left + r2.width / 2;
      const d = Math.abs(imgCenter - centerX);
      if (d < minDiff) {
        minDiff = d;
        closest = img;
      }
    });
    if (closest) {
      const match = closest.src.match(/\/(\d+)\.\w+$/);
      currentNumberEl.textContent = match ? match[1] : '';
    }
  }

  let i = 1;
  const extensions = ['jpg', 'jpeg', 'png'];

  function tryLoadNext() {
    let extIndex = 0;
    let found = false;

    function tryNextExtension() {
      if (extIndex >= extensions.length) {
        // ninguna extensión funcionó → se terminó la galería
        addScrollMargin();
        updateCurrentImage();
        gallery.addEventListener('scroll', updateCurrentImage);
        window.addEventListener('resize', () => {
          document.querySelectorAll('.galleryMargin')
                  .forEach(m => m.style.width = `${calculateMargin()}px`);
          updateCurrentImage();
        });
        document.getElementById('loader').style.display = 'none';
        document.querySelectorAll('.diario-gallery, #current-number, #arrow')
                .forEach(el => el.style.visibility = 'visible');
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
        tryLoadNext(); // siguiente imagen
      };
      testImg.onerror = () => {
        extIndex++;
        tryNextExtension(); // intenta con otra extensión
      };
      testImg.src = `img/${i}.${ext}`;
    }

    tryNextExtension();
  }

  addScrollMargin();
  tryLoadNext();
}