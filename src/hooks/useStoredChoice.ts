import { useState } from "react";

export function useStoredChoice<const Choice extends string>(key: string, choices: readonly [Choice, ...Choice[]]) {
    const [value, setValue] = useState<Choice>(() => {
        try {
            const stored = localStorage.getItem(key);
            return choices.find((choice) => choice === stored) ?? choices[0];
        } catch {
            return choices[0];
        }
    });

    function select(choice: Choice) {
        setValue(choice);
        try {
            localStorage.setItem(key, choice);
        } catch {
            // The choice still applies for the current session.
        }
    }

    return [value, select] as const;
}
