// scripts/home.js

import { injectComponents } from "./components/andrea-button.js";
import { renderGallery } from "./gallery.js";
import { renderProjects, setupCategoryNav } from "./projects.js";
import { activarCategoriaDesdeURL } from "./components/convert-category-link.js";
import { gallerySets, projects } from "./data.js"; // opcional si decides externalizar

let selectedGallery = 0;

function setupTemaNav() {
  const nav = document.getElementById("tema-nav");
  gallerySets.forEach((_, idx) => {
    const btn = document.createElement("button");
    btn.textContent = idx + 1;
    btn.className = "tema-btn";
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tema-nav .tema-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedGallery = idx;
      renderGallery(gallerySets, selectedGallery);
    });
    nav.appendChild(btn);
  });
}

function setupShuffle() {
  const btn = document.getElementById("shuffle-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      renderProjects();
    });
  }
}

function onResize() {
  renderGallery(gallerySets, selectedGallery);
  renderProjects();
}

window.addEventListener("resize", debounce(onResize, 200));

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  injectComponents();
  setupTemaNav();

  const btns = document.querySelectorAll("#tema-nav .tema-btn");
  const rand = Math.floor(Math.random() * btns.length);
  selectedGallery = rand;
  btns[rand]?.classList.add("active");

  renderGallery(gallerySets, selectedGallery);
  renderProjects();
  setupCategoryNav();
  setupShuffle();
  activarCategoriaDesdeURL();

  document.querySelectorAll("a").forEach((a) => (a.target = "_blank"));
});
