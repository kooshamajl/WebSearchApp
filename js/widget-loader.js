/* ===============================
   Widget Loader
   Fetches a widget's HTML partial from html/widgets/<name>.html, injects
   it into #widget-container, then calls that widget's init function
   (e.g. "weather" -> initWeatherWidget). The active choice is persisted
   in localStorage so it survives page reloads.
   =============================== */

/**
 * Swaps the currently displayed widget for `widgetName`.
 * Looks up and calls `init<Name>Widget()` by convention once the
 * partial's markup is in the DOM.
 */
function setWidget(widgetName) {
  const container = document.getElementById("widget-container");
  container.innerHTML = `<div class="glass-widget widget-loading">Loading...</div>`;

  fetch(`widgets/${widgetName}.html`)
    .then(response => response.text())
    .then(data => {
      container.innerHTML = data;

      const initFunctionName =
        "init" + widgetName.charAt(0).toUpperCase() + widgetName.slice(1) + "Widget";

      if (typeof window[initFunctionName] === "function") {
        window[initFunctionName]();
      }

      localStorage.setItem("activeWidget", widgetName);
      highlightActiveWidget(widgetName);
    })
    .catch(error => {
      container.innerHTML = "Error loading widget";
      console.error(error);
    });
}

/** Highlights the currently active option in the footer's widget switcher. */
function highlightActiveWidget(widgetName) {
  document.querySelectorAll(".widget-options span").forEach(span => {
    span.classList.toggle("active-widget", span.dataset.widget === widgetName);
  });
}

// Restore whichever widget was active last time the page was open.
document.addEventListener("DOMContentLoaded", () => {
  const savedWidget = localStorage.getItem("activeWidget");
  if (savedWidget) setWidget(savedWidget);
});

/**
 * Event delegation for the widget switcher (see html/partials/footer.html).
 * Using delegated listeners on `document` -- instead of inline `onclick`
 * attributes -- means this keeps working even though the footer markup
 * itself is injected later, asynchronously, by footer-loader.js.
 * It also gives us a single place to add keyboard support (Enter/Space)
 * on top of the existing click/tap behavior.
 */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-widget]");
  if (target) setWidget(target.dataset.widget);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;

  const target = e.target.closest("[data-widget]");
  if (target) {
    e.preventDefault();
    setWidget(target.dataset.widget);
  }
});
