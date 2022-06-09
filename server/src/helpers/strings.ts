import {ethers} from "ethers";

export const isValidEthereumAddress = (address: string) => {
  try {
    ethers.utils.getAddress(address)
    return true
  } catch {
    return false
  }
}

export const isAddressesEqual = (addr1: string, addr2: string) => {
  return ethers.utils.getAddress(addr1) === ethers.utils.getAddress(addr2)
}
