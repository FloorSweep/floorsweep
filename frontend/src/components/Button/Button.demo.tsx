import Demo, {SubDemo} from "../Demo/Demo";
import Button, {ButtonVariant} from "./Button";
import {successToast} from "../Toast/Toast";
import {css} from "../../helpers/css";

const ButtonDemo = () => {
  return <Demo title={"Button"}>
    <div className={css("grid", "grid-cols-2", "gap-5")}>
      <SubDemo title={"Primary Button"}>
        <Button onClick={() => successToast("Nice click")}>click me</Button>
      </SubDemo>
      <SubDemo title={"Primary Disabled"}>
        <Button onClick={() => successToast("Nice click")} disabled>click me</Button>
      </SubDemo>
      <SubDemo title={"Black Button"}>
        <Button variant={ButtonVariant.Black} onClick={() => successToast("Nice click")}>click me</Button>
      </SubDemo>
      <SubDemo title={"Black Button Disabled"}>
        <Button variant={ButtonVariant.Black} onClick={() => successToast("Nice click")} disabled>click me</Button>
      </SubDemo>
      <SubDemo title={"Success Button"}>
        <Button variant={ButtonVariant.Success} onClick={() => successToast("Nice click")}>click me</Button>
      </SubDemo>
      <SubDemo title={"Success Button Disabled"}>
        <Button variant={ButtonVariant.Success} onClick={() => successToast("Nice click")} disabled>click me</Button>
      </SubDemo>
      <SubDemo title={"Error Button"}>
        <Button variant={ButtonVariant.Error} onClick={() => successToast("Nice click")}>click me</Button>
      </SubDemo>
      <SubDemo title={"Error Button Disabled"}>
        <Button variant={ButtonVariant.Error} onClick={() => successToast("Nice click")} disabled>click me</Button>
      </SubDemo>
      <SubDemo title={"Text Button"}>
        <Button variant={ButtonVariant.Text} onClick={() => successToast("Nice click")}>click me</Button>
      </SubDemo>
      <SubDemo title={"Text Button Disabled"}>
        <Button variant={ButtonVariant.Text} onClick={() => successToast("Nice click")} disabled>click me</Button>
      </SubDemo>
    </div>
  </Demo>
}

export default ButtonDemo
