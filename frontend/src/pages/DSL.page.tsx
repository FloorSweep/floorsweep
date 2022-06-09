import React from "react";
import FormDemo from "../components/Form/Form.demo";
import TextFieldDemo from "../components/TextField/TextField.demo";
import {css} from "../helpers/css";
import SignMessageDemo from "../components/Demo/SignMessageDemo";
import ButtonDemo from "../components/Button/Button.demo";
import SelectDemo from "../components/Select/Select.demo";
import ToastDemo from "../components/Toast/Toast.demo";
import MarqueeDemo from "../components/Marquee/Marquee.demo";
import AsyncWrapDemo from "../components/AsyncWrap/AsynWrap.demo";
import AsyncListWrapDemo from "../components/AsyncListWrap/AsyncListWrap.demo";
import ToggleGroupDemo from "../components/ToggleGroup/ToggleGroup.demo";
import NFTPreviewDemo from "../components/NFTPreview/NFTPreview.demo";
import AspectBoxDemo from "../components/AspectBox/AspectBox.demo";
import InfiniteScrollDemo from "../components/InfiniteScroll/InfiniteScroll.demo";


const DSLPage = () => {
    return <div className={css("flex", "justify-center")}>
        <div className={css("flex", "flex-col", "gap-5", "max-w-4xl")}>
            <div className={css("text-center", "text-2xl")}>DSL</div>
            <ButtonDemo/>
            <SelectDemo/>
            <TextFieldDemo/>
            <FormDemo/>
            <SignMessageDemo/>
            <ToastDemo/>
            <MarqueeDemo/>
            <AsyncWrapDemo/>
            <AsyncListWrapDemo/>
            <ToggleGroupDemo/>
            <NFTPreviewDemo/>
            <AspectBoxDemo/>
            <InfiniteScrollDemo/>
        </div>
    </div>
}

export default DSLPage
