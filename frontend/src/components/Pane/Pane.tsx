import React, {PropsWithChildren} from "react"
import {css} from "../../helpers/css";

export enum PaneSize {
  sm = "sm",
  md = "md"
}

export enum PaneType {
  Dark = "dark",
  Light = "light"
}

const baseStyles = css("rounded-sm")

const sizeStyles = {
  [PaneSize.sm]: css("p-2"),
  [PaneSize.md]: css("p-5")
}

const typeStyles = {
  [PaneType.Dark]: css("bg-black", "border-2", "border-solid", "border-neutral-800"),
  [PaneType.Light]: css("bg-neutral-800")
}


interface PaneProps {
  size?: PaneSize;
  title?: string;
  className?: string;
  type?: PaneType
}

const Pane: React.FC<PropsWithChildren<PaneProps>> = ({size = PaneSize.md, type = PaneType.Dark, title, className, children}) => {
  return <div className={css(sizeStyles[size], typeStyles[type], baseStyles, "w-full", "flex", "flex-col", className)}>
    {title && <div className={css("mb-3", "text-base", "text-neutral-400")}>{title}</div>}
    {children}
  </div>
}

export default Pane
