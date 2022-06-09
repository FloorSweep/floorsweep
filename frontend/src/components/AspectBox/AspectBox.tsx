import {PropsWithChildren} from "react";
import {css} from "../../helpers/css";

export interface AspectBoxProps {
    width: number;
    height: number;
    className?: string;
}

export const AspectBox: React.FC<PropsWithChildren<AspectBoxProps>> = ({
                                                                           children,
                                                                           width,
                                                                           height,
                                                                           className
                                                                       }) => {
    return <div className={css("m-auto", "max-w-full", "w-full")}>
        <div
            className={css("w-full", "relative", "overflow-hidden", "h-0", className)}
            style={{
                paddingTop: `${height / width * 100}%`
            }}
        >
            <div
                className={css("absolute", "left-0", "top-0", "w-full", "h-full", "flex", "justify-center", "items-center")}>
                {children}
            </div>
        </div>
    </div>
}
