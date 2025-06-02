// scripts/andreaBtn.js

export function injectAndreaButton() {
  const openBtn = document.getElementById("open-andrea");
  const closeBtn = document.getElementById("close-andrea");
  const popup = document.getElementById("andrea-popup");

  if (!openBtn || !closeBtn || !popup) return;

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "flex";
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "none";
  });
}
