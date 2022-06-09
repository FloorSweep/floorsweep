import {chain, createClient, defaultChains} from "wagmi";
import {InjectedConnector} from 'wagmi/connectors/injected'
import {WalletConnectConnector} from 'wagmi/connectors/walletConnect'
import {CoinbaseWalletConnector} from 'wagmi/connectors/coinbaseWallet'
import MetamaskLogo from "../images/metamask.svg"
import WalletConnectLogo from "../images/walletconnect.svg"
import CoinbaseLogo from "../images/coinbasewallet.png"
import {vars} from "../environment/vars";
import {ButtonVariant} from "../components/Button/Button";
import env from "../environment";
import {providers} from "ethers";

const infuraId = vars.INFURA_ID
const chains = [chain.mainnet, chain.rinkeby]

const connectors = ({ chainId }: {chainId?: number}) => {
  const rpcUrl = chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ?? chain.mainnet.rpcUrls[0]
  return [
    new InjectedConnector({chains, options: { shimDisconnect: true }}),
    new WalletConnectConnector({chains, options: {infuraId, qrcode: true}}),
    new CoinbaseWalletConnector({chains, options: {appName: env.app.name, jsonRpcUrl: `${rpcUrl}/${infuraId}`}})
  ]
}

export enum ConnectorIds {
  Injected = "injected",
  WalletConnect = "walletConnect",
  CoinbaseWallet = "coinbaseWallet"
}

export const connectorToButtonMap = {
  [ConnectorIds.Injected]: ButtonVariant.Metamask,
  [ConnectorIds.WalletConnect]: ButtonVariant.WalletConnect,
  [ConnectorIds.CoinbaseWallet]: ButtonVariant.Coinbase
}

export const connectorImageSrcMap: {[key in ConnectorIds]: string} = {
  [ConnectorIds.Injected]: MetamaskLogo,
  [ConnectorIds.WalletConnect]: WalletConnectLogo,
  [ConnectorIds.CoinbaseWallet]: CoinbaseLogo
}


const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider(config) {
    return new providers.InfuraProvider(config.chainId, infuraId)
  }
})

export default wagmiClient
