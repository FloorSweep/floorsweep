import {css} from "../../helpers/css";
import {NFT, NFTStatus} from "../../interfaces";
import {useNavigate} from "react-router-dom";
import Marquee from "../Marquee/Marquee";
import Dev from "../../environment/Dev";
import {PropsWithChildren} from "react";

interface NFTStatusProps {
    nft: NFT;
}

const DevNFTStatus = ({nft}: NFTStatusProps) => {
    return <Dev>
        <div className={css("text-neutral-400")}>
            {(() => {
                if (nft.status === "committed" || nft.status === "swapping") {
                    return <Marquee>
                        <StatusTag status={nft.status}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                        <StatusTag status={nft.status} className={css("ml-3")}/>
                    </Marquee>
                } else {
                    return;
                }
            })()}
        </div>
    </Dev>
}

const statusStyleMap = {
    'committed': css('bg-yellow-900', 'border-yellow-400'),
    'verified': css('bg-green-900', 'border-green-400'),
    'swapping': css('bg-pink-900', 'border-pink-400'),
}

const StatusTag: React.FC<{status: 'committed' | 'verified' | 'swapping', className?: string}> = ({status, className}) => {
    return <span className={css('border-2', 'border-dashed', "inline-block", 'text-xs', 'text-neutral-100', 'rounded-lg', 'px-1', 'py-0.5', className, statusStyleMap[status])}>
        {status}
    </span>
}

export default DevNFTStatus
