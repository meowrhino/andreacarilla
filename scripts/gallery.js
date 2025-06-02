// scripts/gallery.js

export function renderGallery(gallerySets, selectedGallery) {
  const container = document.getElementById("gallery-container");
  if (!container) return;
  container.innerHTML = "";
  const isMobile = window.innerWidth <= 768;
  const factor = computeResponsiveFactor();

  gallerySets[selectedGallery].forEach((item) => {
    const style = isMobile ? item.mobileStyle : item.desktopStyle;
    const baseScale = (style.scale || 100) / 1000;

    const wrapper = document.createElement("a");
    wrapper.className = "portada-wrapper";
    wrapper.href = item.url;
    wrapper.target = "_blank";
    wrapper.style.zIndex = style.index || 0;
    container.appendChild(wrapper);

    const img = document.createElement("img");
    img.src = item.src;
    img.className = "portada";
    wrapper.appendChild(img);

    function resizeWrapper() {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const widthPx = w * baseScale * factor;
      const heightPx = h * baseScale * factor;

      wrapper.style.width = `${widthPx}px`;
      wrapper.style.height = `${heightPx}px`;

      ["top", "left", "right", "bottom"].forEach((dir) => {
        if (style[dir] != null) wrapper.style[dir] = style[dir] + "%";
      });

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
    }

    img.addEventListener("load", resizeWrapper);
    if (img.complete) resizeWrapper();
  });
}

function computeResponsiveFactor() {
  const w = window.innerWidth;
  if (w < 375 && w >= 320) {
    const t = (375 - w) / (375 - 320);
    return 1 - t * 0.15;
  } else if (w >= 375 && w < 768) {
    const t = (w - 375) / (768 - 375);
    return 1 + t * 0.75;
  } else if (w >= 1000) {
    return 1 + ((w - 1000) / 800) * 0.4;
  }
  return 1;
}
