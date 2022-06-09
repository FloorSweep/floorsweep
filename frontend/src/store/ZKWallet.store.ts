import {action, computed, makeObservable, observable} from "mobx";
import {Provider, Wallet} from "zksync";
import {BigNumber, BigNumberish, ethers} from "ethers";
import {Address, Nonce, Order, SignedTransaction, TokenLike} from "zksync/build/types";
import * as zksync from "zksync"
import {debugToast} from "../components/Toast/Toast";
import AppStore from "./App.store";
import {vars} from "../environment/vars";
import {TokenSet} from "zksync/build/utils";
import {objectKeys} from "../helpers/arrays";

class ZKWalletStore {

    @observable
    private syncProvider: Provider | null = null

    @observable
    wallet: Wallet | null = null

    @observable
    balances: { [token: string]: BigNumberish } | null = null

    @observable
    isWalletConnecting = false

    @observable
    tokenSet?: TokenSet;

    constructor() {
        makeObservable(this)
    }

    @action
    disconnect() {
        this.wallet = null
        this.isWalletConnecting = false
    }

    async init() {
        this.syncProvider = await zksync.getDefaultProvider(vars.TARGET_NETWORK_NAME)
        this.tokenSet = this.syncProvider.tokenSet
    }

    @action
    async connect(signer: ethers.Signer) {
        this.isWalletConnecting = true
        try {
            debugToast(`Connecting to zkSync on chain ID: ${await signer.getChainId()}`)
            const signerNetwork = await signer.provider!.getNetwork()
            if (signerNetwork.name !== vars.TARGET_NETWORK_NAME) {
                if (signerNetwork.name === "homestead" && vars.TARGET_NETWORK_NAME === "mainnet") {
                    //all good..
                } else {
                    throw new Error("Attempting to connect to the wrong network")
                }
            }
            this.wallet = await zksync.Wallet.fromEthSigner(signer, this.syncProvider!)
            if (!await this.wallet.isSigningKeySet()) {
                await this.unlockAccount()
            }
        } finally {
            this.isWalletConnecting = false
        }
    }

    async unlockAccount() {
        const accountId = await this.wallet!.getAccountId()
        if (accountId === undefined || accountId === null) {
            AppStore.modals.hideAll()
            AppStore.modals.isInitializeAccountModalVisible = true
            debugToast("Account does not exist on zkSync")
            throw new Error("zkSync account does not exist")
        }
        const tx = await this.wallet?.setSigningKey({
            feeToken: "ETH",
            ethAuthType: "ECDSA"
        })
        return await tx?.awaitReceipt()
    }

    async getSignedMintTransaction(mintNFT: {
        recipient: Address,
        contentHash: ethers.BytesLike,
        feeToken: TokenLike,
        fee?: BigNumberish,
        nonce?: Nonce,
    }) {
        mintNFT.nonce = mintNFT.nonce != null ? await this.wallet!.getNonce(mintNFT.nonce) : await this.wallet!.getNonce();
        mintNFT.contentHash = ethers.utils.hexlify(mintNFT.contentHash);

        // todo: COME BACK - CAN THIS BE 0 HERE WHEN IT NEEDS TO BE SET? feel like null check here was intentional
        if (!mintNFT.fee) {
            const fullFee = await this.syncProvider!.getTransactionFee('MintNFT', mintNFT.recipient, mintNFT.feeToken);
            mintNFT.fee = fullFee!.totalFee;
        }

        return await this.wallet!.signMintNFT(mintNFT as any);
    }

    async getZeroTransferToSelf(token: TokenLike) {
        const address = this.wallet!.address()
        const fee = await this.syncProvider!.getTransactionFee('Transfer', address, token)
        const nonce = await this.wallet!.getNonce()
        const transfer = {
            to: address,
            token: token,
            amount: 0,
            fee: fee.totalFee,
            nonce,
        }
        return this.wallet?.signSyncTransfer(transfer)
    }

    async getSellNFTOrder(tokenId: number, sellForCurrency: string, price: any) {
        return this.wallet?.getOrder({
            tokenSell: tokenId,
            tokenBuy: sellForCurrency,
            amount: 1,
            ratio: zksync.utils.tokenRatio({
                [tokenId]: 1,
                [sellForCurrency]: price
            })
        })
    }

    async getBuyNFTOrder(nftTokenId: TokenLike, buyForCurrency: TokenLike, price: string) {
        return this.wallet?.getOrder({
            tokenSell: buyForCurrency,
            tokenBuy: nftTokenId,
            amount: this.syncProvider!.tokenSet.parseToken(buyForCurrency, price),
            ratio: zksync.utils.tokenRatio({
                [buyForCurrency]: price,
                [nftTokenId]: 1
            })
        })
    }

    async getSwap(swap: {
        orders: [Order, Order];
        feeToken: TokenLike;
        amounts?: [BigNumberish, BigNumberish];
        nonce?: number;
        fee?: BigNumberish;
    }): Promise<SignedTransaction> {
        swap.nonce = swap.nonce != null ? await this.wallet!.getNonce(swap.nonce) : await this.wallet!.getNonce();
        if (swap.fee == null) {
            const fullFee = await this.syncProvider!.getTransactionFee('Swap', this.wallet!.address(), swap.feeToken);
            swap.fee = fullFee.totalFee;
        }

        if (swap.amounts == null) {
            let amount0 = BigNumber.from(swap.orders[0].amount);
            let amount1 = BigNumber.from(swap.orders[1].amount);
            if (!amount0.eq(0) && !amount1.eq(0)) {
                swap.amounts = [amount0, amount1];
            } else {
                throw new Error('If amounts in orders are implicit, you must specify them during submission');
            }
        }
        return this.wallet!.signSyncSwap(swap as any);
    }

    async getUserZkSyncBalances() {
        const state = await this.wallet!.getAccountState()
        this.balances = state.committed.balances
    }

    @computed
    get isWalletConnected() {
        return this.wallet!!
    }
}

export default ZKWalletStore
