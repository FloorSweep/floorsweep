import {css} from "../../helpers/css";

export enum TextFieldVariant {
  Light = "light",
  Dark = "dark"
}

const textFieldBaseStyles = css(
  "text-white", "py-1", "px-2",
  "appearance-none", "disabled:bg-neutral-800",
  "placeholder-neutral-600", "text-lg", "focus:outline-none", "rounded-sm"
)

export const textFieldTypeStyles = {
  [TextFieldVariant.Light]: ["bg-neutral-900"],
  [TextFieldVariant.Dark]: ["bg-black"]
}

export default textFieldBaseStyles
