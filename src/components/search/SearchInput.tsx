import type { ComponentPropsWithRef } from "react";

type SearchInputProps = Omit<ComponentPropsWithRef<"input">, "type">;

export default function SearchInput({ className, autoComplete = "off", ...props }: SearchInputProps) {
    return <input {...props} type="text" autoComplete={autoComplete} className={className ? `search-bar ${className}` : "search-bar"} />;
}
