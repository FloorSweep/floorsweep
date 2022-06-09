import {NFT, NFTStatus, OrderStatus} from "../../interfaces";
import {Ratio} from "zksync/build/types";

const nft: NFT = {
    "id": 33,
    "address": "0xF83422141837AD830f93013345652cc958ca17c4",
    "createdAt": "2022-05-29T18:27:29.596Z",
    "updatedAt": "2022-05-29T18:27:29.596Z",
    "tokenId": 113792,
    "imageCID": "Qme1VN8nHYrBBxw4yR7ts1cBKyXbh8MLwtZa3MjAYNGiNq",
    "metadataCID": "QmaLLB4ykR9nbcV8Bs2GcEmQBtFzgFsJLCj3xDzsYS9ZVt",
    "zkContentHash": "0xb237490eec520faa6cf0ced372a1b2316b7a11c1b51736301d148ae5670cba3b",
    "creatorAddress": "0xd801d86C10e2185a8FCBccFB7D7baF0A6C5B6BD5",
    "ownerAddress": "0xf716B2783c6dD45753b99Fc28636b0E1a0376179",
    "metadata": {
        "name": "ded",
        "image": "ipfs://Qme1VN8nHYrBBxw4yR7ts1cBKyXbh8MLwtZa3MjAYNGiNq",
        "imageCID": "Qme1VN8nHYrBBxw4yR7ts1cBKyXbh8MLwtZa3MjAYNGiNq",
        "attributes": [],
        "description": "rip"
    },
    "order": [{
        "id": 2,
        "tokenId": 113792,
        "nonce": 31,
        "price": 0.0001,
        "zkCurrencyId": 1,
        "zkCurrencySymbol": "USDC",
        "zkOrder": {
            "nonce": 31,
            "ratio": ["1", "100000000000000"] as Ratio,
            "amount": "1",
            "tokenBuy": 0,
            "accountId": 214010,
            "recipient": "0xf716B2783c6dD45753b99Fc28636b0E1a0376179",
            "signature": {
                "pubKey": "82659e3161b8c5f7443973acac3afd7e3aaf66f70f4eb8e75d38527bff686927",
                "signature": "5f91bcf6ea1804228ca90ef1eccfea94c84927d06ce1c43dfb3ae8187eebcb0a171cccc7f91ece1610073b06a07613888aed5f81e945482a9c84978889c1ab03"
            },
            "tokenSell": 113792,
            "validFrom": 0,
            "validUntil": 4294967295,
            "ethSignature": {
                "type": "EthereumSignature",
                "signature": "0x2caa6a68a4222d01da015f4bcbf479f18b6b2ee0769332c3e6aff8373260ad852b058845b88e7e017da606c576013bd31e5046791849c82d393b47961f4162ce1b"
            }
        },
        "status": "completed" as OrderStatus.completed,
        "sellerAddress": "0xf716B2783c6dD45753b99Fc28636b0E1a0376179",
        "buyerAddress": "0xd801d86C10e2185a8FCBccFB7D7baF0A6C5B6BD5",
        "txId": "sync-tx:7bac7a459a48e80236738dc48e934422112c58d9adbfc48b53fcc770bdc8e4af"
    }],
    "isForSale": false,
    "isVisible": true,
    "status": "verified" as NFTStatus,
    "nftObject": {
        "id": 113792,
        "status": "verified" as NFTStatus.verified,
        "symbol": "NFT-113792",
        "address": "0xf83422141837ad830f93013345652cc958ca17c4",
        "serialId": 26,
        "creatorId": 1284365,
        "contentHash": "0xb237490eec520faa6cf0ced372a1b2316b7a11c1b51736301d148ae5670cba3b",
        "creatorAddress": "0xd801d86c10e2185a8fcbccfb7d7baf0a6c5b6bd5"
    },
    "lastValidatedAt": "2022-05-29T20:55:53.506Z",
    "name": "ded",
    "imgWidth": 1639,
    "imgHeight": 2048,
    "imageUrl": "https://zznft.mypinata.cloud/ipfs/Qme1VN8nHYrBBxw4yR7ts1cBKyXbh8MLwtZa3MjAYNGiNq",
    "metadataUrl": "https://zznft.mypinata.cloud/ipfs/QmaLLB4ykR9nbcV8Bs2GcEmQBtFzgFsJLCj3xDzsYS9ZVt"
}


export default nft
