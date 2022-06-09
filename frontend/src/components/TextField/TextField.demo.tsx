import Demo, {SubDemo} from "../Demo/Demo";
import TextField from "./TextField";
import {css} from "../../helpers/css";
import {TextFieldVariant} from "./TextFieldBaseStyles";

const TextFieldDemo = () => {
  return <Demo title={"TextField"}>
    <div className={css("grid", "grid-cols-2")}>
      <div className={css("bg-black", "p-6", "border-dashed", "border-2", "border-neutral-900", "mr-2")}>
        <SubDemo title={"Textfield"}>
          <TextField block placeholder={"hello"}/>
        </SubDemo>
        <SubDemo title={"Disabled"}>
          <TextField block disabled/>
        </SubDemo>
        <SubDemo title={"Loading"}>
          <TextField block isLoading/>
        </SubDemo>
      </div>
      <div className={css("bg-neutral-900", "p-6", "border-dashed", "border-2", "border-neutral-900", "ml-2")}>
        <SubDemo title={"Textfield"}>
          <TextField block variant={TextFieldVariant.Dark} placeholder={"hello"}/>
        </SubDemo>
        <SubDemo title={"Disabled"}>
          <TextField block variant={TextFieldVariant.Dark} disabled/>
        </SubDemo>
        <SubDemo title={"Loading"}>
          <TextField block variant={TextFieldVariant.Dark} isLoading/>
        </SubDemo>
      </div>
    </div>
  </Demo>
}

export default TextFieldDemo
