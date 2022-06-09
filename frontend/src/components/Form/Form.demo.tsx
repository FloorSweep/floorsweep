import Form from "./Form";
import Demo from "../Demo/Demo";
import TextInput from "./TextInput";
import {useState} from "react";
import Button, {ButtonVariant, Submit} from "../Button/Button";
import {css} from "../../helpers/css";
import {sleep} from "zksync/build/utils";
import SelectInput from "./SelectInput";
import NumberInput from "./NumberInput";
import {jsonify} from "../../helpers/strings";
import {required} from "./validation";

const FormDemo = () => {
  const [textInputValue, setTextInputValue] = useState("test")
  const [textAreaInputValue, setTextAreaInputValue] = useState("why hello there")
  const [selectValue, setSelectValue] = useState("test")
  const [numberValue, setNumberValue] = useState(0)
  const selectItems = [{name: "test", id: "test"}, {name: "anothertest", id: "anothertest"}]

  return <Demo title={"Form"}>
    <Form onSubmit={async (data) => {
      await sleep(500)
      alert(jsonify(data))
    }}>
      <div className={css("flex", "items-end", "justify-between")}>
        <TextInput value={textInputValue} onChange={setTextInputValue} name={"textInput"} label={"Text Input"} validate={required}/>
        <Button
          onClick={() => setTextInputValue((Math.random() + 1).toString(36).substring(7))}
          variant={ButtonVariant.Black}>
          Change controlled
        </Button>
      </div>
      <div className={css("flex", "items-end", "justify-between", "mt-4")}>
        <TextInput type={"textarea"} value={textAreaInputValue} onChange={setTextAreaInputValue} name={"textAreaInput"} label={"Text Area Input"}/>
        <Button
          onClick={() => setTextAreaInputValue((Math.random() + 1).toString(36).substring(7))}
          variant={ButtonVariant.Black}>
          Change controlled
        </Button>
      </div>
      <div className={css("flex", "items-end", "justify-between", "mt-4")}>
        <SelectInput
          label={"Select Input"}
          defaultValue={"test"}
          name={"selectInput"}
          onChange={(val) => setSelectValue(val)}
          value={selectValue}
          items={selectItems}
        />
        <Button
          onClick={() => {
            const selectedIndex = selectItems.findIndex(item => item.id === selectValue)
            if (selectedIndex === selectItems.length - 1) {
              setSelectValue(selectItems[selectedIndex - 1].id)
            } else {
              setSelectValue(selectItems[selectedIndex + 1].id)
            }
          }}
          variant={ButtonVariant.Black}>
          Change controlled
        </Button>
      </div>
      <div className={css("flex", "items-end", "justify-between", "mt-4")}>
        <NumberInput
          label={"Number Input"}
          name={"numberInput"}
          onChange={(val) => setNumberValue(val)}
          value={numberValue}
          validate={required}
        />
        <Button
          onClick={() => {
            setNumberValue(numberValue + 1)
          }}
          variant={ButtonVariant.Black}>
          Change controlled
        </Button>
      </div>
      <div className={css("mt-8")}>
        <Submit block/>
      </div>
    </Form>
  </Demo>
}

export default FormDemo