import React, {PropsWithChildren, useCallback, useState} from "react";
import {css} from "../helpers/css";
import Button, {ConnectWalletButton} from "../components/Button/Button";
import {observer} from "mobx-react";
import {isDev, isProduction} from "../environment/helpers";
import AppStore from "../store/App.store";
import ConnectWalletModal from "../components/Modal/ConnectWalletModal";
import InitializeAccountModal from "../components/Modal/InitializeAccountModal";
import ProfileDropdown from "../components/ProfileDropdown/ProfileDropdown";
import Link from "../components/Link/Link";
import {useNavigate} from "react-router-dom";
import {isMainnet, vars} from "../environment/vars";
import Marquee from "../components/Marquee/Marquee";
import SettingsModal from "../components/Modal/SettingsModal";
import env from "../environment";
import HomeSearch from "../pages/Home/HomeSearch";

export let HEADER_HEIGHT = 108
if (isMainnet() && isProduction()) {
    HEADER_HEIGHT = 81.5
}

const HEADER_PADDING = 25
const Layout: React.FC<PropsWithChildren<{}>> = observer(({children}) => {
    return <div className={css("px-5", "pb-16", "bg-black", "flex-grow", "flex", "flex-col", "font-mono")}>
        <main className={css("h-full", "flex", "flex-col", "text-white", "text-lg", "flex-grow")}>
            <div style={{
                height: HEADER_HEIGHT,
                paddingTop: HEADER_PADDING,
                paddingBottom: HEADER_PADDING,
            }} className={css("fixed", "bg-black", "z-10", "border-b-2", "border-neutral-900", "px-5", "top-0", "left-0", "w-full")}>
                <Header/>
            </div>
            <div className={css("flex-grow", "self-center", "w-full", "flex", "flex-col")} style={{paddingTop: HEADER_HEIGHT}}>
                {children}
            </div>
        </main>
        {AppStore.modals.isConnectWalletModalVisible && <ConnectWalletModal/>}
        {AppStore.modals.isInitializeAccountModalVisible && <InitializeAccountModal/>}
        {AppStore.modals.isSettingsModalVisible && <SettingsModal/>}
    </div>
})

const Header = observer(() => {
    const navigate = useNavigate();
    return <div>
        <EnvironmentBanner/>
        <div className={css("grid", "grid-cols-3")}>
            <div>
                <Link href={"/"}>{env.app.name}</Link>
                {isDev() && <span className={css("ml-4")}>
                    <Link href={"/dsl"}>dsl</Link>
                </span>}
            </div>
            <div className={css()}>
                <HomeSearch/>
            </div>
            <div className={css("flex", "justify-end")}>
                <div className={css("mr-4")}>
                    {AppStore.auth.isAuthed && <Button onClick={() => {
                        navigate("/mint", {replace: true})
                    }}>+</Button>}
                </div>
                {!AppStore.auth.isAuthed && <ConnectWalletButton/>}
                {AppStore.auth.isAuthed && <ProfileDropdown/>}
            </div>
        </div>
    </div>
})


const EnvironmentBanner = () => {
    if (isMainnet() && isProduction()) {
        return <></>;
    }
    const envs: string[] = [];
    /**
     * Indicator of active chain
     */
    if (!isMainnet()) {
        envs.push(vars.TARGET_NETWORK_NAME + `(${vars.TARGET_CHAIN_ID})`);
    }
    /**
     * Indicator of >production< url versus staging/local - not to confuse both deployments
     */
    if (!isProduction()) {
        envs.push("DEBUG MODE");
    }
    return <div>
        <Marquee>
            {new Array(10).fill(undefined).map((item, index) => <div
                className={css("flex", "ml-7", "text-neutral-400", "flex-shrink-0")}
                key={`dev-banner-${index}`}>{"/////"} {envs.join(' ~ ')} {"/////"}</div>)}
        </Marquee>
    </div>
}

export default Layout
