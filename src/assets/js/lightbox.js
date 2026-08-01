// Screenshots are plain images until this runs, so a JS failure costs nothing.
const dialog = document.getElementById("lightbox");
const image = document.getElementById("lightbox-image");

if (dialog && image) {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".screenshot-trigger");
    if (!trigger) return;

    image.src = trigger.dataset.full;
    image.alt = trigger.dataset.alt || "";
    dialog.showModal();
  });

  // Clicking the backdrop lands on the <dialog> itself, never on its children.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Drop the source so a large screenshot is not held in memory while closed.
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
  });
}
