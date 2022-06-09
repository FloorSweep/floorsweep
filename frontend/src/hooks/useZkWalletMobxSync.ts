import {useAccount, useDisconnect, useNetwork, useSigner} from "wagmi";
import {useEffect} from "react";
import {Signer} from "ethers";
import {vars} from "../environment/vars";
import AppStore from "../store/App.store";
import {debugToast, errorToast} from "../components/Toast/Toast";

const useZkWalletMobxSync = () => {
    const {data: signer} = useSigner()
    const {activeChain} = useNetwork()
    const {data: accountData} = useAccount()
    const {disconnect} = useDisconnect()
    useEffect(() => {
        const getZkWallet = async (_signer: Signer) => {
            try {
                await AppStore.auth.connect(_signer)
            } catch (e) {
                errorToast("Could not connect to your account")
                console.error("Could not connect user:", e)
                disconnect()
                AppStore.auth.logout()
            }
        }

        const runSync = async () => {
            try {
                if (signer && activeChain?.id === vars.TARGET_CHAIN_ID) {
                    const zkAddress = AppStore.auth.wallet?.address()
                    const accountAddress = accountData?.address
                    if (zkAddress !== accountAddress && !AppStore.auth.isWalletConnecting) {
                        await getZkWallet(signer)
                    }
                }
            } catch (e) {
                console.log("????")
            }
        }

        runSync()

    }, [signer, accountData?.address, activeChain?.id, disconnect])
    return  {
        isZkWalletConnected: AppStore.auth.isWalletConnected
    }
}

export default useZkWalletMobxSync
