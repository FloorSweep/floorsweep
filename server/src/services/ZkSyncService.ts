import {Inject, Injectable, OnInit} from "@tsed/di";
import * as zksync from 'zksync';
import {BigNumberish, ethers} from "ethers";
import {InfuraProvider} from '@ethersproject/providers';
import {Logger} from "@tsed/cli-core";
import * as types from "zksync/build/types";
import {NFT, SignedTransaction, TokenLike} from "zksync/build/types";
import {arrayFindByField, objectKeys} from "../helpers/arrays";
import {AgendaService} from "@tsed/agenda";
import {NFTWithStatus} from "../interfaces/Nft.interfaces";
import {ZZApp} from "./ZZApp";
import {NftStatus} from "../../prisma/generated/tsed";

const contentHash = require("content-hash")

function objectSortByKeys(obj: any) {
    const ret: any = {};
    const keys = Object.keys(obj).sort();
    for (let i = 0; i < keys.length; ++i) {
        ret[keys[i]] = obj[keys[i]];
    }
    return ret;
}

@Injectable()
export class ZkSyncService implements OnInit {
    private infuraProvider: ethers.providers.InfuraProvider;
    public zkProvider: zksync.Provider;
    public restProvider: zksync.RestProvider;
    private contentHashBuffer = "e30101701220"

    @Inject()
    logger: Logger;

    @Inject()
    agenda: AgendaService;

    @Inject()
    app: ZZApp;


    async $onInit() {
        // Connect to mainnet with a Project ID and Project Secret
        this.infuraProvider = new InfuraProvider(this.app.getNetworkName(), {
            projectId: process.env.INFURA_ID,
            projectSecret: process.env.INFURA_SECRET
        });
        this.zkProvider = await zksync.getDefaultProvider(this.app.getNetworkName());
        this.restProvider = await zksync.getDefaultRestProvider(this.app.getNetworkName());
        this.logger.info("Initialized ZKSYNC Provider")
    }

    async __walletDemo() {

        // @ts-ignore
        const ethWallet = new ethers.Wallet(process.env.TESTS_RINKEBY_PRV_KEY, this.infuraProvider);
        const zkWallet = await zksync.Wallet.fromEthSigner(ethWallet, this.zkProvider);
        this.logger.info("ZK--1");
        this.logger.info({transactions: await this.getAddrTransactions(zkWallet.address())});
        const state = await zkWallet.getAccountState();
        console.log({
            state,
            ETH: ethers.utils.formatEther(await ethWallet.getBalance()),
            ETHL2: ethers.utils.formatEther(await zkWallet.getBalance('ETH')),
            ETH_getEthereumBalance: ethers.utils.formatEther(await zkWallet.getEthereumBalance('ETH')),
        });
    }

    async getAddrNonce(addr: string) {
        const state = await this.zkProvider.getState(addr);
        this.logger.info({[addr]: state})
        return state.committed.nonce;
    }

    async shouldSetSigningKey(addr: string) {
        return !(await this.isSigningKeySet(addr));
    }

    async isZkEnabled(addr: string) {
        // we require the following
        // 1: funds have been sent to the address on zkSync (which will assign an ID to said account)
        // 2: the signing key has been set (allowing users to sign txs on zkSync)
        // more info here: (https://docs.zksync.io/dev/payments/basic.html#flow)
        return (await this.isAccountCreated(addr)) && (await this.isSigningKeySet(addr))
    }

    private async isAccountCreated(addr: string) {
        const zkSyncAddressId = (await this.restProvider.getState(addr)).id
        return zkSyncAddressId !== null && zkSyncAddressId !== undefined
    }

    private async isSigningKeySet(addr: string) {
        return (await this.restProvider.getState(addr)).committed.pubKeyHash !== "sync:0000000000000000000000000000000000000000"
    }

    async getAddrTransactions(addr: string) {
        const txs = await this.restProvider.accountTxsDetailed(addr, {
            from: "latest",
            limit: 100,
            direction: "older"
        })
        return txs.result?.list;
    }

    async getTokens() {
        const tokens = await this.zkProvider.getTokens();
        return objectSortByKeys(tokens);
    }

    async submitSignedTransaction(tx: SignedTransaction) {
        this.logger.info(`submitting zkSync tx: ${tx.tx}, with sig: ${tx.ethereumSignature}`)
        this.logger.debug("zkSync::submitSignedTransaction");
        this.logger.debug(tx);
        return await zksync.submitSignedTransaction(tx, this.zkProvider, false)
    }

