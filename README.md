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
- Click on history item to re-search  
- Delete individual history items  
- Toggle history visibility with button or shortcut: **Ctrl + H**  

---

### 📅 Date Display

The footer dynamically displays:

- Current **Gregorian (Miladi)** date  
- Current **Persian (Shamsi)** date  

Both are generated and updated using JavaScript.

---

### 📦 Widget System

The project includes a dynamic widget loader using `fetch()` and modular initialization functions.

Available widgets:

- 🌤 Weather  
- 💰 Crypto (Bitcoin live price with sparkline chart using Canvas API)  
- ✅ Daily Tasks  
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
- CoinGecko API (Live cryptocurrency data)

---

## 📂 Project Structure

```
project/
│
├── html/
│ ├── web.html
│ ├── image.html
│ ├── advanced.html
│ └── widgets/
│
├── css/
│ ├── main-style.css
│ ├── dark-mode.css
│ ├── widgets.css
│ ├── history-search.css
│ └── footer.css
│
├── js/
│ ├── weather.js
│ ├── crypto.js
│ ├── DailyTask.js
│ ├── ping.js
│ └── footer.js
│
└── images/
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

---

## 🎨 Design Philosophy

- Minimal & Clean UI  
- Glass-style widgets  
- Soft hover animations  
- Modern typography (Inter font)  
- Lightweight and readable structure  

---

## 🚀 How to Run

1. Clone the repository:

   git clone https://github.com/your-username/your-repo-name.git

2. Open `web.html` in your browser.

No backend or installation required.

---

## 📈 Future Improvements

- Search suggestions (autocomplete)  
- Support for multiple cryptocurrencies  
- Improved mobile responsiveness  
- Accessibility improvements (ARIA roles)  
- Settings panel  
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
