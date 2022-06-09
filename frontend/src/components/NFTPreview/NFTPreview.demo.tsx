import React from "react";
import Demo, {SubDemo} from "../Demo/Demo";
import NFTPreview from "./NFTPreview";
import nft from "./NFTPreview.data";
import {css} from "../../helpers/css";
import {OrderStatus} from "../../interfaces";

const NFTPreviewDemo = () => {
    const nftWithNewOrder = {...nft, order: [{...nft.order[0], status: OrderStatus.new}], isForSale: true}
    return <Demo title={"NFT Preview"}>
        <div className={css("grid", "grid-cols-2")}>
            <SubDemo title={"Details hidden"}>
                <NFTPreview nft={nft}/>
            </SubDemo>
            <SubDemo title={"For sale details hidden"}>
                <NFTPreview nft={nftWithNewOrder}/>
            </SubDemo>
        </div>
    </Demo>
}

export default NFTPreviewDemo