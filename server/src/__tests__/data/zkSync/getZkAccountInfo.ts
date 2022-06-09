import {ApiAccountInfo} from "zksync/build/types";

const getZkAccountInfo = (address: string, accountId: number): ApiAccountInfo => ({
    accountId,
    address,
    nonce: 0,
    pubKeyHash: '',
    lastUpdateInBlock: 0,
    balances: {},
    nfts: {},
    mintedNfts: {},
    accountType: 'Owned'
})

export default getZkAccountInfo
