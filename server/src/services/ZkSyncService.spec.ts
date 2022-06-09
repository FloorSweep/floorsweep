import {PlatformTest} from "@tsed/common";
import {ZkSyncService} from "./ZkSyncService";
import {getRandomNFTs} from "../__tests__/helpers";
import {getZkAccountState} from "../__tests__/data/zkSync/getZkAccountState";

describe("ZkSyncService", () => {
    beforeEach(PlatformTest.create);
    afterEach(PlatformTest.reset);

    const getInstance = () => {
        return PlatformTest.get<ZkSyncService>(ZkSyncService);
    }

    it("create an instance of the ZkSyncService", () => {
        const instance = getInstance();
        expect(instance).toBeInstanceOf(ZkSyncService);
    });

    it("should return all verified nfts", async () => {
        const instance = getInstance()

        const address = "0xa77Af3795aA6027A3D499925fF7C45728E924fd9"
        const uniqueNFTsCount = 10
        const mockOwnedCommitted = getRandomNFTs(uniqueNFTsCount)
        const mockMintedCommitted = mockOwnedCommitted
        // mockOwnedVerified = committed + 10 new random 'verified'
        const mockOwnedVerified = mockMintedCommitted.concat(getRandomNFTs(10))
        const mockMintedVerified = mockOwnedVerified

        const spy = jest.spyOn(instance['zkProvider'], 'getState').mockImplementation(async (address: string) => {
            const accountState = getZkAccountState(address)
            accountState.committed.nfts = mockOwnedCommitted.reduce((o, nft) => ({...o, [nft.id]: nft}), {})
            accountState.committed.mintedNfts = mockMintedCommitted.reduce((o, nft) => ({...o, [nft.id]: nft}), {})
            accountState.verified.nfts = mockOwnedVerified.reduce((o, nft) => ({...o, [nft.id]: nft}), {})
            accountState.verified.mintedNfts = mockMintedVerified.reduce((o, nft) => ({...o, [nft.id]: nft}), {})
            return accountState
        })

        const committed = (await instance.getUserNFTs(address, "committed")).owned;
        const verified = (await instance.getUserNFTs(address, "verified")).owned;
        expect(instance['zkProvider'].getState).toHaveBeenCalledTimes(2)
        expect(committed.length).toEqual(10);
        for (let i = 0; i < committed.length; ++i) {
            // all of mock committed are also in 'verified', so their deducted status will be 'verified'
            // so calling getUserNFTs('committed') can be tricky, as we return NFTs from getState().committed, but with
            // deducted actual status(which may be verified). That is because zkSync returns verified NFTs also in committed array.
            expect(committed[i].status).toEqual('verified');
        }
        for (let i = 0; i < verified.length; ++i) {
            expect(verified[i].status).toEqual('verified');
        }
        expect(verified.length).toEqual(20);
        spy.mockRestore()
    })

    it("should return verified and committed nfts", () => {
        const instance = getInstance()
    })
});
