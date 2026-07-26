/* ===============================
   Daily Task Widget
   A tiny todo list capped at MAX_TASKS items, persisted in localStorage
   and automatically cleared at the start of each new day.
   =============================== */

function initDailyTaskWidget() {

  const MAX_TASKS = 3;
  const STORAGE_KEY = "dailyTasks";

  let tasks = [];

  const widget = document.getElementById("tasksWidget");
  const list = document.getElementById("tasksList");
  const input = document.getElementById("taskInput");
  const addBtn = document.getElementById("taskAddBtn");

  if (!list || !input) return;

  /** Returns today's date as a stable "YYYY-M-D" key for comparison. */
  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  /**
   * Loads tasks from localStorage, but only if they were saved today.
   * This is what makes the widget genuinely "daily": once the date
   * rolls over, yesterday's tasks are dropped instead of piling up
   * forever.
   */
  function loadTasks() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    tasks = (saved && saved.date === getTodayKey()) ? saved.tasks : [];
  }

  /** Persists the current tasks together with today's date key. */
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), tasks }));
  }

  function updateCounter() {
    const counterEl = document.getElementById("tasksCount");
    if (counterEl) counterEl.textContent = `${tasks.length}/${MAX_TASKS}`;
  }

  function updateInputState() {
    const limitReached = tasks.length >= MAX_TASKS;
    input.disabled = limitReached;
    input.placeholder = limitReached ? "Task limit reached" : "Add new task...";
    if (addBtn) addBtn.disabled = limitReached;
  }

  function addTask() {
    const value = input.value.trim();
    if (!value || tasks.length >= MAX_TASKS) return;

    tasks.push({ text: value, done: false });
    input.value = "";
    saveTasks();
    renderTasks();
    input.focus();
  }

  /** Builds a single <li> task row with its checkbox and delete button. */
  function createTaskElement(task, index) {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const delBtn = document.createElement("button");
    delBtn.className = "task-delete";
    delBtn.textContent = "×";
    delBtn.setAttribute("aria-label", `Delete task "${task.text}"`);

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      li.classList.toggle("done", task.done);
      saveTasks();
    });

    delBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.append(checkbox, span, delBtn);
    return li;
  }

  /**
   * Re-renders the full task list. When `animate` is true, the widget's
   * height is briefly locked and then transitioned to its new height so
   * adding/removing a task doesn't just snap to a new size.
   */
  function renderTasks(animate = true) {
    const startHeight = animate && widget ? widget.getBoundingClientRect().height : null;

    list.innerHTML = "";

    if (tasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "tasks-empty";

      const icon = document.createElement("i");
      icon.className = "fa-solid fa-clipboard-check";
      icon.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.textContent = "No tasks yet";

      empty.append(icon, label);
      list.appendChild(empty);
    } else {
      tasks.forEach((task, index) => {
        list.appendChild(createTaskElement(task, index));
      });
    }

    updateInputState();
    updateCounter();

    if (startHeight !== null) {
      const endHeight = widget.getBoundingClientRect().height;

      widget.style.height = startHeight + "px";
      void widget.offsetHeight; // force reflow so the height change below animates

      requestAnimationFrame(() => {
        widget.style.height = endHeight + "px";
      });

      widget.addEventListener("transitionend", function handler(e) {
        if (e.propertyName !== "height") return;
        widget.style.height = "";
        widget.removeEventListener("transitionend", handler);
      });
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  if (addBtn) {
    addBtn.addEventListener("click", addTask);
  }

  loadTasks();
  renderTasks(false);
}
