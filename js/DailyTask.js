function initDailyTaskWidget() {

    const MAX_TASKS = 3;
    const STORAGE_KEY = "dailyTasks";

    let tasks = [];

    const list = document.getElementById("tasksList");
    const input = document.getElementById("taskInput");

    if (!list || !input) return;

    function loadTasks() {
        const saved = localStorage.getItem(STORAGE_KEY);
        tasks = saved ? JSON.parse(saved) : [];
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function updateInputState() {
        if (tasks.length >= MAX_TASKS) {
            input.disabled = true;
            input.placeholder = "Task limit reached";
        } else {
            input.disabled = false;
            input.placeholder = "Add new task...";
        }
    }

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

        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            li.classList.toggle("done", task.done);
            saveTasks();
        });

        delBtn.addEventListener("click", () => {
            tasks.splice(index, 1);
            li.remove();
            saveTasks();
            updateInputState();

            if (tasks.length === 0) {
                renderTasks();
            }
        });

        li.append(checkbox, span, delBtn);
        return li;
    }

    function renderTasks() {
        list.innerHTML = "";

        if (tasks.length === 0) {
            const empty = document.createElement("div");
            empty.className = "tasks-empty";
            empty.textContent = "No tasks available yet.";
            list.appendChild(empty);
            updateInputState();
            return;
        }

        tasks.forEach((task, index) => {
            list.appendChild(createTaskElement(task, index));
        });

        updateInputState();
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const value = input.value.trim();

            if (!value || tasks.length >= MAX_TASKS) return;

            tasks.push({ text: value, done: false });
            input.value = "";
            saveTasks();
            renderTasks();
        }
    });

    loadTasks();
    renderTasks();
}
