import {makeObservable, observable, toJS} from "mobx";
import {Account} from "../../interfaces";
import {Http} from "../../services";
import AppStore from "../../store/App.store";
import {getShallowEqualDiffKeys} from "../../helpers/arrays";
import {mutateEmptyStringKeysToNull, mutateNullKeysToEmptyString} from "../../helpers/objects";
import {successToast} from "../Toast/Toast";

class SettingsModalStore {

    @observable
    private readonly originalAccount: Account

    @observable
    controlAccount: Account

    constructor(originalAccount: Account) {
        makeObservable(this)
        this.originalAccount = toJS(originalAccount)
        mutateNullKeysToEmptyString(this.originalAccount)
        this.controlAccount = toJS(this.originalAccount)
    }

    get diffKeys() {
        return getShallowEqualDiffKeys(this.controlAccount, this.originalAccount)
    }

    onSubmit() {
        const body: Partial<{[key in keyof Account]: string}> = {}
        this.diffKeys.forEach(key => {
            body[key] = this.controlAccount[key];
        })
        mutateEmptyStringKeysToNull(body);
        return AppStore.auth.updateAccount(body).then(() => {
            successToast("Profile updated")
            AppStore.modals.isSettingsModalVisible = false
        });
    }
}

export default SettingsModalStore
