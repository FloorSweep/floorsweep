import {useAccount, useDisconnect, useNetwork} from "wagmi";
import React from "react";
import Button, {ButtonSize, ButtonVariant} from "../Button/Button";
import {css} from "../../helpers/css";
import {debugToast} from "../Toast/Toast";
import Dropdown from "../Dropdown/Dropdown";
import AppStore from "../../store/App.store";
import useDisplayName from "../../hooks/useDisplayName";
import Link, {LinkSize, LinkVariant} from "../Link/Link"
import {observer} from "mobx-react";

const ProfileDropdown = observer(() => {
    const {data} = useAccount()
    const {disconnect} = useDisconnect()
    const {displayName} = useDisplayName(data?.address)
    const {activeChain} = useNetwork()
    return <>
        <Dropdown trigger={<Button>{displayName}</Button>}>
          <Dropdown.Item>
            <Link href={`/profile/${data?.address}`} variant={LinkVariant.Secondary} size={LinkSize.lg}>
              profile
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Button
              size={ButtonSize.xs}
              variant={ButtonVariant.Text}
              onClick={() => AppStore.modals.isSettingsModalVisible = true}
            >
              <span className={css("text-xl", "text-mono")}>
                settings
              </span>
            </Button>
          </Dropdown.Item>
          <Dropdown.Item>
            <div className={css("mt-2", "flex", "justify-end")}>
              <Button
                size={ButtonSize.xs}
                variant={ButtonVariant.Text}
                onClick={() => {
                    disconnect()
                    AppStore.auth.logout()
                    debugToast("Disconnected")
                }}>
                disconnect
              </Button>
            </div>
          </Dropdown.Item>
          <Dropdown.Item>
            <div className={css("text-neutral-400", "text-sm", "text-right", "font-mono")}>
              network: {activeChain?.name}
            </div>
          </Dropdown.Item>
        </Dropdown>
    </>
})

export default ProfileDropdown
