import {observer} from "mobx-react";
import MediaInput from "./MediaInput";
import MintStore from "../../pages/Mint/Mint.store";
import {css} from "../../helpers/css";
import Link from "../Link/Link";
import {DevToggle} from "../../environment/Dev";
import {jsonify} from "../../helpers/strings";
import AppStore from "../../store/App.store";

const MintReceipt = observer(({store}: {store: MintStore}) => {
  return <div>
    <div className={css("text-3xl", "text-center", "mb-10", "text-white")}>
      NFT Minted
    </div>
    <div className={css("flex", "justify-center")}>
      <div style={{maxWidth: "400px"}}>
        <MediaInput store={store}/>
        <div className={css("mt-2")}>
          <div className={css("text-white")}>{store.title}</div>
          <div className={css("text-sm", "text-neutral-400", "whitespace-pre-line")}>
            {store.description}
          </div>
        </div>
      </div>
    </div>
    <div className={css("flex", "justify-center", "items-center", "flex-col", "mt-7")}>
      {store.zkSyncTxLink && <Link isExternal href={store.zkSyncTxLink}>view tx</Link>}
      <div className={css("mt-2")}>
        <Link href={`/profile/${AppStore.auth.account!.address}`}>
          view your profile
        </Link>
      </div>
    </div>
    <DevToggle>
      {jsonify(store.receipt)}
    </DevToggle>
  </div>
})

export default MintReceipt
