import {Network} from "zksync/build/types";
import {objectKeys} from "../helpers/arrays";
import AppStore from "../store/App.store";
import env from "./index";

interface Vars {
  TARGET_CHAIN_ID: number;
  TARGET_NETWORK_NAME: Network;
  INFURA_ID: string;
  BASE_ZK_EXPLORER_URL: string;
}

const vars: Vars = {
  TARGET_CHAIN_ID: Number(env.network.id),
  TARGET_NETWORK_NAME: env.network.name as Network,
  INFURA_ID: env.network.infuraId,
  BASE_ZK_EXPLORER_URL: env.network.explorerUrl
}
const isMainnet = () => {
  return env.network.name === "mainnet";
};
const isTestnet = () => {
  return !isMainnet()
};


const assertVars = () => {
  objectKeys(vars).forEach(key => {
    if (vars[key] === undefined) {
      AppStore.isCriticalErrorHit = true
      const message = `ENV VAR MISSING: ${key}`
      AppStore.criticalErrorMessage.push({message})
      console.error(message)
    }
  })
}

export {vars, assertVars, isMainnet, isTestnet};
