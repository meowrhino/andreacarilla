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
