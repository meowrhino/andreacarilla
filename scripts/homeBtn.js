// scripts/components/home-button.js

export function injectHomeButton() {
  const nav = document.createElement("nav");
  nav.id = "home-nav-button";

  const btn = document.createElement("button");
  btn.textContent = "← volver a inicio";
  btn.addEventListener("click", () => {
    window.location.href = "/index.html";
  });

  nav.appendChild(btn);
  document.body.appendChild(nav);
}
