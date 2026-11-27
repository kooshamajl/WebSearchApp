import icons from "../../assets/icons/quick-link-icons.svg?url";

type IconProps = {
    name: string;
    className?: string;
};

export default function Icon({ name, className }: IconProps) {
    return (
        <i className={className ? `ui-icon ${className}` : "ui-icon"} aria-hidden="true">
            <svg focusable="false"><use href={`${icons}#fa-${name}`} /></svg>
        </i>
    );
}
