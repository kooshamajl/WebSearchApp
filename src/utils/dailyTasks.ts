export type DailyTask = { text: string; done: boolean };

export const DAILY_TASK_LIMIT = 3;
export const TASK_TEXT_LIMIT = 40;
const STORAGE_KEY = "dailyTasks";

export function getTaskDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function readDailyTasks(date: string): DailyTask[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (!stored || typeof stored !== "object" || !("date" in stored) || stored.date !== date ||
            !("tasks" in stored) || !Array.isArray(stored.tasks)) {
            return [];
        }

        const tasks: DailyTask[] = [];
        for (const row of stored.tasks as unknown[]) {
            if (!row || typeof row !== "object" || !("text" in row) || typeof row.text !== "string" ||
                !("done" in row) || typeof row.done !== "boolean") continue;

            const text = row.text.trim();
            if (text) tasks.push({ text, done: row.done });
            if (tasks.length === DAILY_TASK_LIMIT) break;
        }
        return tasks;
    } catch {
        return [];
    }
}

export function saveDailyTasks(date: string, tasks: readonly DailyTask[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date,
            tasks: tasks.map(({ text, done }) => ({ text, done })),
        }));
    } catch {
        // The list still works in memory when storage is unavailable.
    }
}
