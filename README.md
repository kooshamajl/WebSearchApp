# 🔎 Modern Search Web App

A modern and minimal front-end search application built with **HTML, CSS, and JavaScript**.
The project includes multiple search modes, dynamic widgets, theme support, search history, autocomplete, and a modular structure.

Developed as a hands-on project to strengthen **front-end development and UI/UX skills**.

---

## 📌 Features

### 🔍 Search

Three search modes are available:

* **Web Search**
* **Image Search**
* **Advanced Search**

The Web Search page supports multiple search engines:

* Google
* Bing
* DuckDuckGo

Users can manually select their preferred search engine.

### 🧠 Advanced Search

Supports:

* All these words
* Exact word or phrase
* Any of these words
* None of these words

### 🌓 Theme Support

* Light / Dark mode
* Theme preference stored in `localStorage`
* Smooth theme transitions

### 🕓 Search History

* Stores the last 5 searches
* Prevents duplicates
* Re-search and delete individual entries
* Toggle with button or **Ctrl + H**
* Keyboard and screen-reader accessible

### ✨ Autocomplete

Suggestions are generated from:

* Search history with highlighted matches
* A curated list of popular websites such as YouTube, GitHub, and Digikala

Supports keyboard navigation (`↑`, `↓`, `Enter`, `Esc`) and mouse interaction.

### 📅 Date Display

The footer displays the current **Gregorian** and **Persian (Shamsi)** dates.
The displayed format can be toggled by clicking the date.

### 📦 Widget System

Widgets are dynamically loaded using `fetch()`.

Available widgets:

* 🌤 Weather
* 💰 Crypto — Bitcoin price and Canvas sparkline
* ✅ Daily Tasks
* ⚡ Ping
* 🔗 Quick Links

The selected widget is saved in `localStorage` and restored after reload.

---

## 🛠 Technologies

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* Fetch API
* LocalStorage API
* Canvas API
* OpenWeatherMap API
* CoinGecko API
* Font Awesome
* Google Fonts — Inter

---

## 📂 Project Structure

```text
WebSearchApp/
|-- index.html      # React app entry
|-- src/            # React pages, components, services, and assets
|-- css/            # Shared application styles
|-- tests/          # Playwright tests
`-- README.md
```

The modular structure keeps the project organized, maintainable, and easy to extend.

---

## 🧩 Key Concepts

* DOM Manipulation & Event Handling
* Modular JavaScript
* Async/Await & REST APIs
* Local Storage
* Canvas Data Visualization
* Dynamic Component Loading
* UI/UX Design
* Accessibility & ARIA

---

## 🎨 Design

The interface follows a **minimal, clean, and modern** design approach with:

* Glass-style widgets
* Soft hover animations
* Modern typography
* Lightweight and readable structure

---

## 🚀 How to Run

```bash
git clone https://github.com/kooshamajl/WebSearchApp.git
cd WebSearchApp
npm ci
npm run dev
```

Open the URL printed by Vite.

---

## Testing

Use Node.js 20.19 or newer on the 20.x line, or Node.js 22.12 or later. Run these commands from a fresh checkout.

```bash
npm ci
npx playwright install chromium --only-shell
npm test
```

If Microsoft Edge is already installed, run `npm ci` and `npm run test:edge` to use that browser.

Run `npm run lint` to check the React source, tests, and tool configuration. Run `npm run build` to type-check and build the production app.

The suite starts a local Vite server on port 4176. It uses fixtures for search destinations and widget APIs along with isolated browser storage. Run a single spec with `npm test -- tests/search.spec.ts`. Failed browser tests save traces in `test-results/`.

## 🔐 Configuration & Security

The weather widget uses Open-Meteo. The app runs without a weather API key.

---

## 📈 Future Improvements

* Support for multiple cryptocurrencies
* Further mobile-responsiveness improvements
* Settings panel for weather city and quick links

---

## 👨‍💻 Author

**Koosha Majlessi**

* GitHub: https://github.com/KooshaMajl
* LinkedIn: https://www.linkedin.com/in/koosha-majlessi-3b609038b

---

## 📚 Note

This project was developed as a practical learning experience. AI-assisted tools were occasionally used for brainstorming, debugging, and refining implementation details, while the overall architecture, structure, and development were completed independently.
