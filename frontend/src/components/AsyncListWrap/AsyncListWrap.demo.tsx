import React from "react";
import Demo, {SubDemo} from "../Demo/Demo";
import AsyncListWrap from "./AsyncListWrap";
import {css} from "../../helpers/css";

const AsyncListWrapDemo = () => {
    return <Demo title={"Async List Wrap"}>
        <SubDemo title={"Default List Wrap"}>
            <AsyncListWrap
                isLoading={true}
                hasData={false}
            />
        </SubDemo>
        <SubDemo title={"Custom Loader"}>
            <AsyncListWrap
                isLoading={true}
                hasData={false}
                quantity={3}
                renderRow={() => <div className={css("flex", "items-center")}>
                    <div className={css("rounded-full", "bg-neutral-800")} style={{width: 40, height: 40}}/>
                    <div className={css("bg-neutral-800", "w-full", "ml-4", "my-2", "self-stretch")}/>
                </div>}
            />
        </SubDemo>
    </Demo>
}

export default AsyncListWrapDemo
