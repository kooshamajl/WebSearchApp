const dateElem = document.getElementById("full-date");
const now = new Date();
let isPersian = true;

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

dateElem.textContent = formatPersian(now);

dateElem.addEventListener("click", () => {
  if (isPersian) {
    dateElem.textContent = formatGregorian(now);
  } else {
    dateElem.textContent = formatPersian(now);
  }
  isPersian = !isPersian;
});




const themeToggle = document.getElementById("theme-toggle");
const darkCss = document.getElementById("dark-mode-css");
const themeIcon = document.getElementById("theme-icon");

if (localStorage.getItem("theme") === "dark") {
  darkCss.disabled = false;
  themeIcon.classList.remove("fa-sun");
  themeIcon.classList.add("fa-moon");
  themeIcon.style.color = "#ccc";
  themeIcon.style.transition = "color 0.5s ease";
} else {
  darkCss.disabled = true;
  themeIcon.classList.remove("fa-moon");
  themeIcon.classList.add("fa-sun");
  themeIcon.style.color = "#ffffffff";
  themeIcon.style.transition = "color 0.5s ease";
}

themeToggle.addEventListener("click", () => {
  if (darkCss.disabled) {
    darkCss.disabled = false;
    localStorage.setItem("theme", "dark");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
    themeIcon.style.color = "#bdb6b6ff";
    themeIcon.style.transition = "color 0.5s ease";
  } else {
    darkCss.disabled = true;
    localStorage.setItem("theme", "light");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
    themeIcon.style.color = "#ffffffff";
    themeIcon.style.transition = "color 0.5s ease";
  }
});

