import {observer} from "mobx-react";
import Modal from "./Modal";
import AppStore from "../../store/App.store";
import {css} from "../../helpers/css";
import Icon from "../Icon/Icon";

const GlobalErrorModal = observer(() => {
  return <Modal
    title={"DEV ERROR"}
    isOpen={AppStore.isCriticalErrorHit}
  >
    {AppStore.criticalErrorMessage.map((message, index) => <div key={`error-${index}`} className={css("flex", "items-center", "text-red-500")}>
      <div className={css("mr-3")}><Icon icon={'error'} size={15}/></div>
      <div className={css("font-bold")}>{message.message}</div>
    </div>)}
  </Modal>
})

export default GlobalErrorModal
