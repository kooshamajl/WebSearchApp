import type { ReactNode } from "react";
import Button from "../common/Button";

type SearchButtonProps = { icon: string; children: ReactNode };

export default function SearchButton({ icon, children }: SearchButtonProps) {
    return <Button type="submit" id="search-button" className="search-but" icon={icon}>{children}</Button>;
}
