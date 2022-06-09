import {ethers, Wallet} from "ethers";
import SuperTest from "supertest";
import {NFT} from "zksync/build/types";
import crypto from "crypto"
import {UpdateAccountParams} from "../interfaces/generated";

export const noopAsync = async () => ({})
export const noop = () => ({})

export const getApiAuthHeaders = async (wallet: Wallet, body: any) => {
    const now = new Date().toISOString()
    const message = JSON.stringify(body) + "_" + now
    const signature = await wallet.signMessage(message)
    return {
        "X-Timestamp": now,
        "X-Signature": signature,
        "X-Address": wallet.address
    }
}

export const createRandomUser = async (request: SuperTest.SuperTest<SuperTest.Test>) => {
    const wallet = ethers.Wallet.createRandom()
    const address = wallet.address
    const displayName = "test-user-" + Math.random();
    const email = displayName + "@test.com";
    const body: UpdateAccountParams = {
        email,
        displayName
    }
    const response = await request
        .post("/account/signup")
        .set(await getApiAuthHeaders(wallet, body))
        .send(body).expect(200);
    const {body: account} = response
    expect(account.displayName).toEqual(displayName)
    expect(account.address).toEqual(address)
    return {account, wallet}
}

/**
 * Get random NFT with status
 * @param id: id of token
 * @param status: zkSync status of said token
 */

export const getRandomNFT = (id: number): NFT => {
    return {
        id,
        contentHash: '0x5e2c171239a61d954876b6aae78b006273e346082ac08b1dc6c94bda9fb19082',
        creatorId: 1289632,
        creatorAddress: '0xf65694e5a77799716d3c43c8620522d8e3983ee8',
        serialId: 0,
        address: crypto.randomBytes(20).toString('hex'),
        symbol: `NFT-${id}`
    }
}
let __TESTS__COUNT_NFT_ID = 1000000;
export const getRandomNFTs = (num: number): NFT[] => {
    return Array(num).fill(0).map((_, index) => getRandomNFT(++__TESTS__COUNT_NFT_ID))
}

