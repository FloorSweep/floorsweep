import React, {useContext} from "react"
import {FormVariant} from "./Form";

const FormContext = React.createContext<FormVariant | null>(null)
export const useFormContext = () => {
  return useContext(FormContext)
}

export default FormContext
