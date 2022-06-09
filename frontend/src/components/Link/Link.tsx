import {css} from "../../helpers/css";
import React, {PropsWithChildren} from "react";
import {Link as RouterLink} from "react-router-dom";
import Icon from "../Icon/Icon";

export enum LinkVariant {
    Primary = "primary",
    Secondary = "secondary",
    Grey = "grey"
}

export enum LinkSize {
    sm = "sm",
    lg = "lg"
}

interface LinkProps {
    isExternal?: boolean;
    href: string;
    children?: any;
    variant?: LinkVariant;
    size?: LinkSize;
    isExternalIconVisible?: boolean
    title?: string;
}

const baseLinkStyles = css("hover-hover:hover:underline", "cursor-pointer", "font-mono", "whitespace-nowrap", "min-w-0", "overflow-hidden", "overflow-ellipsis")

const linkTypeStyles = {
    [LinkVariant.Primary]: css("text-white", "hover-hover:hover:text-zz-150", baseLinkStyles),
    [LinkVariant.Secondary]: css("text-white", baseLinkStyles),
    [LinkVariant.Grey]: css("text-neutral-400", "hover-hover:hover:text-zz-150", baseLinkStyles)
}

const linkSizeStyles = {
    [LinkSize.sm]: css("text-md"),
    [LinkSize.lg]: css("text-xl")
}

const Link: React.FC<PropsWithChildren<LinkProps>> = ({
                                                          isExternal,
                                                          href,
                                                          children,
                                                          variant = LinkVariant.Primary,
                                                          size = LinkSize.sm,
                                                          isExternalIconVisible = true,
                                                          title,
                                                      }: LinkProps) => {
    const styles = css(linkTypeStyles[variant], linkSizeStyles[size])
    return <>
        {isExternal ? <a
                href={href}
                className={css(styles, "inline-flex", "items-center")}
                target={isExternal ? "_blank" : "_self"}
                title={title}
                rel={"noreferrer"}
            >
                {children && children}
                {isExternalIconVisible && <span className={css("ml-2")}>
                  <Icon icon={'external-link'} size={size === LinkSize.sm ? "14px" : "16px"}/>
                </span>}
            </a>
            : <RouterLink to={href} className={css(styles)} title={title}>
                {children && children}
            </RouterLink>}
    </>
}


export default Link
