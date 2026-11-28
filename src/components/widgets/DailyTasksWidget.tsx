import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../common/Icon";
import IconButton from "../common/IconButton";
import type { FormEvent } from "react";
import { useWidgetResize } from "../../hooks/useWidgetResize";
import { DAILY_TASK_LIMIT, TASK_TEXT_LIMIT, getTaskDateKey, readDailyTasks, saveDailyTasks, type DailyTask } from "../../utils/dailyTasks";

type TaskRow = DailyTask & { id: number };
type TaskList = { date: string; tasks: TaskRow[] };

function loadTaskList(date: string): TaskList {
    return { date, tasks: readDailyTasks(date).map((task, id) => ({ ...task, id })) };
}

export default function DailyTasksWidget() {
    const [taskList, setTaskList] = useState(() => loadTaskList(getTaskDateKey(new Date())));
    const [draft, setDraft] = useState("");
    const [showError, setShowError] = useState(false);
    const nextTaskId = useRef(DAILY_TASK_LIMIT);
    const input = useRef<HTMLInputElement>(null);
    const lastCheckbox = useRef<HTMLInputElement>(null);
    const focusAfterUpdate = useRef<"input" | "last-task" | null>(null);
    const { content, captureSize } = useWidgetResize("height");

    const { tasks } = taskList;
    const limitReached = tasks.length >= DAILY_TASK_LIMIT;

    useEffect(() => {
        let timer: number | undefined;

        function scheduleReset() {
            const now = new Date();
            const date = getTaskDateKey(now);
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);

            // Catch up if midnight passed while the browser was sleeping.
            const latest = loadTaskList(date);
            setTaskList((previous) => previous.date === date ? previous : latest);
            window.clearTimeout(timer);
            timer = window.setTimeout(scheduleReset, Math.max(1, nextMidnight.getTime() - now.getTime()));
        }

        scheduleReset();
        window.addEventListener("focus", scheduleReset);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("focus", scheduleReset);
        };
    }, []);

    useLayoutEffect(() => {
        const target = focusAfterUpdate.current;
        focusAfterUpdate.current = null;
        if (target === "input") input.current?.focus();
        if (target === "last-task") lastCheckbox.current?.focus();
    }, [taskList]);

    function commitTasks(date: string, tasks: TaskRow[]) {
        captureSize();
        saveDailyTasks(date, tasks);
        setTaskList({ date, tasks });
    }

    function handleAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const text = draft.trim();
        if (!text || text.length > TASK_TEXT_LIMIT) {
            setShowError(true);
            const field = input.current;
            if (field) {
                field.focus();
                field.classList.remove("limit");
                void field.offsetWidth;
                field.classList.add("limit");
            }
            return;
        }

        const date = getTaskDateKey(new Date());
        const current = taskList.date === date ? tasks : loadTaskList(date).tasks;
        if (current.length >= DAILY_TASK_LIMIT) return;

        const next = [...current, { text, done: false, id: nextTaskId.current++ }];
        setDraft("");
        setShowError(false);
        focusAfterUpdate.current = next.length === DAILY_TASK_LIMIT ? "last-task" : "input";
        commitTasks(date, next);
    }

    function toggleTask(id: number, done: boolean) {
        if (taskList.date !== getTaskDateKey(new Date())) return;
        commitTasks(taskList.date, tasks.map((task) => task.id === id ? { ...task, done } : task));
    }

    function deleteTask(id: number) {
        if (taskList.date !== getTaskDateKey(new Date())) return;
        focusAfterUpdate.current = "input";
        commitTasks(taskList.date, tasks.filter((task) => task.id !== id));
    }

    return (
        <div id="tasksWidget" className="daily-tasks" ref={content}>
            <div className="tasks-header">
                <Icon name="list-check" />
                <span aria-hidden="true">Daily Tasks</span>
                <span id="tasksCount" className="tasks-count" role="status" aria-label="Task count">{tasks.length}/{DAILY_TASK_LIMIT}</span>
            </div>
            <div className="tasks-divider" aria-hidden="true" />

            {tasks.length === 0 ? <p className="tasks-empty"><Icon name="clipboard-check" />No tasks yet</p> : (
                <ul id="tasksList" className="tasks-list" role="list" aria-label="Today's tasks">
                    {tasks.map(({ id, text, done }, index) => (
                        <li className={`task-item${done ? " done" : ""}`} key={id}>
                            <label className="task-toggle">
                                <input type="checkbox" ref={index === tasks.length - 1 ? lastCheckbox : undefined}
                                    checked={done} onChange={(event) => toggleTask(id, event.target.checked)} />
                                <span className="task-text">{text}</span>
                            </label>
                            <button type="button" className="task-delete" aria-label={`Delete task "${text}"`}
                                onClick={() => deleteTask(id)}>×</button>
                        </li>
                    ))}
                </ul>
            )}
            {tasks.length > 0 && tasks.every(({ done }) => done) && <p role="status">All tasks complete.</p>}

            <form className="task-input-row" onSubmit={handleAdd}>
                <div className="task-controls">
                    <input ref={input} type="text" id="taskInput" aria-label="New task" maxLength={TASK_TEXT_LIMIT}
                        placeholder={limitReached ? "Task limit reached" : "Add new task..."} disabled={limitReached}
                        aria-invalid={showError} aria-describedby={showError ? "task-input-error" : undefined}
                        value={draft} onChange={(event) => {
                            setDraft(event.target.value);
                            if (event.target.value.trim()) setShowError(false);
                        }} />
                    <IconButton id="taskAddBtn" type="submit" className="task-add-btn" icon="plus" aria-label="Add task" disabled={limitReached} />
                </div>
                {showError && <p id="task-input-error" role="alert">Enter a task of up to {TASK_TEXT_LIMIT} characters.</p>}
            </form>
        </div>
    );
}
