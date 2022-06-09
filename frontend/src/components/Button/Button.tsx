import React, {PropsWithChildren} from "react";
import {Argument} from "classnames";
import {css} from "../../helpers/css";
import {useFormState} from "react-final-form";
import Spinner, {SpinnerSize} from "../Spinner/Spinner";
import {observer} from "mobx-react";
import AppStore from "../../store/App.store";
import {objectKeys} from "../../helpers/arrays";

export enum ButtonVariant {
    Primary = 'primary',
    Error = 'error',
    Black = 'black',
    Success = 'success',
    Metamask = 'metamask',
    WalletConnect = 'walletconnect',
    Coinbase = 'coinbase',
    Text = 'text'
}

export enum ButtonSize {
    xs = 'xs',
    sm = 'sm',
    lg = 'lg'
}

const baseButtonStyles = css("disabled:cursor-not-allowed", "font-mono", "relative", "text-white", "rounded-sm")
const zzButtonHoverStyle = css("bg-gradient-to-r", "hover-hover:hover:from-zz-50", "hover-hover:hover:via-zz-100", "hover-hover:hover:to-zz-150")
const blackButtonStyle = css("bg-black", "disabled:opacity-50", baseButtonStyles)

const buttonVariantStyles = {
    [ButtonVariant.Primary]: css("bg-neutral-800", "disabled:opacity-50", baseButtonStyles),
    [ButtonVariant.Black]: css(blackButtonStyle),
    [ButtonVariant.Error]: css("bg-gradient-to-r", "from-red-600", "to-red-700", "disabled:opacity-50", "disabled:bg-neutral-800", "disabled:bg-none", baseButtonStyles),
    [ButtonVariant.Success]: css("bg-gradient-to-r", "from-zz-50", "via-zz-100", "to-zz-150", "font-bold", "disabled:bg-none", "disabled:opacity-50", "disabled:bg-neutral-800", baseButtonStyles),
    [ButtonVariant.Metamask]: css(blackButtonStyle),
    [ButtonVariant.WalletConnect]: css(blackButtonStyle),
    [ButtonVariant.Coinbase]: css(blackButtonStyle),
    [ButtonVariant.Text]: css("font-mono", "disabled:text-neutral-400")
}

const buttonHoverStyle = {
    [ButtonVariant.Primary]: css(zzButtonHoverStyle),
    [ButtonVariant.Black]: css(zzButtonHoverStyle),
    [ButtonVariant.Error]: css(),
    [ButtonVariant.Success]: css(zzButtonHoverStyle),
    [ButtonVariant.Metamask]: css("bg-gradient-to-r", "hover-hover:hover:from-metamask-150", "hover-hover:hover:via-metamask-100", "hover-hover:hover:to-metamask-50"),
    [ButtonVariant.WalletConnect]: css("bg-gradient-to-r", "hover-hover:hover:from-walletConnect-150", "hover-hover:hover:via-walletConnect-100", "hover-hover:hover:to-walletConnect-50"),
    [ButtonVariant.Coinbase]: css("bg-gradient-to-r", "hover-hover:hover:from-coinbase-150", "hover-hover:hover:via-coinbase-100", "hover-hover:hover:to-coinbase-50"),
    [ButtonVariant.Text]: css("hover-hover:hover:underline")
}

const buttonSizeStyles = {
    [ButtonSize.xs]: css("px-0", "text-base"),
    [ButtonSize.sm]: css("px-3", "py-1", "text-lg"),
    [ButtonSize.lg]: css("p-4", "text-xl")
}

interface ButtonProps {
    onClick?: () => void;
    variant?: ButtonVariant,
    size?: ButtonSize,
    block?: boolean,
    className?: Argument;
    disabled?: boolean;
    isLoading?: boolean;
    type?: "button" | "submit";
    children?: React.ReactNode
}

const Button = React.forwardRef<any, PropsWithChildren<ButtonProps>>(({
                                     onClick,
                                     children,
                                     variant = ButtonVariant.Primary,
                                     size = ButtonSize.sm,
                                     block,
                                     className,
                                     disabled,
                                     type = "button",
                                     isLoading
                                 }, ref) => {
    return <button
        ref={ref}
        disabled={disabled}
        type={type}
        onClick={onClick && onClick}
        className={css(buttonSizeStyles[size], buttonVariantStyles[variant], {
            "w-full": block,
            [buttonHoverStyle[variant]]: !disabled
        }, className)}
    >
        {children}
        {isLoading && <div
          className={css("w-full", "h-full", "absolute", "flex", "items-center", "justify-center", "bg-neutral-800", "opacity-90")}
          style={{left: 0, top: 0}}>
          <Spinner size={SpinnerSize.sm}/>
        </div>}
    </button>
})

interface SubmitProps extends ButtonProps {
    label?: string;
}

export const Submit: React.FC<SubmitProps> = ({label, disabled, ...rest}) => {
    const {submitting, errors, modified} = useFormState()
    const isError = objectKeys(modified).length > 0 && objectKeys(errors).length > 0
    return <Button type={"submit"} isLoading={submitting} disabled={submitting || disabled || isError} {...rest}>
        {label ? label : "Submit"}
    </Button>
}


interface ConnectWalletButtonProps extends Pick<ButtonProps, 'block'> {
    label?: string
}

export const ConnectWalletButton = observer(({block, label}: ConnectWalletButtonProps) => {
    return <Button
        block={block}
        isLoading={AppStore.auth.isAuthLoading}
        disabled={AppStore.auth.isAuthLoading}
        onClick={() => AppStore.modals.isConnectWalletModalVisible = true}>
        {label ? label : "connect"}
    </Button>
})

export default Button
