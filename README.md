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
│   ├── search-engine.css
│   └── footer.css
│
├── js/
│   ├── search.js
│   ├── search-engine.js
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

Because the project uses `fetch()` to load widgets and the footer dynamically, it must be served through a **local web server** instead of opening files directly with `file://`.

### Clone the repository

```bash
git clone https://github.com/kooshamajl/WebSearchApp.git
```

### Run with VS Code

Use the **Live Server** extension and open:

```text
html/web.html
```

### Or use Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/html/web.html
```

No backend, build step, or npm installation is required.

---

## 🔐 Configuration & Security

The Weather widget uses an OpenWeatherMap API key directly in `js/weather.js`.

Since the application is client-side only, the key is publicly visible. Use your own key for your copy of the project. For production, a backend or serverless proxy should be used to protect the key.

---

## 📈 Future Improvements

* Support for multiple cryptocurrencies
* Further mobile-responsiveness improvements
* Settings panel for weather city and quick links
* Backend proxy for the weather API key
* Possible migration to React

---

## 👨‍💻 Author

**Koosha Majlessi**

* GitHub: https://github.com/KooshaMajl
* LinkedIn: https://www.linkedin.com/in/koosha-majlessi-3b609038b

---

## 📚 Note

This project was developed as a practical learning experience. AI-assisted tools were occasionally used for brainstorming, debugging, and refining implementation details, while the overall architecture, structure, and development were completed independently.
