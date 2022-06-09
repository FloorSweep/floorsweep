import {SignedTransaction} from "zksync/src/types";

/**
 * Get mintNFT body produced from zksync.Wallet.signMintNFT()
 * @param creatorAddress: creator of the token
 * @param recipient: recipient of the minted token
 * @param contentHash: hash of the content
 * NOTE: signatures in this payload will not match ones the testing wallet would create
 * this should only be used for testing & should not be broadcast to zksync
 */

export const getZkSyncSignedMintNft = ({creatorAddress, recipient, contentHash}: {
    creatorAddress: string,
    recipient: string,
    contentHash: string
}): SignedTransaction => {
    return {
        "tx": {
            creatorAddress,
            recipient,
            contentHash,
            "creatorId": 1284365,
            "fee": "28700000000000",
            "nonce": 78,
            "type": "MintNFT",
            "feeToken": 0,
            "signature": {
                "pubKey": "f3e8d9aa8d06ab748118582c8dec67e71409fcd63a2d907723cb0a1695079080",
                "signature": "42acbe1abaf7e09ed0e02a3769feb52c9e335fe68ac89c70698b20a49088bba40c7dfca90805be8fcf7b33d476b2c78aa2cd902cb429a99d18e20a02ae071204"
            }
        },
        "ethereumSignature": {
            "type": "EthereumSignature",
            "signature": "0xf4eb0f9bf6aac4508f73c45da25b811280184ebf9e02f91f2a6253134a93ae9b4dbea24a620f784eed0eaa2f2790de5a4365c373b29869050c154c3de75f75ef1b"
        }
    }
}