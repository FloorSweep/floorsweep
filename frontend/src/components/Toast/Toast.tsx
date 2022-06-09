import {toast} from "react-toastify";
import {isDev} from "../../environment/helpers";
import {css} from "../../helpers/css";
import React from "react";
import Icon from "../Icon/Icon";

const toastBaseStyles = css("font-mono", "rounded-none", "text-white", "text-lg")

const CloseButton = () => <div className={css("text-white")}>
    <Icon icon={'close'} size={18}/>
</div>

export const successToast = (message: string) => {
    toast(message, {
        type: "success",
        className: css(toastBaseStyles, "bg-green-600"),
        icon: false,
        closeButton: <CloseButton/>
    })
}

export const errorToast = (message: string) => {
    toast(message, {
        type: "error",
        className: css(toastBaseStyles, "bg-red-600"),
        icon: false,
        closeButton: <CloseButton/>,
    })
}

export const debugToast = (message: string) => {
    console.log(`debugToast:::` + message);
    if (isDev()) {
        toast(<div>
            <div className={css("font-bold")}>🛠 DEV 🛠</div>
            <div>{message}</div>
        </div>, {
            type: "warning",
            className: css(toastBaseStyles, "bg-yellow-500", "border-2", "border-dashed", "border-yellow-700"),
            icon: false,
            closeButton: <CloseButton/>
        })
    }
}
