# 🔎 Modern Search Web App

A modern and minimal front-end search application built using **HTML, CSS, and JavaScript**.

This project includes multiple search pages, dynamic widgets, dark/light theme support, search history management, and a modular folder structure.

It was developed as a hands-on practice project to strengthen front-end fundamentals and UI design skills.

---

## 📌 Features

### 🔍 Search Pages

The application contains three main pages:

- Web Search
- Image Search
- Advanced Search

---

### 🧠 Advanced Search Options

The Advanced Search page allows users to search for pages containing:

- All these words
- Exact word or phrase
- Any of these words
- None of these words

---

### 🌓 Theme Support

- Light Mode
- Dark Mode
- Theme preference stored using `localStorage`
- Smooth UI transitions between themes

---

### 🕓 Search History

- Stores last 5 searches
- Prevents duplicate entries
- Click (or focus + Enter/Space) on a history item to re-search
- Delete individual history items
- Toggle history visibility with button or shortcut: **Ctrl + H**
- Fully keyboard-accessible (tabbable, `aria-label`s for screen readers)

---

### ✨ Autocomplete

As you type in the search bar, a dropdown suggests:

- Matches from your own search history (highlighted match, up to 4)
- Matches from a small curated list of popular sites (YouTube, GitHub, Digikala, etc.), filling any remaining slots
- Full keyboard navigation: `↓` / `↑` to move, `Enter` to select, `Esc` to close
- Mouse click also works, and it stays in sync with the history dropdown so only one is open at a time

---

### 📅 Date Display

The footer dynamically displays:

- Current **Gregorian (Miladi)** date
- Current **Persian (Shamsi)** date

Both are generated and updated using JavaScript, and the display can be toggled by clicking the date text.

---

### 📦 Widget System

The project includes a dynamic widget loader using `fetch()` and modular initialization functions. Widgets are loaded on demand from `html/widgets/` and injected into the page.

Available widgets:

- 🌤 Weather
- 💰 Crypto (Bitcoin live price with a glowing sparkline chart using Canvas API; falls back to clearly-labeled demo data if the API is unreachable)
- ✅ Daily Tasks (resets automatically at the start of each new day)
- ⚡ Ping
- 🔗 Quick Links (YouTube, Instagram, etc.)

The selected widget is saved in `localStorage` and restored after page reload.

---

## 🛠 Technologies Used

- HTML5
- CSS3 (Modular structure)
- Vanilla JavaScript (ES6+)
- Fetch API
- LocalStorage API
- Canvas API
- OpenWeatherMap API (Live weather data)
- CoinGecko API (Live cryptocurrency data)
- Font Awesome (icons)
- Google Fonts — Inter

---

## 📂 Project Structure

```
WebSearchApp/
│
├── html/
│   ├── web.html
│   ├── image.html
│   ├── advanced.html
│   ├── partials/
│   │   └── footer.html
│   └── widgets/
│       ├── weather.html
│       ├── crypto.html
│       ├── DailyTask.html
│       ├── ping.html
│       └── quick-links.html
│
├── css/
│   ├── main-style.css
│   ├── dark-mode.css
│   ├── widgets.css
│   ├── history-search.css
│   └── footer.css
│
├── js/
│   ├── search.js
│   ├── weather.js
│   ├── crypto.js
│   ├── DailyTask.js
│   ├── ping.js
│   ├── footer.js
│   ├── footer-loader.js
│   └── widget-loader.js
│
├── pictures/
│   ├── icon.png
│   ├── light.jpg
│   └── dark.jpg
│
└── README.md
```

The project is structured in separate folders to keep the code modular, organized, and maintainable.

---

## 🧩 Key Concepts Practiced

- DOM Manipulation
- Event Handling
- Modular JavaScript
- Async / Await
- Working with REST APIs
- Local Storage Management
- Canvas Drawing & Data Visualization
- UI/UX Design Principles
- Dynamic Component Loading
- Accessibility (keyboard navigation, ARIA roles/labels)

---

## 🎨 Design Philosophy

- Minimal & Clean UI
- Glass-style widgets
- Soft hover animations
- Modern typography (Inter font)
- Lightweight and readable structure

---

## 🚀 How to Run

⚠️ **Note:** This project uses `fetch()` to dynamically load the footer and widgets (`footer-loader.js`, `widget-loader.js`). Because of browser CORS restrictions on the `file://` protocol, opening the HTML files directly (double-click) will **not** work — the footer and widgets will fail to load silently.

To run the project correctly, serve it through a local server:

1. Clone the repository:

   ```
   git clone https://github.com/kooshamajl/WebSearchApp.git
   ```

2. Start a local server from the project root. For example:

   - **VS Code:** install the "Live Server" extension, right-click `html/web.html` → "Open with Live Server"
   - **Terminal (Python):**
     ```
     python -m http.server 8000
     ```
     then open `http://localhost:8000/html/web.html` in your browser

No backend, build step, or npm installation required — just a static file server.

---

## 🔐 Configuration & Security

The weather widget (`js/weather.js`) calls the OpenWeatherMap API with a key
defined directly in the client-side code:

```js
const WEATHER_API_KEY = "...";
```

Because this project has no backend, **any key placed there is publicly
visible** to anyone who views the page source or this repository. Before
deploying your own copy:

- Get your own free key at [openweathermap.org](https://openweathermap.org/api) and swap it in.
- Prefer a free-tier key with a low quota, and rotate it periodically.
- For a production deployment, proxy this request through a small backend
  or serverless function so the real key never reaches the browser.

---

## 📈 Future Improvements

- Support for multiple cryptocurrencies
- Further mobile-responsiveness polish (currently covers the main breakpoints)
- A settings panel (e.g. choosing the weather city, adding more quick links)
- Backend proxy for the weather API key (see Configuration & Security above)
- Possible migration to React in future versions

---

## 👨‍💻 Author

**Koosha Majlessi**

- GitHub: https://github.com/KooshaMajl
- LinkedIn: https://www.linkedin.com/in/koosha-majlessi-3b609038b

---

## 📚 Note

This project was built as a practical learning experience.
AI-assisted tools were occasionally used for brainstorming, debugging, and refining specific implementation details, while the overall architecture, structure, and development were completed independently.