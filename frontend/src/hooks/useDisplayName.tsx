import {abbreviate, isValidEthereumAddress} from "../helpers/strings";
import {useEnsName} from "wagmi";
import {useMemo} from "react";
import AppStore from "../store/App.store";

// NOTE: for this hook to properly respond to observables
// it *MUST* be used in an observed component
const useDisplayName = (address?: string | null) => {
  return useMemo(() => {
    let displayName = "..."
    if (address) {
      const account = AppStore.getAccountByAddressFromCache(address)
      if (account && account.displayName) {
        displayName = account.displayName
      } else if (isValidEthereumAddress(address)) {
        displayName = abbreviate(address)
      }
    }

    return {
      displayName,
      address,
    }
  }, [address, AppStore.accounts])
}

export default useDisplayName
