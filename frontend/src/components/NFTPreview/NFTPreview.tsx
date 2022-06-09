import {css} from "../../helpers/css";
import {NFT} from "../../interfaces";
import {AspectBox} from "../AspectBox/AspectBox";
import {Link as RouterLink} from "react-router-dom";
import {abbreviate, jsonify} from "../../helpers/strings";
import Link, {LinkVariant} from "../Link/Link";
import useDisplayName from "../../hooks/useDisplayName";
import DevNFTStatus from "./DevNFTStatus";

interface NFTPreviewProps {
    nft: NFT;
}

const NFTPreview = ({nft}: NFTPreviewProps) => {
    const maxSize = 500
    const {displayName} = useDisplayName(nft.creatorAddress)
    return <div className={css("flex", "flex-col", "border-2", "border-solid", "border-neutral-800", "rounded-sm")}>
        <RouterLink to={`/nft/${nft.tokenId}`} state={{nft: jsonify(nft)}}>
            <div className={css("break-all", "text-sm", "cursor-pointer", "relative", "min-h-0", "flex-grow",
                "hover-hover:hover:opacity-70", "transition-opacity")}>
                <div className={css("h-full", "w-full", "flex", "items-center", "overflow-hidden")}>
                    <div className={css("h-full", "w-full", "overflow-hidden", "flex", "items-center", "bg-cover",
                        "bg-no-repeat", "bg-center")}
                         style={{backgroundImage: `url(${nft.imageUrl})`}}>
                        <AspectBox width={maxSize} height={maxSize}/>
                    </div>
                </div>
            </div>
        </RouterLink>
        <div className={css("text-neutral-400", "p-3")} style={{maxWidth: maxSize}}>
            <div className={css("flex", "flex-col", "text-white", "text-base", "space-y-2")}>
                <div className={css("flex", "justify-between", "flex-grow", "w-full", "break-words", "items-center")}>
                    <div className={css("flex", "flex-col", "w-full")}>
                        <div
                            className={css("font-bold", "whitespace-nowrap", "overflow-hidden", "overflow-ellipsis")}>
                            {nft.metadata.name}
                        </div>
                        <div className={css("flex", "items-center", "space-x-2")}>
                            <div className={css("text-neutral-400")}>by</div>
                            <Link variant={LinkVariant.Grey} href={`/profile/${nft.creatorAddress}`}>
                                {displayName}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className={css("bg-neutral-800")} style={{height: 2}}/>
                <div className={css("flex", "justify-between")}>
                    <div className={css("text-neutral-400", "text-sm")}>#{nft.tokenId}</div>
                    {nft.isForSale && <div>
                      <div>{nft.salePrice} {nft.saleCurrency}</div>
                    </div>}
                </div>
            </div>
        </div>
        <DevNFTStatus nft={nft}/>
    </div>
}

export default NFTPreview
