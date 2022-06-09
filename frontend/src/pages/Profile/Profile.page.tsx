import React, {useEffect, useMemo} from "react"
import {observer} from "mobx-react";
import {useNavigate, useParams} from "react-router-dom";
import ProfileStore, {Tabs} from "./Profile.store";
import {useEnsAvatar, useEnsName} from "wagmi";
import {objectKeys} from "../../helpers/arrays";
import {css} from "../../helpers/css";
import NFTPreview from "../../components/NFTPreview/NFTPreview";
import {abbreviate, capitalizeFirstLetter} from "../../helpers/strings";
import AsyncListWrap from "../../components/AsyncListWrap/AsyncListWrap";
import Link, {LinkVariant} from "../../components/Link/Link";
import {vars} from "../../environment/vars";
import Icon from "../../components/Icon/Icon";
import Marquee from "../../components/Marquee/Marquee";
import PaginableNfts from "../../components/PaginableNfts/PaginableNfts";
import {AspectBox} from "../../components/AspectBox/AspectBox";
import styles from "./Profile.module.css";
import useScrollToTop from "../../hooks/useScrollToTop";

interface ProfilePageProps {
}


const ProfilePage = observer((props: ProfilePageProps) => {
    useScrollToTop()
    const {
        addressOrDisplayName,
        collectionOrCreation
    } = useParams<{ addressOrDisplayName: string, collectionOrCreation: Tabs }>()
    const navigate = useNavigate()
    const store = useMemo(() => new ProfileStore(addressOrDisplayName as string, collectionOrCreation), [addressOrDisplayName])
    useEffect(() => {
        store.init()
        return () => {
            store.destroy()
        }
        // eslint-disable-next-line
    }, [addressOrDisplayName])

    return <>
        {store.isAccountValid && <>
          <div className={css("flex", "justify-center", "my-24")}>
            <div className={css("flex", "flex-col", "items-center")}>
              <ProfileDetails store={store}/>
            </div>
          </div>
            <div className={css("flex", "flex-col")}>
              <div className={css("flex", "justify-center", "mt-16", "border-b-2", "border-neutral-900")}>
                  {objectKeys(Tabs).map((key, index) => <div
                      key={key}
                      className={css("cursor-pointer", "text-lg", "border-white", {
                          "border-b-2": store.selectedTab === Tabs[key],
                          "text-neutral-400": Tabs[key] !== store.selectedTab,
                          "mr-5": index === 0,
                          "ml-5": index !== 0
                      })}
                      style={{marginBottom: -2}}
                      onClick={() => {
                          store.selectedTab = Tabs[key]
                          store.fresh()
                          navigate(`/profile/${store.addressOrDisplayName}/${Tabs[key]}`)
                      }}
                  >
                      {capitalizeFirstLetter(Tabs[key])}
                  </div>)}
              </div>
            </div>
          <div className={css("mt-12", "flex-grow", "grid")}>
            <PaginableNfts
              isLoading={store.isLoading}
              next={() => store.next()}
              dataLength={store.dataLength}
              hasMore={store.hasMore}
              nfts={store.data}
            />
          </div>
        </>}
        {!store.isAccountValid &&
        <div className={css("flex-grow", "flex", "justify-center", "items-center", "text-neutral-400")}>
          account not found
        </div>}
    </>
})

const ProfileDetails = observer(({store}: { store: ProfileStore }) => {
    const {data: ens} = useEnsName({address: store.account?.address})
    const {data: avatar} = useEnsAvatar({addressOrName: store.account?.address})
    return <>
        <div
            className={css("overflow-hidden", "rounded-full", "relative", "mt-5", "border-2", "border-white", "w-full", "h-full")}
            style={{maxWidth: 100}}>
            <AspectBox width={100} height={100}>
                {avatar ? <img src={avatar} height={"35px"} alt={"profile"}/>
                    : <div
                        className={css("bg-black", "w-full", "h-full", "flex", "items-center", "justify-center")}/>}
            </AspectBox>

        </div>
        <div className={css("text-center", "mt-6", "text-3xl", "font-bold")}>
            {store.displayName}
        </div>
        {store.isAccountSyncing && <div
          className={css("text-base", "text-neutral-600", "px-3", "py-1", "mt-5", styles["rotating-border"])}>
          syncing
        </div>}
        <div className={css("text-center", "mt-4", "text-neutral-400", "text-base")}>
            <div className={css("flex", "justify-center")}>
                <div className={css("flex", "items-center")}>
                    {ens && <>
                      <div className={css("mr-3")}>{ens}</div>
                      <div className={css("mr-3")}>|</div>
                    </>}
                    <div className={css("flex", "items-center")}>
                        <Icon icon={'ethereum'} className={css("mr-1")}/>
                        {store.account?.address && <Link isExternal isExternalIconVisible variant={LinkVariant.Grey}
                                                         title={"Open on zksync.io"}
                                                         href={`${vars.BASE_ZK_EXPLORER_URL}/accounts/${store.account?.address}`}>
                            {abbreviate(store.account?.address)}
                        </Link>}
                    </div>
                </div>
            </div>
            {store.account?.websiteUrl && <div className={css("my-3")}>
              <Link isExternal isExternalIconVisible={false} href={store.account!.websiteUrl}>
                <Icon icon={"globe"}/>
              </Link>
            </div>}
            {store.account?.description &&
            <div className={css("max-w-lg", "my-3")} style={{overflowWrap: "anywhere"}}>
                {store.account.description}
            </div>}
        </div>
    </>
})

export default ProfilePage
