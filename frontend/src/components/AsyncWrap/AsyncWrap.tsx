import React, {PropsWithChildren} from "react";
import {css} from "../../helpers/css";
import Spinner from "../Spinner/Spinner";

export interface AsyncWrapProps {
    isLoading: boolean;
    hasData: boolean;
    height?: number;
    renderLoading?: () => React.ReactNode;
    noDataMessage?: string;
}

const AsyncWrap: React.FC<PropsWithChildren<AsyncWrapProps>> = ({
    children,
    height = 200,
    isLoading,
    hasData,
    ...rest
}) => {
    const renderMessage = (message: string | JSX.Element) => {
        return <div className={css("w-full", "flex", "justify-center", "text-neutral-400", "items-center", "h-full", "flex-grow")}>
            {message}
        </div>
    }

    const renderLoading = () => {
        if (rest.renderLoading) {
            return rest.renderLoading()
        }
        return renderMessage(<div><Spinner/></div>)
    }

    const renderNoData = () => {
        if (rest.noDataMessage) {
            return renderMessage(rest.noDataMessage)
        }
        return renderMessage(<div>no items found</div>)
    }

    return <>
        {(() => {
            if (isLoading) {
                return renderLoading()
            } else if (!hasData) {
                return renderNoData()
            } else return children
        })()}
    </>
}

export default AsyncWrap
