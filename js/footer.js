/* ===============================
   Footer Behavior
   Handles the two interactive pieces of the footer: the date display
   (Persian/Gregorian toggle) and the light/dark theme switch.
   =============================== */

const persianMonths = [
  "Farvardin", "Ordibehesht", "Khordad", "Tir",
  "Mordad", "Shahrivar", "Mehr", "Aban",
  "Azar", "Dey", "Bahman", "Esfand"
];

function toEnglishNumber(str) {
  return str.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776));
}

function formatPersian(date) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = weekdays[date.getDay()];

  const formatter = new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const formatted = formatter.format(date);
  const parts = formatted.split('/');

  if (parts.length === 3) {
    const year = toEnglishNumber(parts[0]);
    const month = parseInt(toEnglishNumber(parts[1]), 10);
    const day = toEnglishNumber(parts[2]);

    const monthName = persianMonths[month - 1] || "Farvardin";

    return `${dayOfWeek}, ${day} ${monthName}, ${year}`;
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(date);

    const year = parts.find(p => p.type === 'year')?.value || "1400";
    const month = parseInt(parts.find(p => p.type === 'month')?.value || "1", 10);
    const day = parts.find(p => p.type === 'day')?.value || "1";
    const monthName = persianMonths[month - 1] || "Farvardin";

    return `${dayOfWeek}, ${day} ${monthName}, ${year}`;
  } catch (error) {
    return `${dayOfWeek}, 1 Farvardin, 1400`;
  }
}

function formatGregorian(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

/**
 * Wires up all footer behavior (date toggle + theme toggle).
 * Called by footer-loader.js once the footer markup has been injected into the page.
 */
function initFooter() {
  const dateElem = document.getElementById("full-date");
  const dateCard = document.querySelector(".footer-date-card");
  const timeElem = document.getElementById("full-time");
  let isPersian = true;

  function updateClock() {
    const now = new Date();

    if (timeElem) {
      timeElem.textContent = formatTime(now);
    }

    if (dateElem) {
      dateElem.textContent = isPersian
        ? formatPersian(now)
        : formatGregorian(now);
    }
  }

  if (dateElem) {
    updateClock();
    setInterval(updateClock, 1000);

    dateCard.addEventListener("click", () => {
      isPersian = !isPersian;
      updateClock();
    });
  }

  const themeToggle = document.getElementById("theme-toggle");
  const darkCss = document.getElementById("dark-mode-css");
  const themeIcon = document.getElementById("theme-icon");

  if (!themeToggle || !darkCss || !themeIcon) return;

  /**
   * Enables/disables the dark-mode stylesheet and updates the toggle
   * icon. Also broadcasts a "themechange" event on `document` so other
   * scripts (e.g. crypto.js) can redraw anything that reads CSS
   * variables immediately, instead of waiting for their own next
   * refresh cycle.
   */
  function applyTheme(isDark) {
    darkCss.disabled = !isDark;
    themeIcon.classList.toggle("fa-moon", isDark);
    themeIcon.classList.toggle("fa-sun", !isDark);
    themeIcon.style.color = isDark ? "#bdb6b6ff" : "#ffffffff";
    themeIcon.style.transition = "color 0.5s ease";
    document.dispatchEvent(new CustomEvent("themechange", { detail: { isDark } }));
  }

  applyTheme(localStorage.getItem("theme") === "dark");

  themeToggle.addEventListener("click", () => {
    const goingDark = darkCss.disabled;
    applyTheme(goingDark);
    localStorage.setItem("theme", goingDark ? "dark" : "light");
  });
}
