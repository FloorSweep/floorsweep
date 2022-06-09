import React from "react";
import Demo, {SubDemo} from "../Demo/Demo";
import Button from "../Button/Button";
import {debugToast, errorToast, successToast} from "./Toast";
import {css} from "../../helpers/css";

const ToastDemo = () => {
    return <Demo title={"Toast"}>
        <div className={css("flex", "justify-between")}>
            <SubDemo title={"Success"}>
                <Button onClick={() => successToast("Success")}>Success</Button>
            </SubDemo>
            <SubDemo title={"Error"}>
                <Button onClick={() => errorToast("Error")}>Error</Button>
            </SubDemo>
            <SubDemo title={"Debug"}>
                <Button onClick={() => debugToast("Debug")}>Debug</Button>
            </SubDemo>
        </div>
    </Demo>
}

export default ToastDemo
