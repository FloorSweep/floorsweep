import {ethers} from "ethers";
import {isValidEthereumAddress} from "./strings";

describe('String helpers', () => {
  it("Should pass as valid ethereum address", async () => {
    const wallet = ethers.Wallet.createRandom()
    expect(isValidEthereumAddress(wallet.address)).toBe(true)
  })

  it("Should not pass as valid ethereum address", async () => {
    expect(isValidEthereumAddress("0xaklsdjfiuuerr")).toBe(false)
    const wallet = ethers.Wallet.createRandom()
    const address = wallet.address
    const notAnAddress = address.slice(0, address.length - 1)
    expect(isValidEthereumAddress(notAnAddress)).toBe(false)
  })
})