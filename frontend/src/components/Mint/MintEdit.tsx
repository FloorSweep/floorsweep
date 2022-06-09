import {observer} from "mobx-react";
import MintStore, {MintView} from "../../pages/Mint/Mint.store";
import {css} from "../../helpers/css";
import MediaInput from "./MediaInput";
import Button, {ButtonVariant, Submit} from "../Button/Button";
import Form from "../Form/Form";
import TextInput from "../Form/TextInput";
import {jsonify} from "../../helpers/strings";
import {objectKeys} from "../../helpers/arrays";
import {DevToggle} from "../../environment/Dev";
import {required} from "../Form/validation";

const MintEdit = observer(({store}: { store: MintStore }) => {
    return <div className={css("grid", "grid-cols-1", "md:grid-cols-2", "space-y-16", "md:space-y-0", "md:space-x-16")}>
        <div style={{maxWidth: "400px"}} className={css("w-full")}>
            <MediaInput store={store}/>
            <div className={css("mt-2")}>
                <div className={css("break-words", "whitespace-pre-line", "text-white")}>
                    {store.title === "" ? "Your name here" : store.title}
                </div>
                <div className={css("text-sm", "text-neutral-400", "break-words", "whitespace-pre-line")}>
                    {store.description === "" ? "Your description here" : store.description}
                </div>
            </div>
        </div>
        <div className={css("flex", "flex-col", "w-full")} style={{maxWidth: "400px"}}>
            <Form onSubmit={() => store.onEditSubmit()}>
                <div className={css("flex", "flex-col", "space-y-5")}>
                    <TextInput validate={required} block name={"title"} label={"Name"} value={store.title} placeholder={"My precious"}
                               onChange={(val) => store.title = val}/>
                    <TextInput block type={"textarea"} name={"description"} label={"Description"}
                               placeholder={"n-o-n f-u-n-g-i-b-l-e"} value={store.description}
                               onChange={(val) => store.description = val}/>
                    <AttributesInput store={store}/>
                </div>
                <div className={css("flex", "justify-between", "mt-8")}>
                    <Button variant={ButtonVariant.Black} onClick={() => store.goBack()}>back</Button>
                    <Submit label={"continue"}/>
                </div>
            </Form>
        </div>
        <DevToggle>
            {jsonify(store._attributeControl)}
            <div className={css("my-4")}>attributes below</div>
            {jsonify(store.attributes)}
        </DevToggle>
    </div>
})

const AttributesInput = observer(({store}: { store: MintStore }) => {
    return <>
        {store.attributeControlCount > 0 && <div className={css("flex", "flex-col", "space-y-3")}>
            {objectKeys(store._attributeControl).map((_, count) => <RepeaterInput key={`repeater-${count}`} count={count}
                                                                                  store={store}/>)}
        </div>}
        <div className={css("text-right", "mt-3")}>
            {store.attributeControlCount !== 0 && <Button variant={ButtonVariant.Black} onClick={() => {
                const control = JSON.parse(jsonify(store._attributeControl))
                if (store.attributeControlCount > 0) {
                    delete control[`repeater-${store.attributeControlCount - 1}`]
                }
                store._attributeControl = control
            }}>-</Button>}
            <Button disabled={store.isAddNewAttributeDisabled} variant={ButtonVariant.Black} onClick={() => {
                store._attributeControl[`repeater-${store.attributeControlCount}`] = {trait_type: "", value: ""}
            }}>{store.attributeControlCount === 0 ? 'Add attributes +' : '+'}</Button>
        </div>
    </>
})

const RepeaterInput = observer(({store, count}: { store: MintStore, count: number }) => {
    const repeaterName = `repeater-${count}`
    return <div className={css("grid", "grid-cols-2", "space-x-4")}>
        <TextInput validate={required} block
                   name={`attributeName-${count}`} label={"Name"}
                   placeholder={"Looks"}
                   value={store._attributeControl[repeaterName].trait_type}
                   onChange={(trait_type) => {
                       store._attributeControl[repeaterName] = {...store._attributeControl[repeaterName], trait_type}
                   }}/>
        <TextInput validate={required} block name={`attributeValue-${count}`} label={"Value"} value={store._attributeControl[repeaterName].value}
                   placeholder={"Rare"}
                   onChange={(value) => {
                       store._attributeControl[repeaterName] = {...store._attributeControl[repeaterName], value}
                   }}/>
    </div>
})

export default MintEdit
