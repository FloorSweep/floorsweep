import React from "react"
import {css} from "../../helpers/css";
import Pane, {PaneType} from "../Pane/Pane";
import {PropsWithChildren} from "react";


const Demo: React.FC<PropsWithChildren<{title: string}>> = ({title, children}) => {
  return <div className={css("flex", "justify-center")}>
    <div className={css("w-full")}>
      <Pane type={PaneType.Dark} title={title} className={css("border-2", "border-dashed", "border-neutral-700", "flex", "flex-col", "gap-3")}>
        {children}
      </Pane>
    </div>
  </div>
}

export const SubDemo: React.FC<PropsWithChildren<{title: string}>> = ({title, children}) => {
  return <div>
    <div className={css("text-sm", "text-neutral-400", "mb-1")}>{title}</div>
    {children}
  </div>
}

export default Demo
