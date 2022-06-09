import {observer} from "mobx-react";
import MintStore, {MintView} from "../../pages/Mint/Mint.store";
import {css} from "../../helpers/css";
import MediaInput from "./MediaInput";
import Button, {Submit} from "../Button/Button";
import Form from "../Form/Form";

const MintSelect = observer(({store}: { store: MintStore }) => {
  return <div>
    <div className={css("relative")}>
      <MediaInput store={store} isInput/>
      {store.hasFile && <div className={css("absolute")} style={{top: 0, right: 0}}>
        <Button onClick={() => store.file = null}>x</Button>
      </div>}
    </div>
    {!store.hasFile && <div className={css("text-sm", "mt-2", "text-neutral-400")}>
      accepts: {store.acceptedExtensionString}
    </div>}
    {store.hasFile && <div className={css("mt-2")}>
      <div>{store.file?.name}</div>
      <div className={css("flex", "justify-end", "mt-5")}>
        <Form onSubmit={() => store.onSelectSubmit()}>
          <Submit label={'continue'}/>
        </Form>
      </div>
    </div>}
  </div>
})

export default MintSelect
