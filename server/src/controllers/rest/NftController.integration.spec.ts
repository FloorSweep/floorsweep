import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { NftController } from "./NftController";
import { Server } from "../../Server";
import {
    createRandomUser,
    getApiAuthHeaders, getRandomNFTs
} from "../../__tests__/helpers";
import { AccountController } from "./AccountController";
import path from "path"
import { FILE_UPLOAD_KEY } from "../../config/multer";
import { sleep } from "zksync/build/utils";
import { ZkSyncService } from "../../services/ZkSyncService";
import * as zksync from "zksync"
import {BigNumberish, Wallet} from "ethers";
import {SyncJobService} from "../../services/SyncJobService";
import {Address, ApiTransaction, Signature, SignedTransaction} from "zksync/src/types";
import {PinataService} from "../../services/PinataService";
import axios from "axios";
import {getZkAccountState} from "../../__tests__/data/zkSync/getZkAccountState";
import {getZkSyncSignedMintNft} from "../../__tests__/data/zkSync/getZkSignedMintNFTTx";
import {getZkSyncSubmittedSignedTxResponse} from "../../__tests__/data/zkSync/getZkSubmittedSignedTxResponse";
import getZkNFTOwner from "../../__tests__/data/zkSync/getZkNFTOwner";
import getZkAccountInfo from "../../__tests__/data/zkSync/getZkAccountInfo";
import {Metadata} from "../../interfaces/Nft.interfaces";
import {MAX_PAGE_SIZE} from "../../schemas/CursorPaginationSchema";
import {BadRequest} from "@tsed/exceptions";
import {arrayMerge} from "../../helpers/arrays";

