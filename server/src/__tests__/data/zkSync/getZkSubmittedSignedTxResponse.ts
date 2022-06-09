import {SignedTransaction} from "zksync/src/types";
import {Transaction} from "zksync";
import {noop, noopAsync} from "../../helpers";
import getZkSyncTxReceipt from "./getZkTxReceipt";

/**
 * Get mintNFT body produced from zksync.Wallet.signMintNFT()
 * Returns response from zkSync submitSignedTransaction call
 */
export const getZkSyncSubmittedSignedTxResponse = (tx: SignedTransaction): Transaction => {
    return {
        txData: tx,
        "txHash": "sync-tx:ef3ed918383214e955e32fc4d109c677a3b69f3cb20e686df721546cdb4e1940",
        "sidechainProvider": {
            "pollIntervalMilliSecs": 1000,
            "transport": {"address": "https://rinkeby-api.zksync.io/jsrpc"},
            "providerType": "RPC",
            "contractAddress": {
                "mainContract": "0x82F67958A5474e40E1485742d648C0b0686b6e5D",
                "govContract": "0xC8568F373484Cd51FDc1FE3675E46D8C0dc7D246"
            },
            //@ts-ignore
            "tokenSet": {
                "tokensBySymbol": {
                    "ERC20-24": {
                        "id": 24,
                        "address": "0xb770ea0f1762d73c8719b52ef981f7f1d824d9a7",
                        "symbol": "ERC20-24",
                        "decimals": 18,
                        "kind": "ERC20",
                        "is_nft": false
                    },
                    "ETH": {
                        "id": 0,
                        "address": "0x0000000000000000000000000000000000000000",
                        "symbol": "ETH",
                        "decimals": 18,
                        "kind": "ERC20",
                        "is_nft": false
                    }
                }
            },
            "network": "rinkeby"
        },
        "state": "Committed",
        //@ts-ignore
        awaitReceipt: async () => {
            return getZkSyncTxReceipt()
        },
        //@ts-ignore
        awaitVerifyReceipt: noopAsync,
        setErrorState: noop,
        throwErrorIfFailedState: noop
    }
}