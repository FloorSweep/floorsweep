import {ethers} from "ethers";

export const abbreviate = (input: string, spaces: number = 4) => {
  return `${input.substring(0,spaces)}...${input.substring(input.length-spaces, input.length)}`
}

export const jsonify = (value: any) => JSON.stringify(value)

export const isValidEthereumAddress = (address: string) => {
  try {
    ethers.utils.getAddress(address)
    return true
  } catch {
    return false
  }
}

export const isValidHttpUrl = (value: string) => {
    let url;
    try {
        url = new URL(value);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

export const capitalizeFirstLetter = (content: string) => {
  return content.charAt(0).toUpperCase() + content.slice(1);
}
