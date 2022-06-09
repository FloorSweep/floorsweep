import React, {useCallback, useEffect, useState} from "react";
import {css} from "../../helpers/css";
import {AspectBox} from "../AspectBox/AspectBox";
import AsyncListWrap from "../AsyncListWrap/AsyncListWrap";
import {NFT} from "../../interfaces";
import NFTPreview from "../NFTPreview/NFTPreview";
import {observer} from "mobx-react";
import InfiniteScroll, {InfinteScrollProps} from "../InfiniteScroll/InfiniteScroll";
import AsyncWrap from "../AsyncWrap/AsyncWrap";


interface PaginableNftsProps extends Omit<InfinteScrollProps, 'threshold'> {
    nfts: NFT[];
    isLoading: boolean
}

const PaginableNfts: React.FC<PaginableNftsProps> = observer(({
                                                                  nfts,
                                                                  isLoading,
                                                                  ...rest
                                                              }) => {

    const renderLoader = () => {
        return <>
            {new Array(12).fill(null).map((_, index) => <AspectBox key={`aspect-box-${index}`} width={1}
                                                                   height={1.288059701}
                                                                   className={css("bg-neutral-900", "animate-pulse")}/>)}
        </>
    }

    const hasDataCss = css("mt-6", "grid", "grid-cols-1", "sm:grid-cols-2", "md:grid-cols-3", "lg:grid-cols-4", "xl:grid-cols-5", "gap-x-10", "gap-y-8")
    const noDataCss = css("flex-grow", "flex", "justify-center", "items-center", "text-neutral-400", "h-full")
    const hasData = nfts.length > 0

    return <InfiniteScroll {...rest}>
        <div className={css({
            [hasDataCss]: hasData || isLoading,
            [noDataCss]: !hasData && !isLoading,
        })}>
            <AsyncWrap
                isLoading={isLoading}
                hasData={hasData}
                noDataMessage={"No NFTs found"}
                renderLoading={() => renderLoader()}>
                {nfts.map(nft => <NFTPreview
                    nft={nft}
                    key={nft.id}
                />)}
            </AsyncWrap>
        </div>
    </InfiniteScroll>
})

export default PaginableNfts