    //
    // _getUserNFTs
    //
    // Description:
    // getState returns both verified & committed, with verified NFTs also being present in committed array.
    // We return only verified or committed NFTs, and try to determine actual status of the NFT - there may be
    // 'verified' NFTs returned if you query only committed, but not the other way around.
    private async _getUserNFTs(addr: string, status: "committed" | "verified" = "committed"): Promise<{ owned: NFTWithStatus[], minted: NFTWithStatus[] }> {
        const state = await this.zkProvider.getState(addr);

        // verified NFTs are in both committed, and verified maps, we return the higher status
        function getStatus(key: any): NftStatus {
            if (state.verified.nfts[key] != undefined || state.verified.mintedNfts[key] != undefined) {
                return NftStatus.verified;
            }
            if (state.committed.nfts[key] != undefined || state.committed.mintedNfts[key] != undefined) {
                return NftStatus.committed;
            }
            // This should never happen, NFT is either committed or verified
            throw new Error("Something went completely wrong!!");
        }

        const owned = objectKeys(state[status].nfts).map((key) => ({
            ...state[status].nfts[key],
            status: getStatus(key)
        }))
        const minted = objectKeys(state[status].mintedNfts).map(key => ({
            ...state[status].mintedNfts[key],
            status: getStatus(key)
        }))
        return {
            owned,
            minted
        };
    }

    async getUserNFTs(addr: string, status: "committed" | "verified" | "any" = "verified"): Promise<{ owned: NFTWithStatus[], minted: NFTWithStatus[] }> {
        addr = ethers.utils.getAddress(addr as string);
        if (status == "any") {
            const c = await this._getUserNFTs(addr, "committed");
            const v = await this._getUserNFTs(addr, "verified");
            return {
                owned: ([] as any[]).concat(c.owned, v.owned),
                minted: ([] as any[]).concat(c.minted, v.minted),
            }
        }
        return this._getUserNFTs(addr, status);
    }

    getContentHashFromCID = (CID: string) => {
        // https://github.com/pldespaigne/content-hash/blob/master/src/index.js
        const hash = "0x" + contentHash.fromIpfs(CID).split(this.contentHashBuffer)[1]
        return hash;
    }

    getCIDfromContentHash = (hash: string) => {
        const CID = contentHash.decode(this.contentHashBuffer + hash.split("0x")[1])
        if (this.getContentHashFromCID(CID) !== hash) {
            console.error(CID);
            console.error(hash);
            throw new Error("INVALID CID<=>CONTENT HASH CONVERSION!!!!!");
        }
        return CID;
    }

    getNFTIdByTxHash(hash: string) {
        return this.restProvider.getNFTIdByTxHash(hash);
    }

    getNFT(tokenId: number): Promise<NFT> {
        return this.restProvider.getNFT(tokenId)
    }

    // Get NFT using `getUserNFTs`, by this also returning `committed` NFTs
    async getNFTFromCreator(creatorAddress: string, tokenId: number): Promise<NFTWithStatus> {
            const nfts = await this.getUserNFTs(creatorAddress,"committed");
        const nft = arrayFindByField(nfts.minted, tokenId, 'id');

        if(!nft){
            throw new Error(`Error! getNFTFromCreator nft=${tokenId} does not belong to ${creatorAddress}`)
        }
        return nft;
    }

    async isTokenNFT(tokenId: number) {
        try {
            await this.getNFT(tokenId)
            return true
        } catch (e) {
            return false
        }
    }

    getNFTOwner(tokenId: number) {
        return this.restProvider.getNFTOwner(tokenId)
    }

    async getNFTOwnerAddress(tokenId: number) {
        const ownerId = await this.getNFTOwner(tokenId)
        return ownerId === null ? null : this.getChecksumAddress((await this.getAccountAddress(ownerId)));
    }
    getAccountInfo = async (idOrAddress: number | types.Address, infoType: "committed" | "finalized" = "committed") => {
        return this.restProvider.accountInfo(idOrAddress, infoType)
    }
    getAccountAddress = async (zkAccountId: number) => {
        return (await this.getAccountInfo(zkAccountId)).address
    }
    getConfig = async () => {
        return this.restProvider.config();
    }
    getNetworkStatus = async () => {
        return this.restProvider.networkStatus();
    }
    getChecksumAddress = (address: string) => {
        return ethers.utils.getAddress(address)
    }
    getTokenQuantityFormatted(token: TokenLike | number, amount: BigNumberish) {
        return this.restProvider.tokenSet.formatToken(token, amount)
    }
    resolveTokenSymbol(token: TokenLike | number) {
        return this.restProvider.tokenSet.resolveTokenSymbol(token)
    }
}
