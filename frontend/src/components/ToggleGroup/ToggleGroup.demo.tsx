import React, {useState} from "react";
import Demo from "../Demo/Demo";
import ToggleGroup from "./ToggleGroup";
import {ButtonVariant} from "../Button/Button";

const ToggleGroupDemo = () => {
    const [value, setValue] = useState("left")
    return <Demo title={"Toggle Group"}>
        <ToggleGroup
            variant={ButtonVariant.Black}
            items={[
                {value: "right", content: "+"},
                {value: "left", content: "+"}
            ]}
            value={value}
            onChange={setValue}
        />
        <div>{value}</div>
    </Demo>
}

export default ToggleGroupDemo

