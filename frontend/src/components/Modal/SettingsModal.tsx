import {observer} from "mobx-react";
import Modal from "./Modal";
import React, {useMemo} from "react";
import Form, {FormVariant} from "../Form/Form";
import TextInput from "../Form/TextInput";
import AppStore from "../../store/App.store";
import {Submit} from "../Button/Button";
import {css} from "../../helpers/css";
import SettingsModalStore from "./SettingsModal.store";
import {model} from "../../helpers/model";
import {websiteUrl} from "../Form/validation";

const SettingsModal: React.FC = observer(() => {
    const store = useMemo(() => {
        return new SettingsModalStore(AppStore.auth.account!)
    }, [AppStore.auth.accountId])
    return <Modal
        isOpen={AppStore.modals.isSettingsModalVisible}
        onChange={(val) => AppStore.modals.isSettingsModalVisible = val}
        title={"Settings"}>
        <Form
            variant={FormVariant.Dark}
            onSubmit={() => {
                return store.onSubmit()
            }}>
            <div className={css("flex", "flex-col", "space-y-4")}>
                <TextInput block {...model(store.controlAccount, 'displayName')} label={"Display Name"}/>
                <TextInput block {...model(store.controlAccount, 'websiteUrl')} label={"Website"} validate={websiteUrl}/>
                <TextInput block {...model(store.controlAccount, 'description')} type={"textarea"} label={"Description"}/>
                <Submit label={"submit"} disabled={store.diffKeys.length === 0}/>
            </div>
        </Form>
    </Modal>
})

export default SettingsModal
