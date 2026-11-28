import type { ComponentProps } from "react";
import Button from "./Button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "children" | "icon" | "aria-label"> & {
    icon: string;
    "aria-label": string;
};

export default function IconButton(props: IconButtonProps) {
    return <Button {...props} />;
}