describe("NftController", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;

    beforeEach(PlatformTest.bootstrap(Server, {
        mount: {
            "/": [NftController, AccountController]
        }
    }));

    beforeEach(() => {
        request = SuperTest(PlatformTest.callback());
    });

    afterEach(async () => {
        await sleep(500)
        await PlatformTest.reset()
    });


    type MetadataUpload = Partial<Pick<Metadata, 'attributes' | 'name' | 'description'>>
    const uploadMetadataOrFail = async (wallet: Wallet, data?: MetadataUpload) => {
        const {jsonIpfsHash} = mockPinataUpload()
        const pathToImage = path.resolve(__dirname, "../../__tests__/test_image.png")

        const name = data?.name ? data?.name : "Test NFT"
        const description = data?.description ? data.description : "test description"
        const attributes = data?.attributes ? data.attributes : []

        const { body: { contentHash, metadata } }  = await request.post("/nft/metadata")
            .attach(FILE_UPLOAD_KEY, pathToImage)
            .field("name", name)
            .field("description", JSON.stringify(description))
            .field("attributes", JSON.stringify(attributes))
            .set(await getApiAuthHeaders(wallet, {name, description: JSON.stringify(description), attributes: JSON.stringify(attributes), file: "test_image.png"}))
            .expect(200)

        const zk = PlatformTest.get<ZkSyncService>(ZkSyncService)
        expect(contentHash).toEqual(zk.getContentHashFromCID(jsonIpfsHash))
        return {contentHash, metadata}
    }

    const mintNFT = async (wallet: Wallet, {contentHash, metadata}: {contentHash: string, metadata: object}) => {
        const tx = getZkSyncSignedMintNft({
            creatorAddress: wallet.address,
            recipient: wallet.address,
            contentHash
        })

        const zkService = PlatformTest.get<ZkSyncService>(ZkSyncService)
        jest.spyOn(zkService, 'submitSignedTransaction').mockResolvedValueOnce(getZkSyncSubmittedSignedTxResponse(tx))
        mockZkSyncTxData(wallet.address)
        mockZkSyncGetNFTIdByTxHash(Math.floor(Math.random() * 100000))

        const {body} = await request.post("/nft")
            .set(await getApiAuthHeaders(wallet, {tx}))
            .send({tx})
        const responseTx = body.tx.txData.tx
        console.log("debug:: responseTx", responseTx)
        expect(responseTx.creatorAddress).toEqual(wallet.address)
        expect(responseTx.contentHash).toEqual(contentHash)

        // NOTE: in application land, we queue agenda jobs for syncing address. here we do it manually.
        await mockAgendaSyncAddress(wallet.address, metadata)
    }

    const createUserAndMint = async (metadata?: MetadataUpload) => {
        const { wallet } = await createRandomUser(request)
        const nftData = await uploadMetadataOrFail(wallet, metadata)
        await mintNFT(wallet, nftData)
        return {wallet, nftData}
    }

    const mockAgendaSyncAddress = async (address: string, metadata: any) => {
        mockZkSyncGetStateResponse(address)
        const syncService = PlatformTest.get<SyncJobService>(SyncJobService)
        const {owned, minted} = await syncService.processAddress(address)

        // maybeResyncNFT()
        for (let i = 0; i < owned.length; ++i) {
            await mockAgendaSyncNFT(owned[i].creatorAddress, owned[i].id, metadata);
        }
        for (let i = 0; i < minted.length; ++i) {
            await mockAgendaSyncNFT(minted[i].creatorAddress, minted[i].id, metadata);
        }
    }

    const mockAgendaSyncNFT = async (creatorAddress: string, tokenId: number, metadata: object) => {
        const zkService = PlatformTest.get<ZkSyncService>(ZkSyncService)
        const syncService = PlatformTest.get<SyncJobService>(SyncJobService)

        // NOTE: creator's address needs to exist in mock getState() here
        const nft = await zkService.getNFTFromCreator(creatorAddress, tokenId)
        jest.spyOn(zksync.RestProvider.prototype, 'getNFTOwner').mockResolvedValue(getZkNFTOwner(0))
        jest.spyOn(zksync.RestProvider.prototype, 'accountInfo').mockResolvedValue(getZkAccountInfo(creatorAddress, 0))
        mockAxiosGetMetadata(metadata)
        await syncService.processNft(nft)
    }

    const mockZkSyncGetStateResponse = (address: string) => {
        const accountState = getZkAccountState(address)
        const mockOwnedCommitted = getRandomNFTs(1).reduce((o, nft) => ({...o, [nft.id]: {...nft, ownerAddress: address, creatorAddress: address}}), {});
        const mockMintedCommitted = mockOwnedCommitted
        accountState.committed.nfts = mockOwnedCommitted
        accountState.committed.mintedNfts = mockMintedCommitted
        accountState.verified.nfts = mockOwnedCommitted
        accountState.verified.mintedNfts = mockMintedCommitted

        jest.spyOn(zksync.Provider.prototype, 'getState').mockResolvedValue(accountState)
    }

    const mockPinataUpload = () => {
        // NOTE: all hashes will be identical for now
        const fileIpfsHash = "QmRVhcHGVXDF24fB2zmuVMpeChbBinzGQjt3nPzVAEL6GW"
        const jsonIpfsHash = "QmWWdn5uS2Xoc4HLWDGg1pvN22bRPCAVp1yvn7CK93cWhj"
        const pinataService = PlatformTest.get<PinataService>(PinataService)
        jest.spyOn(pinataService['sdk'], 'pinFileToIPFS').mockResolvedValueOnce({
            IpfsHash: fileIpfsHash,
            PinSize: 1,
            Timestamp: (new Date()).toISOString()
        })
        jest.spyOn(pinataService['sdk'], 'pinJSONToIPFS').mockResolvedValueOnce({
            IpfsHash: jsonIpfsHash,
            PinSize: 1,
            Timestamp: (new Date()).toISOString()
        })
        return {fileIpfsHash, jsonIpfsHash}
    }

    const mockAxiosGetMetadata = (metadata: any) => {
        jest.spyOn(axios, 'get').mockResolvedValue({data: metadata})
    }

    const getNFTs = async (params?: Record<string, string>) => {
        let url = '/nft'
        if (params) {
            const paramString = new URLSearchParams(params)
            url += `?${paramString}`
        }
        const {body: {data, cursor}} = await request.get(url).expect(200)
        return {nfts: data, cursor}
    }

    const mockZkSyncTxData = (address: string) => {
        const zkSyncService = PlatformTest.get<ZkSyncService>(ZkSyncService)
        jest.spyOn(zkSyncService['restProvider'], 'txData').mockResolvedValueOnce({
            tx: {
                txHash: (Math.random() + 1).toString(36).substring(10),
                op: {
                    type: 'MintNFT',
                    creatorId: 0,
                    creatorAddress: address,
                    recipient: address,
                    contentHash: "0x1ba90b1408ff3591f6d7f2c40a4aa565e7db2a2769b0e58bae8323c9db559a78",
                    fee: 0,
                    feeToken: 0,
                    nonce: 0,
                    signature: {
                        pubKey: "",
                        signature: "",
                    },
                },
                status: 'committed',
            },
            ethSignature: '',
        })
    }

    const mockZkSyncGetNFTIdByTxHash = (id: number) => {
        const zkSyncService = PlatformTest.get<ZkSyncService>(ZkSyncService)
        jest.spyOn(zkSyncService['restProvider'], 'getNFTIdByTxHash').mockResolvedValueOnce(id)
    }

    it("should call POST /nft/metadata", async () => {
        const { wallet } = await createRandomUser(request)
        await uploadMetadataOrFail(wallet)
    })

    it("should POST /nft/metadata then POST /nft", async () => {
        await createUserAndMint()
        expect((await getNFTs()).nfts.length).toBeGreaterThan(0)
    })

    it("should mint 2 nfts and GET /nft", async () => {
        const { wallet } = await createRandomUser(request)
        const data = await uploadMetadataOrFail(wallet, {
            name: 'lookatmenow',
            description: 'buymebaby',
            attributes: [{trait_type: 'size', value: 'large'}]
        })

        const countNftsToMint = 2
        for (let i = 0; i < countNftsToMint; i++) {
            await mintNFT(wallet, data)
        }
        expect((await getNFTs({ownerAddress: wallet.address})).nfts.length).toEqual(countNftsToMint)
    }, 15 * 1000)

    it("should mint an NFT and filter by name", async () => {
        const name = "BESTNFT"
        await createUserAndMint({name})
        expect((await getNFTs({name})).nfts.length).toEqual(1)
    })

    it("should mint 3 nfts and paginate", async () => {
        const { wallet } = await createRandomUser(request)
        const data = await uploadMetadataOrFail(wallet, {name: "Paginate me", description: ""})
        const countToMint = 3
        for (let i = 0; i < countToMint; i++) {
            await mintNFT(wallet, data)
        }

        const pageSize = 1
        let totalNFTs: any[] = []
        const {nfts, cursor} = await getNFTs({
            pageSize: pageSize.toString(),
            ownerAddress: wallet.address
        })
        totalNFTs = arrayMerge(totalNFTs, nfts)

        let paginateCursor = cursor
        while (paginateCursor) {
            const {nfts: moreNfts, cursor: resCursor} = await getNFTs({
                pageSize: pageSize.toString(),
                cursor: paginateCursor.toString(),
                ownerAddress: wallet.address
            })
            totalNFTs = arrayMerge(totalNFTs, moreNfts)
            paginateCursor = resCursor
        }
        expect(totalNFTs.length).toEqual(countToMint)
    }, 15 * 10000)

    it(`should reject due to too large pageSize (${MAX_PAGE_SIZE + 1})`, async () => {
        await request.get(`/nft?pageSize=${MAX_PAGE_SIZE + 1}`).expect(BadRequest.STATUS)
    })

    it("should mint an nft and get it by id", async () => {
        const {wallet} = await createUserAndMint()
        const {nfts} = await getNFTs({ownerAddress: wallet.address})
        expect(nfts.length).toEqual(1)
        const nftFromFeed = nfts[0]
        console.log("DEBUG:::::: NFTFROMFEED", nftFromFeed)
        const tokenId = nftFromFeed.tokenId
        const {body: singleNft} = await request.get(`/nft/${tokenId}`)
        expect(singleNft).toEqual(nftFromFeed)
    })

    it("should return nfts with multiple filters", async () => {
        const name = "silkroad"
        const {wallet} = await createUserAndMint({
            name,
            description: "ezra miller will never see this",
            attributes: [{trait_type: "material", value: "nylon"}]
        })
        const {nfts} = await getNFTs({
            ownerAddress: wallet.address,
            creatorAddress: wallet.address,
            name
        })
        expect(nfts.length).toEqual(1)
    })

    it("should filter nft metadata name with startswith", async () => {
        const name = "Solvency #123 -- obfuscatethisincaseweusesolvency#123elsewhere"
        await createUserAndMint({
            name
        })
        const {nfts} = await getNFTs({name: name.substring(0, 3)})
        expect(nfts.length).toEqual(1)
        expect(nfts[0].name).toEqual(name)
    })

    it("should reject with invalid query parameters", async() => {
        await request.get("/nft?whatIsThis=duh").expect(BadRequest.STATUS)
    })
});
