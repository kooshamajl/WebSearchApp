/* ===============================
   Footer Loader
   Fetches html/partials/footer.html and injects it into the
   #footer-placeholder element present on every page, then hands off to
   js/footer.js (initFooter) to wire up its interactive behavior.
   =============================== */
document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) return;

  fetch("partials/footer.html")
    .then(res => res.text())
    .then(html => {
      placeholder.outerHTML = html;

      if (typeof initFooter === "function") {
        initFooter();
      }

      if (typeof highlightActiveWidget === "function") {
        const saved = localStorage.getItem("activeWidget");
        if (saved) highlightActiveWidget(saved);
      }
    })
    .catch(err => {
      placeholder.innerHTML = "Error loading footer";
      console.error(err);
    });
});