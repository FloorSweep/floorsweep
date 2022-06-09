import React from "react";
import {useControlledFormField, useFormField} from "./useFormField";
import {useFormContext} from "./FormContext";
import {css} from "../../helpers/css";
import textFieldBaseStyles, {textFieldTypeStyles, TextFieldVariant} from "../TextField/TextFieldBaseStyles";
import {FormVariant} from "./Form";
import FormControl, {BaseInputProps, BaseInvalidInputStyle} from "./FormControl";

interface NumberInputProps extends BaseInputProps {
    max?: number;
    min?: number;
    placeholder?: string;
    block?: boolean;
}

const NumberInput = ({name, value, onChange, label, validate, block, ...rest}: NumberInputProps) => {
    const formVariant = useFormContext()
    const {input, meta, isRequired} = useFormField(name, validate)
    useControlledFormField(input.onChange, value)
    return <FormControl isRequired={isRequired} name={name} label={label}>
        <input
            {...input}
            {...rest}
            value={value}
            onChange={(e) => {
                input.onChange(e.target.value)
                onChange(e.target.value)
            }}
            type={"number"}
            className={css(textFieldBaseStyles, textFieldTypeStyles[formVariant === FormVariant.Light ? TextFieldVariant.Light : TextFieldVariant.Dark], {
                "w-full": block,
                [BaseInvalidInputStyle]: meta.error && meta.touched
            })}
        />
    </FormControl>
}

export default NumberInput
