import {useDisconnect, useNetwork} from "wagmi";
import useWindowFocus from "./useWindowFocus";
import {useEffect, useState} from "react";
import {errorToast} from "../components/Toast/Toast";
import {vars} from "../environment/vars";
import AppStore from "../store/App.store";

const useNetworkWatcher = () => {
    // forces user to be connected the correct network

    const {switchNetwork, activeChain} = useNetwork()
    const {disconnect} = useDisconnect()
    const {isWindowFocused} = useWindowFocus()
    const [isTargetChainConnected, setIsTargetChainConnected] = useState(false)

    useEffect(() => {
        const syncChainToTarget = async () => {
            if (switchNetwork) {
                try {
                    // If provider is metamask, switching networks will cause wallet to disconnect
                    // https://github.com/tmm/wagmi/issues/180#issuecomment-1077705039
                    // https://github.com/MetaMask/metamask-extension/issues/13375

                    await switchNetwork(vars.TARGET_CHAIN_ID)
                    setIsTargetChainConnected(true)
                    // if (error) {
                    //     console.log("debug:: changeNetwork hit", error)
                    //     throw new Error("Error connecting to correct network")
                    // }
                } catch (e) {
                    errorToast("Please reconnect on correct chain")
                    disconnect()
                    AppStore.auth.logout()
                    setIsTargetChainConnected(false)
                }
            } else {
                errorToast("Please reconnect on correct chain")
                disconnect()
                AppStore.auth.logout()
                setIsTargetChainConnected(false)
            }
        }

        if (activeChain?.id) {
            console.log("connected chain:", activeChain.id)
            if (activeChain.id !== vars.TARGET_CHAIN_ID && isWindowFocused) {
                syncChainToTarget()
            } else {
                setIsTargetChainConnected(true)
            }
        } else {
            setIsTargetChainConnected(false)
        }
    }, [activeChain?.id, isWindowFocused, disconnect, switchNetwork])
    return {
        isTargetChainConnected
    }
}

export default useNetworkWatcher
