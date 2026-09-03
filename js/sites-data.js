/* ===============================
   Known Sites Data
   Single source of truth for the small, curated list of well-known
   websites used across the app: web-search autocomplete suggestions
   (js/search.js) and Quick Link name/URL resolution (js/quick-links.js).
   Loaded before both of those, on every page, since the Quick Links
   widget can appear on any page.
   =============================== */

/**
 * A small, curated list of well-known sites. Deliberately kept short
 * (rather than an exhaustive directory) so matches stay relevant
 * instead of firing on every common letter typed.
 */
const POPULAR_SITES = [
  { name: "Google", url: "google.com", icon: "fa-brands fa-google" },
  { name: "YouTube", url: "youtube.com", icon: "fa-brands fa-youtube" },
  { name: "Gmail", url: "mail.google.com", icon: "fa-solid fa-envelope" },
  { name: "GitHub", url: "github.com", icon: "fa-brands fa-github" },
  { name: "Instagram", url: "instagram.com", icon: "fa-brands fa-instagram" },
  { name: "Telegram", url: "web.telegram.org", icon: "fa-brands fa-telegram" },
  { name: "Twitter / X", url: "x.com", icon: "fa-brands fa-x-twitter" },
  { name: "LinkedIn", url: "linkedin.com", icon: "fa-brands fa-linkedin" },
  { name: "Wikipedia", url: "wikipedia.org", icon: "fa-brands fa-wikipedia-w" },
  { name: "Amazon", url: "amazon.com", icon: "fa-brands fa-amazon" },
  { name: "Netflix", url: "netflix.com" },
  { name: "Spotify", url: "open.spotify.com", icon: "fa-brands fa-spotify" },
  { name: "Reddit", url: "reddit.com", icon: "fa-brands fa-reddit" },
  { name: "Stack Overflow", url: "stackoverflow.com", icon: "fa-brands fa-stack-overflow" },
  { name: "ChatGPT", url: "chat.openai.com", icon: "fa-solid fa-robot" },
  { name: "Discord", url: "discord.com", icon: "fa-brands fa-discord" },
  { name: "WhatsApp", url: "web.whatsapp.com", icon: "fa-brands fa-whatsapp" },
  { name: "Aparat", url: "aparat.com" },
  { name: "Digikala", url: "digikala.com" },
  { name: "Divar", url: "divar.ir" },
];

// Fallback icon for POPULAR_SITES entries above that have no matching
// Font Awesome brand glyph (e.g. Netflix, Aparat, Digikala, Divar).
const DEFAULT_SITE_ICON = "fa-solid fa-globe";
