import {observer} from "mobx-react";
import MintStore from "../../pages/Mint/Mint.store";
import {css} from "../../helpers/css";
import MediaInput from "./MediaInput";
import Button, {ButtonVariant, Submit} from "../Button/Button";
import {errorToast} from "../Toast/Toast";
import Spinner, {SpinnerSize} from "../Spinner/Spinner";
import {objectKeys} from "../../helpers/arrays";
import Form from "../Form/Form";

const MintSubmit = observer(({store}: { store: MintStore }) => {
    return <div className={css("grid", "md:grid-cols-2", "gap-16")}>
        <div className={css("flex", "justify-center")}>
            <div style={{maxWidth: "400px"}}>
                <MediaInput store={store}/>
                <div className={css("mt-2")}>
                    <div className={css("break-words", "text-white")}>{store.title}</div>
                    <div className={css("text-sm", "text-neutral-400", "whitespace-pre-line", "break-words")}>
                        {store.description}
                    </div>
                    {store.attributeControlCount > 0 && <div className={css("mt-3")} style={{width: "400px"}}>
                      <div className={css("grid", "grid-cols-2", "gap-3")}>
                          {store.attributes.map(attribute => <div
                              className={css("bg-neutral-900", "p-2", "break-words")}>
                              <div
                                  className={css("text-sm", "text-neutral-400")}>
                                  {attribute.trait_type}
                              </div>
                              <div className={css("text-white")}>{attribute.value}</div>
                          </div>)}
                      </div>
                    </div>}
                </div>
            </div>
        </div>
        <div>
            <div
                className={css({"hidden": store.isLoading}, "flex", "flex-col", "justify-around", "h-full", "relative", "text-white")}>
                <div>
                    <div>You are about to release "{store.title}" to the world.</div>
                    <div className={css("mt-5")}>Double check the details below as you will not be able to alter them
                        after minting.
                    </div>
                </div>
                <Form onSubmit={() => store.mintNft()}>
                    <div className={css("flex", "justify-around")}>
                        <Button disabled={store.isLoading} onClick={() => store.goBack()}
                                variant={ButtonVariant.Black}>back</Button>
                        <Submit label={"mint"} disabled={store.isLoading}/>
                    </div>
                </Form>
            </div>

            {store.isLoading && <div className={css("flex", "flex-col", "items-center", "justify-center", "h-full")}>
              <div><Spinner size={SpinnerSize.lg}/></div>
              <div className={css("mt-4")}>
                <div className={css({
                    "block": store.isMetadataUploadLoading,
                    "hidden": !store.isMetadataUploadLoading
                })}>
                  sign tx to upload metadata
                </div>
                <div
                  className={css({"block": store.isNftUploadLoading, "hidden": !store.isNftUploadLoading})}>
                  sign txs (2) to mint nft
                </div>
              </div>
            </div>}
        </div>
    </div>
})

export default MintSubmit
