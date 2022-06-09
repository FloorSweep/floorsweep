import {css} from "../../helpers/css";
import {useMemo} from "react";
import MintStore, {MintView} from "./Mint.store";
import {observer} from "mobx-react";
import MintEdit from "../../components/Mint/MintEdit";
import MintSubmit from "../../components/Mint/MintSubmit";
import MintSelect from "../../components/Mint/MintSelect";
import AppStore from "../../store/App.store";
import MintReceipt from "../../components/Mint/MintReceipt";

const MintPage = observer(() => {
  const store = useMemo(() => new MintStore(), [])
  return <div className={css("flex", "flex-grow", "items-center", "justify-center", "text-neutral-400")}>
    {AppStore.auth.isAuthed && <>
      {store.currentView === MintView.Select && <MintSelect store={store}/>}
      {store.currentView === MintView.Edit && <MintEdit store={store}/>}
      {store.currentView === MintView.Submit && <MintSubmit store={store}/>}
      {store.currentView === MintView.Receipt && <MintReceipt store={store}/>}
    </>}

    {!AppStore.auth.isAuthed && <div>
      Please connect your wallet to mint
    </div>}
  </div>
})

export default MintPage
