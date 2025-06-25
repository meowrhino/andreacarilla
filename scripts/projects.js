// scripts/projects.js

import { projects } from "./data.js";

export function setupCategoryNav() {
  const nav = document.getElementById("category-nav");
  const sel = new Set();

  Array.from(new Set(projects.map((p) => p.category))).forEach((cat) => {
    const b = document.createElement("button");
    b.textContent = cat;
    b.className = "category-btn";

    b.addEventListener("click", () => {
      b.classList.toggle("active");
      if (b.classList.contains("active")) sel.add(cat);
      else sel.delete(cat);

      document
        .querySelectorAll("#links-container .project-link")
        .forEach((link) => {
          const name = link.querySelector("a").textContent.trim();
          const catOf = projects.find((p) => p.name === name).category;
          link.style.display =
            sel.size === 0 || sel.has(catOf) ? "block" : "none";
        });
    });

    nav.appendChild(b);
  });
}

export function renderProjects() {
  const linksContainer = document.getElementById("links-container");
  linksContainer.innerHTML = "";
  const active = projects.filter((p) => p.status);
  shuffle(active);

  const selectedCategories = Array.from(
    document.querySelectorAll("#category-nav .category-btn.active")
  ).map((b) => b.textContent.trim());

  active.forEach((p) => {
    const wrapper = document.createElement("div");
    wrapper.className = "project-link";
    wrapper.style.position = "absolute";

    const a = document.createElement("a");
    a.href = p.url;
    a.textContent = p.name;
    wrapper.appendChild(a);
    linksContainer.appendChild(wrapper);

    /*
    const menu = document.getElementById("home-nav");
    const menuRect = menu?.getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const menuMarginBottom = menuRect.height + rem; // 1rem extra
    const menuMarginRight = menuRect.width + rem; // 1rem extra
*/

    const contRect = linksContainer.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();

    const maxTop = contRect.height - wrapRect.height - menuMarginBottom;
    const maxLeft = contRect.width - wrapRect.width - menuMarginRight;

    wrapper.style.top = Math.random() * Math.max(0, maxTop) + "px";
    wrapper.style.left = Math.random() * Math.max(0, maxLeft) + "px";

    const isVisible =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);
    wrapper.style.display = isVisible ? "block" : "none";
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
