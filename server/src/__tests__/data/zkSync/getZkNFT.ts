import {NFT} from "zksync/build/types";

const getZkNFT = ({...rest}: Partial<NFT>): NFT => ({
    id: 1,
    symbol: "",
    creatorId: 1,
    serialId: 1,
    address: "",
    creatorAddress: "",
    contentHash: "",
    ...rest
})

export default getZkNFT
