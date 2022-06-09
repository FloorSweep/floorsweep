import {css} from "../../helpers/css";
import textFieldBaseStyles, {TextFieldVariant, textFieldTypeStyles} from "./TextFieldBaseStyles";
import Spinner, {SpinnerSize} from "../Spinner/Spinner";

type BaseTextFieldProps =
    Pick<React.HTMLProps<HTMLInputElement>, "placeholder" | "name" | "type">

export interface TextFieldProps extends BaseTextFieldProps {
    value?: string;
    onChange?: (value: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
    name?: string;
    block?: boolean;
    variant?: TextFieldVariant;
    className?: string;
}

const TextField = ({
                       onChange,
                       isLoading = false,
                       disabled = false,
                       value,
                       name,
                       placeholder,
                       block,
                       type = "text",
                       variant = TextFieldVariant.Light,
                       className,
                       ...rest
                   }: TextFieldProps & BaseTextFieldProps) => {

    const Component = type === "textarea" ? "textarea" : "input"
    return <div className={css("relative", {"block": block, "inline-block": !block})}>
        <Component
            {...rest}
            value={value}
            name={name}
            type={type}
            disabled={disabled || isLoading}
            placeholder={placeholder}
            onChange={e => {
                onChange && onChange(e.target.value)
            }}
            className={css(textFieldBaseStyles, textFieldTypeStyles[variant], className, {"w-full": block})}
        />
        {isLoading && <div
          className={css("w-full", "h-full", "absolute", "flex", "items-center", "justify-center")}
          style={{left: 0, top: 0}}>
          <Spinner size={SpinnerSize.sm}/>
        </div>}
    </div>
}

export default TextField
