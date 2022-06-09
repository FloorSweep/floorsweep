import React, {PropsWithChildren, useState} from "react"
import {isDev} from "./helpers";
import Button, {ButtonVariant} from "../components/Button/Button";
import {css} from "../helpers/css";


const Dev: React.FC<PropsWithChildren<{}>> = ({children}) => {
  if (isDev()) {
    return <>
      {children}
    </>
  } else return null
}

export const DevToggle: React.FC<PropsWithChildren<{}>> = ({children}) => {
  const [show, setShow] = useState(false)
  return <Dev>
    <div className={css("flex", "my-2", "p-5")}>
      <div className={css("text-pink-400")}>
        <Button variant={ButtonVariant.Black} onClick={() => setShow(!show)}>
          {show ? "-" : "+"}
        </Button>
        <div className={css("text-xs", "text-center", "text-pink-400", "mt-1")}>dev</div>
      </div>
      {show && <div className={css("ml-5")} style={{overflowWrap: "anywhere"}}>{children}</div>}
    </div>
  </Dev>
}

export default Dev
