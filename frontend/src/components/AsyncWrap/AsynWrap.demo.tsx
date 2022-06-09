import React, {useState} from "react";
import Demo from "../Demo/Demo";
import AsyncWrap from "./AsyncWrap";
import Button from "../Button/Button";
import {css} from "../../helpers/css";

const AsyncWrapDemo = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [hasData, setHasData] = useState(false)

    return <Demo title={"Async Wrap"}>
        <div className={css("grid", "grid-cols-3")}>
            <div className={css("col-span-2")}>
                <AsyncWrap isLoading={isLoading} hasData={hasData}>
                    <div className={css("flex", "flex-col", "text-red-500", "font-bold", "text-center")}>
                        <div>so much important data here!</div>
                        <div>check it out!</div>
                    </div>
                </AsyncWrap>
            </div>
            <div className={css("grid", "gap-5", "col-span-1")}>
                <Button block onClick={() => setIsLoading(!isLoading)}>
                    toggle isLoading
                </Button>
                <Button block onClick={() => setHasData(!hasData)}>
                    toggle hasData
                </Button>
            </div>
        </div>
    </Demo>
}

export default AsyncWrapDemo
