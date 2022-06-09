import {observer} from "mobx-react";
import {useLocation, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import NFTStore from "./NFT.store";
import {css} from "../../helpers/css";
import Pane, {PaneSize} from "../../components/Pane/Pane";
import Form, {FormVariant} from "../../components/Form/Form";
import SelectInput from "../../components/Form/SelectInput";
import {required} from "../../components/Form/validation";
import AppStore from "../../store/App.store";
import {ButtonVariant, ConnectWalletButton, Submit} from "../../components/Button/Button";
import Link, {LinkSize} from "../../components/Link/Link";
import useDisplayName from "../../hooks/useDisplayName";
import NumberInput from "../../components/Form/NumberInput";
import AsyncListWrap from "../../components/AsyncListWrap/AsyncListWrap";
import {AspectBox} from "../../components/AspectBox/AspectBox";
import HistoryItem from "./History/HistoryItem"
import AsyncWrap from "../../components/AsyncWrap/AsyncWrap";
import {NFT} from "../../interfaces";
import {HEADER_HEIGHT} from "../../layouts/Layout";
import useScrollToTop from "../../hooks/useScrollToTop";
import DevNFTStatus from "../../components/NFTPreview/DevNFTStatus";

interface NFTPageProps {
}

const TITLE_HEIGHT = 42
const TITLE_MARGIN_TOP = 35

const NFTPage = observer((props: NFTPageProps) => {
    useScrollToTop()

    let {tokenID} = useParams();
    const location = useLocation() as { state?: { nft?: string } };
    const store = useMemo(() => new NFTStore(tokenID + ""), [tokenID])

    useEffect(() => {
        store.init()
        // eslint-disable-next-line
    }, [tokenID])

    let loaderWidth = 300,
        loaderHeight = 300;
    let nft: NFT | undefined = store.nft;
    if (location.state?.nft) {
        const stateNFT: NFT = JSON.parse(location.state.nft);
        loaderWidth = stateNFT.imgWidth ?? 300;
        loaderHeight = stateNFT.imgHeight ?? 300;
        if (!nft) {
            nft = stateNFT;
        }
    } else {

    }

    const {displayName: ownerName} = useDisplayName(nft?.ownerAddress)
    const {displayName: creatorName} = useDisplayName(nft?.creatorAddress)

    const [windowHeight, setWindowHeight] = useState<null | number>(null)
    useEffect(() => {
        const _setWindowHeight = () => {
            setWindowHeight(window.innerHeight)
        }
        _setWindowHeight()
        window.addEventListener('resize', _setWindowHeight)
        return () => {
            return window.removeEventListener('resize', _setWindowHeight)
        }
    }, [])

    const previewPaddingY = 112

    const [viewerHeight, setViewerHeight] = useState(0)
    const renderPreview = useCallback((content: any) => {
        let height: string | number = "inherit"
        const safetyOffset = 20
        let winHeight = windowHeight ? windowHeight : window.innerHeight
        if (winHeight) {
            height = winHeight - (HEADER_HEIGHT + TITLE_HEIGHT + TITLE_MARGIN_TOP + safetyOffset)
            if (height !== viewerHeight) {
                setViewerHeight(height)
            }
        }
        return <div className={css("w-100", "flex", "justify-center", "items-center", "flex-grow")} style={{height, paddingTop: previewPaddingY / 2, paddingBottom: previewPaddingY / 2}}>
            {content}
        </div>
    }, [windowHeight, viewerHeight])

    const renderLoader = useCallback(() => {
        return <>
            {renderPreview(<>
                <div
                    className={css("flex", "justify-center", "items-center", "w-full", "h-full", "relative", "animate-pulse")}>
                    <div className={css("w-full")} style={{maxWidth: (loaderWidth / loaderHeight) * viewerHeight - previewPaddingY}}>
                        <AspectBox width={loaderWidth} height={loaderHeight} className={css("bg-neutral-900")}/>
                    </div>
                </div>
            </>)}
        </>
    }, [loaderHeight, loaderWidth, viewerHeight, renderPreview])

    const notFoundStyle = css("text-neutral-600")

    return <div className={css("flex", "justify-center", "relative")}>
        <div className={css("max-w-7xl", "w-full")}>
            <AsyncWrap
                isLoading={store.isLoading}
                hasData={!!nft}
                renderLoading={renderLoader}
                noDataMessage={"NFT Not Found"}
            >
                {nft && <div className={css("min-w-0")}>
                  <div>
                      {renderPreview(<div style={{backgroundImage: `url(${nft.imageUrl})`}} className={css("w-full", "h-full", "bg-contain", "bg-no-repeat", "bg-center")}/>)}
                    <div className={css("flex", "justify-between", "items-center", "space-x-12")}
                         style={{height: TITLE_HEIGHT, marginTop: TITLE_MARGIN_TOP}}>
                      <div
                        className={css("text-3xl", "whitespace-nowrap", "overflow-hidden", "overflow-ellipsis", "font-bold")}
                        title={store.metadata?.name}>
                          {store.metadata?.name}
                      </div>
                        {nft?.ownerAddress && <div>
                          <Link href={`/profile/${nft?.ownerAddress}`} title={ownerName}>{ownerName}</Link>
                          <div className={css("text-right", "text-sm", "text-neutral-400")}>owner</div>
                        </div>}
                    </div>
                    <DevNFTStatus nft={nft}/>
                    <div className={css("mt-16", "grid", "grid-cols-1", "md:grid-cols-6", "gap-5")}>
                      <div className={css("md:col-span-2", "gap-5", "flex", "flex-col")}>
                          {store.isNFTForSale && <>
                              {!store.isAuthedUserOwner && <Pane title={"Buy Now"}>
                                <div className={css("flex", "items-end")}>
                                  <div
                                    className={css("text-3xl", "font-bold")}>{store.orderPriceHumanReadable}</div>
                                  <div
                                    className={css("text-3xl", "ml-4", "font-bold")}>{store.orderBidTokenSymbol}</div>
                                </div>
                                <Form onSubmit={() => store.onBuySubmit()}>
                                  <div className={css("mt-5")}>
                                      {AppStore.auth.isAuthed &&
                                      <Submit className={css("font-bold")}
                                              label={store.userHasSufficientFundsToPurchase ? "BUY" : "INSUFFICIENT FUNDS"}
                                              variant={ButtonVariant.Success}
                                              disabled={!store.userHasSufficientFundsToPurchase}
                                              block/>}
                                      {!AppStore.auth.isAuthed &&
                                      <ConnectWalletButton label={"Connect wallet"} block/>}
                                  </div>
                                </Form>
                              </Pane>}
                              {store.isAuthedUserOwner && <Pane title={"Listed"}>
                                <div className={css("flex", "items-end")}>
                                  <div
                                    className={css("text-3xl", "font-bold")}>{store.orderPriceHumanReadable}</div>
                                  <div
                                    className={css("text-3xl", "ml-4", "font-bold")}>{store.orderBidTokenSymbol}</div>
                                </div>
                                <Form onSubmit={() => store.onDelistSubmit()}>
                                  <Submit
                                    block
                                    variant={ButtonVariant.Error}
                                    className={css("mt-6", "font-bold")}
                                    label={"DELIST"}
                                  />
                                </Form>
                              </Pane>}
                          </>}

                          {!store.isNFTForSale && <>
                              {store.isNftListable && <>
                                  {AppStore.auth.hasOrders &&
                                  <Pane title={"List"} className={css("h-full")}>
                                    <div className={css("text-neutral-400", "text-md")}>
                                      Due to zkSync v1 limitations, you may only have a single NFT listed
                                      at a time.
                                      To list this token you must first delist <Link
                                      href={`/nft/${AppStore.auth.orders[0].tokenId}`}>
                                        {AppStore.auth.orders[0].tokenId}
                                    </Link>.
                                    </div>
                                  </Pane>}
                                  {!AppStore.auth.hasOrders && <Pane title={"List"} className={css("h-full")}>
                                    <Form variant={FormVariant.Light} onSubmit={() => store.onListSubmit()}>
                                      <div className={css("grid", "grid-cols-2")}>
                                        <div className={css("mr-4")}>
                                          <SelectInput
                                            block
                                            label={"Currency"}
                                            name={"currency"}
                                            value={store.listCurrency}
                                            onChange={(val) => store.listCurrency = val}
                                            items={store.currencySelectItems}
                                            defaultValue={store.listCurrency}
                                          />
                                        </div>
                                        <div className={css("ml-4")}>
                                          <NumberInput
                                            block
                                            label={"Amount"}
                                            name={"amount"}
                                            value={store.listAmount}
                                            onChange={(amount) => store.listAmount = amount}
                                            placeholder={"Price"}
                                            validate={required}
                                          />
                                        </div>
                                      </div>
                                      <div className={css("mt-6")}>
                                          {AppStore.auth.isAuthed &&
                                          <Submit label={"LIST"} variant={ButtonVariant.Success} block/>}
                                          {!AppStore.auth.isAuthed &&
                                          <ConnectWalletButton label={"Connect wallet"} block/>}
                                      </div>
                                    </Form>
                                  </Pane>}
                              </>}
                              {store.isAuthedUserOwner && store.nft?.status === "swapping" && <Pane title={"List"}>
                                <div>Your previous swap is still pending on zkSync. Once it confirms you will be able to
                                  list
                                </div>
                              </Pane>}
                          </>}

                        <Pane title={"Properties"} className={css("h-full")}>
                            {store.isAttributesValid && <div className={css("grid", "lg:grid-cols-2", "gap-5")}>
                                {store.isAttributesValid && store.attributes!.map((item, index) =>
                                    <Pane size={PaneSize.sm}
                                          key={`metadata-${index}`}
                                          className={css("p-2", "overflow-auto", "border-2", "border-neutral-800")}>
                                        <div
                                            className={css("text-sm", "text-neutral-400", "break-words", "text-center")}>
                                            {item.trait_type}
                                        </div>
                                        <div
                                            className={css("break-words", "text-white", "text-center")}>{item.value}</div>
                                    </Pane>)}
                            </div>}

                            {!store.isAttributesValid && <div
                              className={css("col-span-2", "my-5", "flex-grow", "flex", "items-center", "justify-center", notFoundStyle)}>
                              None found
                            </div>}
                        </Pane>
                      </div>
                      <div className={css("md:col-span-4")}>
                        <Pane title={"Info"} className={css("h-full")}>
                            {nft.metadata.description === "" || !nft.metadata?.description
                                ? <div
                                    className={css("text-neutral-400", "flex", "justify-center", "items-center", "h-full", notFoundStyle)}>
                                    No description found
                                </div>
                                : <div className={css("text-white", "whitespace-pre-line", "break-words")}>
                                    {nft!.metadata.description}
                                </div>
                            }
                        </Pane>
                      </div>
                      <div className={css("md:col-span-2")}>
                        <Pane title={"Details"} className={css("h-full")}>
                          <div className={css("flex", "justify-between", "mb-3")}>
                            <div className={css("text-white")}>Token ID</div>
                            <div>{nft.tokenId}</div>
                          </div>
                          <div className={css("flex", "justify-between", "mb-3")}>
                            <div className={css("text-white")}>Metadata</div>
                            <div>
                              <Link
                                isExternal
                                href={nft!.metadataUrl}
                                size={LinkSize.lg}
                              />
                            </div>
                          </div>
                          <div className={css("flex", "justify-between", "mb-3")}>
                            <div className={css("text-white")}>Creator</div>
                            <Link href={`/profile/${nft?.creatorAddress}`}>
                                {creatorName}
                            </Link>
                          </div>
                          <div className={css("flex", "justify-between")}>
                            <div className={css("text-white")}>Status</div>
                            <div>{nft?.status}</div>
                          </div>
                        </Pane>
                      </div>
                      <div className={css("md:col-span-4")}>
                        <Pane title={"History"} className={css("h-full")}>
                          <AsyncListWrap
                            isLoading={store.history.isLoading}
                            hasData={store.history.hasData}
                            quantity={2}
                            renderRow={() => <div className={css("bg-neutral-900", "rounded-sm")} style={{height: 45}}/>}
                            noDataMessage={"No history found"}
                          >
                              {store.history.items.map((item, index) => <HistoryItem
                                  key={`history-item-${index}`}
                                  item={item}/>)}
                          </AsyncListWrap>
                        </Pane>
                      </div>
                    </div>
                  </div>
                </div>}
            </AsyncWrap>
        </div>
    </div>
})


export default NFTPage

