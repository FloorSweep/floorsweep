import React from "react";
import {css} from "../../helpers/css";
import Button, {ButtonSize} from "../Button/Button";
import Modal from "./Modal";
import {useConnect} from "wagmi";
import AppStore from "../../store/App.store";
import {observer} from "mobx-react";
import Link, {LinkVariant} from "../Link/Link";
import {ConnectorIds, connectorImageSrcMap, connectorToButtonMap} from "../../services/wagmi";

interface ConnectWalletModalProps {}

const ConnectWalletModal = observer((props: ConnectWalletModalProps) => {
  const {
    connectors,
    connectAsync
  } = useConnect()

  return <Modal
    isOpen={AppStore.modals.isConnectWalletModalVisible}
    onChange={(isOpen) => AppStore.modals.isConnectWalletModalVisible = isOpen}
    title={"Connect a Wallet"}
  >
    <div className={css("flex", "flex-col")}>
      {connectors.filter(connector => connector.ready).map((connector, index) => {
        return <div className={css({"mt-6": index !== 0})} key={connector.id}>
          <Button
            block
            variant={connectorToButtonMap[connector.id as ConnectorIds]}
            size={ButtonSize.lg}
            onClick={() => {
              connectAsync(connector).then(() => AppStore.modals.isConnectWalletModalVisible = false)
            }}>
            <div className={css("flex", "items-center", "flex-col", "sm:flex-row", "sm:space-x-5", "space-y-5", "sm:space-y-0")}>
              <img alt={connector.name} src={connectorImageSrcMap[connector.id as ConnectorIds]} width={50} height={50}/>
              <div className={css("text-xl", "font-mono", "mt-2")}>
                {connector.name}
              </div>
            </div>
          </Button>
        </div>
      })}
      <div className={css("mt-6", "text-lg", "text-neutral-400")}>
        <div className={css("text-center")}>
          New to Ethereum?
        </div>
        <div className={css("text-center", "mt-2")}>
          <Link
            variant={LinkVariant.Grey}
            isExternal
            href={"https://ethereum.org/en/wallets/find-wallet/"}
          >
            Get a wallet
          </Link>
        </div>
      </div>
    </div>
  </Modal>
})

export default ConnectWalletModal