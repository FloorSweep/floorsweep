import Select, {SelectProps, SelectVariant} from "../Select/Select";
import {useFormContext} from "./FormContext";
import {useControlledFormField, useFormField} from "./useFormField";
import {FormVariant} from "./Form";
import FormControl, {BaseInputProps, BaseInvalidInputStyle} from "./FormControl";
import {css} from "../../helpers/css";

interface SelectInputProps extends BaseInputProps, Pick<SelectProps, 'items' | 'defaultValue' | 'block'> {
}

const SelectInput = ({name, value, onChange, label, validate, items, ...rest}: SelectInputProps) => {
    const formVariant = useFormContext()
    const {input, meta, isRequired} = useFormField(name, validate)
    useControlledFormField(input.onChange, value)
    return <FormControl isRequired={isRequired} name={name} label={label}>
        <Select
            {...input}
            {...rest}
            className={css({
                [BaseInvalidInputStyle]: meta.error && meta.touched
            })}
            variant={formVariant === FormVariant.Light ? SelectVariant.Light : SelectVariant.Dark}
            items={items}
            value={input.value}
            onChange={(val) => {
                input.onChange(val)
                onChange(val)
            }}/>
    </FormControl>
}

export default SelectInput