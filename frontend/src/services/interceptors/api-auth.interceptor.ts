import {AxiosRequestConfig} from "axios";
import AppStore from "../../store/App.store";
import {FILE_UPLOAD_KEY} from "../../constants";

const ApiAuthInterceptor = async (config: AxiosRequestConfig) => {
  const { method, data, params } = config

  if (!AppStore.auth.wallet) {
    throw new Error("No wallet found to auth")
  }

  let payload: {[key: string]: string} = {}
  if (method === "get" && params) {
    payload = params;
  } else if (method === "post" || method === "delete") {
    payload = data;
  }

  if (data instanceof FormData) {
    payload = {}
    for (var pair of data) {
      const key = pair[0]
      const val = pair[1]
      if (val instanceof File) {
        // TODO: require only single file to be attached
        // TODO: order with file key in payload here is possible issue
        if (key !== FILE_UPLOAD_KEY) {
          throw new Error("File must be attached with 'file' key")
        }
        payload[FILE_UPLOAD_KEY] = val.name
      } else {
        payload[key] = val
      }
    }
  }
  const timestamp = new Date().toISOString()
  let message = JSON.stringify(payload) + "_" + timestamp
  if (config.signerHumanMessage) {
    const humanMessage = config.signerHumanMessage
    message = `${humanMessage}\n\n` + message
    config.headers!["X-Human-Signer-Message"] = humanMessage
  }
  const signature = await AppStore.auth.wallet.ethSigner.signMessage(message)
  const address = AppStore.auth.wallet.address()
  config.headers!["X-Timestamp"] = timestamp
  config.headers!["X-Signature"] = signature
  config.headers!["X-Address"] = address
  return config
}

export default ApiAuthInterceptor
