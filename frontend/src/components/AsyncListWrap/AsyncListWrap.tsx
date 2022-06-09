import React, {PropsWithChildren} from "react";
import AsyncWrap, {AsyncWrapProps} from "../AsyncWrap/AsyncWrap";
import {css} from "../../helpers/css";

interface AsyncListWrapProps extends Omit<AsyncWrapProps, 'renderLoading'> {
    quantity?: number;
    renderRow?: () => React.ReactNode;
    className?: string;
    layout?: 'col' | 'row'
}

const AsyncListWrap: React.FC<PropsWithChildren<AsyncListWrapProps>> = ({
    quantity = 5,
    layout = 'col',
    ...props
}) => {
    const renderRow = () => {
        return <div>
            <div className={css("bg-neutral-800", "w-full")} style={{height: props.height ? props.height : 25}}/>
        </div>
    }

    return <AsyncWrap
        {...props}
        renderLoading={() => {
            return <div className={css("flex", "gap-6", "animate-pulse", props.className, {
                'flex-col': layout === 'col',
                'justify-center': layout === 'row'
            })}>
                {new Array(quantity).fill(null).map((item, index) => {
                    return <div key={`async-list-wrap-${index}-${layout}-${quantity}`}>
                        {props.renderRow ? props.renderRow() : renderRow()}
                    </div>
                })}
            </div>
        }}
    />
}

export default AsyncListWrap
