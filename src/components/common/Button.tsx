import type { ComponentPropsWithRef } from "react";
import Icon from "./Icon";

type ButtonProps = ComponentPropsWithRef<"button"> & { icon?: string };

export default function Button({ type = "button", icon, children, ...props }: ButtonProps) {
    return (
        <button {...props} type={type}>
            {icon && <Icon name={icon} />}
            {icon && children != null && " "}
            {children}
        </button>
    );
}
