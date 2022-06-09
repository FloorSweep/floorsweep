import {useField} from "react-final-form";
import {css} from "../../helpers/css";
import React, {PropsWithChildren} from "react";
import {ValidatorFunction} from "./validation";

export interface BaseInputProps {
    name: string;
    value: string | number;
    onChange: (value: any) => void;
    label?: string;
    validate?: ValidatorFunction[] | ValidatorFunction
}

export const BaseInvalidInputStyle = css("border-2", "border-red-700");

interface FormControlProps extends Pick<BaseInputProps, 'label' | 'name'> {
    children: any;
    isRequired: boolean
}

const FormControl = ({label, children, name, isRequired}: FormControlProps) => {
    const {meta} = useField(name, {subscription: {touched: true, error: true, pristine: true, visited: true}})
    const isInvalid = meta.error && meta.touched
    return <div>
        {label && <FormLabel isRequired={isRequired} isInvalid={isInvalid}>{label}</FormLabel>}
        {children}
        {isInvalid && <div className={css("text-red-500", "text-sm", "mt-1")}>
            {meta.error}
        </div>}
    </div>
}

export const FormLabel: React.FC<PropsWithChildren<{ isInvalid: boolean, isRequired: boolean }>> = (
    {
        children,
        isInvalid,
        isRequired
    }) => {
    return <div className={css("mb-1", "text-neutral-400", {
        "flex": isRequired
    })}>
        {isRequired && <span className={css("mr-1", "text-sm", {
            "text-red-500": isInvalid,
        })}>*</span>}
        {children}
    </div>
}

export default FormControl
