import Demo from "./Demo";
import {observer} from "mobx-react";
import Button, {ButtonVariant} from "../Button/Button";
import {useMemo} from "react";
import SignMessageDemoStore from "./SignMessageDemo.store";
import AppStore from "../../store/App.store";
import TextField from "../TextField/TextField";
import {css} from "../../helpers/css";


const SignMessageDemo = observer(() => {
  const store = useMemo(() => new SignMessageDemoStore(), [])
  return <Demo title={"Sign Message"}>
    {AppStore.auth.isAuthed && <div className={css("flex", "justify-between")}>
      <TextField placeholder={"Message"} value={store.message} onChange={(val) => store.message = val}/>
      <Button onClick={() => store.signMessage()} variant={ButtonVariant.Black}>Sign Demo Message</Button>
    </div>}
    {!AppStore.auth.isAuthed && <div>please connect your wallet to sign a demo message</div>}
  </Demo>
})

export default SignMessageDemo
