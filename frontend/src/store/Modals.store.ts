import {action, makeObservable, observable} from "mobx";

class ModalsStore {
  @observable
  isInitializeAccountModalVisible = false

  @observable
  isConnectWalletModalVisible = false

  @observable
  isSettingsModalVisible = false

  constructor() {
    makeObservable(this)
  }

  @action
  hideAll() {
    this.isConnectWalletModalVisible = false
    this.isConnectWalletModalVisible = false
    this.isSettingsModalVisible = false
  }
}

export default ModalsStore
