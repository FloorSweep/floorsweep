import React, {useState} from "react";
import Demo, {SubDemo} from "../Demo/Demo";
import InfiniteScroll from "./InfiniteScroll";
import {css} from "../../helpers/css";
import Button, {ButtonVariant} from "../Button/Button";

const InfiniteScrollDemo = () => {
    const [dataLength, setDataLength] = useState(10)
    const [fullScrollHeight, setFullScrollHeight] = useState(200)
    const [height, setHeight] = useState(500)
    const [fullPageHasMoreData, setFullPageHasMoreData] = useState(false)
    return <Demo title={"Infinte Scroll Demo"}>
        <SubDemo title={"Scroll By Container"}>
            <InfiniteScroll
                dataLength={dataLength}
                height={250}
                next={() => {
                    setTimeout(() => {
                        setDataLength(dataLength + 1)
                        setHeight(height + 500)
                    }, 500)
                }}
                hasMore={true}
            >
                <div
                    className={css("border-2", "border-dashed", "border-red-300")}
                    style={{
                        height,
                        backgroundSize: "20px 20px",
                        backgroundImage: "linear-gradient(to right, grey 1px, transparent 1px), linear-gradient(to bottom, grey 1px, transparent 1px)"
                    }}
                />
            </InfiniteScroll>
        </SubDemo>
        <SubDemo title={"Scroll By Document"}>
            <div className={css("flex", "justify-center", "mb-4")}>
                <Button variant={ButtonVariant.Black} onClick={() => {
                    setFullPageHasMoreData(!fullPageHasMoreData)
                    setDataLength(0)
                    setFullScrollHeight(200)
                }}>{fullPageHasMoreData ? "stop infinite scroll" : "enable infinite scroll"}</Button>
            </div>
            <InfiniteScroll
                dataLength={dataLength}
                next={() => {
                    setTimeout(() => {
                        setDataLength(dataLength + 1)
                        setFullScrollHeight(fullScrollHeight + 100)
                    }, 500)
                }}
                hasMore={fullPageHasMoreData}
                endDataMessage={"end of page"}
            >
                <div
                    className={css("border-2", "border-dashed", "border-red-300")}
                    style={{
                        height: fullScrollHeight,
                        backgroundSize: "20px 20px",
                        backgroundImage: "linear-gradient(to right, grey 1px, transparent 1px), linear-gradient(to bottom, grey 1px, transparent 1px)"
                    }}
                />
            </InfiniteScroll>
        </SubDemo>
    </Demo>
}

export default InfiniteScrollDemo
