export const CURRENT_ACCOUNT_CONTEXT_KEY = "CURRENT_ACCOUNT"
export const CURRENT_SIGNING_ADDRESS_CONTEXT_KEY = "CURRENT_ADDRESS"


export const requiredAuthHeaderKeys = {
  timestamp: "X-Timestamp",
  signature: "X-Signature",
  address: "X-Address",
}

export const optionalAuthHeaderKeys = {
  humanMessage: "X-Human-Signer-Message"
}

export type AuthHeaders = {
  [key in keyof (typeof requiredAuthHeaderKeys & typeof optionalAuthHeaderKeys)]: string
}