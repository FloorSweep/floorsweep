import {NFTInfo} from "zksync/src/types";
import getZkNFT from "./getZkNFT";

const getZkNFTInfo = (): NFTInfo => ({
    ...getZkNFT({
        id: 1,
        symbol: "",
        creatorId: 1,
        serialId: 1,
        address: "",
        creatorAddress: "",
        contentHash: ""
    }),
    currentFactory: "",
    withdrawnFactory: "",
})

export default getZkNFTInfo
