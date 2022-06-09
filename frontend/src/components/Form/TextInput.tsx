import TextField, {TextFieldProps} from "../TextField/TextField";
import {useFormContext} from "./FormContext";
import {useControlledFormField, useFormField} from "./useFormField";
import {FormVariant} from "./Form";
import {TextFieldVariant} from "../TextField/TextFieldBaseStyles";
import FormControl, {BaseInputProps, BaseInvalidInputStyle} from "./FormControl";
import {css} from "../../helpers/css";

interface TextInputProps extends BaseInputProps, Pick<TextFieldProps, 'placeholder' | 'block' | 'disabled' | 'type'> {
}

const TextInput = ({name, value, onChange, label, validate, ...rest}: TextInputProps) => {
    const formVariant = useFormContext()
    const {input, meta, isRequired} = useFormField(name, validate)
    useControlledFormField(input.onChange, value)
    return <FormControl isRequired={isRequired} name={name} label={label}>
        <TextField
            {...input}
            {...rest}
            className={css({
                [BaseInvalidInputStyle]: meta.error && meta.touched
            })}
            variant={formVariant === FormVariant.Light ? TextFieldVariant.Light : TextFieldVariant.Dark}
            onChange={(val) => {
                input.onChange(val)
                onChange(val)
            }}
        />
    </FormControl>
}

export default TextInput
