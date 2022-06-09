import {AccountState} from "zksync/build/types";

/**
 * Get empty zkSync account state
 * @param address: address
 */
export const getZkAccountState = (address: string): AccountState => {
    return {
        address,
        id: 0,
        accountType: 'Owned',
        depositing: {balances: {}},
        committed: {
            balances: {},
            nfts: {},
            mintedNfts: {},
            nonce: 0,
            pubKeyHash: ""
        },
        verified: {
            balances: {},
            nfts: {},
            mintedNfts: {},
            nonce: 0,
            pubKeyHash: ""
        }
    }
}

export default getZkAccountState