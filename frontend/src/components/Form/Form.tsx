import {Form as FinalForm} from "react-final-form"
import {FORM_ERROR, FormApi} from "final-form";
import ApiError from "../../services/errors/Api.error";
import FormContext from "./FormContext";
import {PropsWithChildren} from "react";
import {DevToggle} from "../../environment/Dev";
import {jsonify} from "../../helpers/strings";
import {css} from "../../helpers/css";


export enum FormVariant {
    Light = "light",
    Dark = "dark"
}

interface FormProps {
    onSubmit: (data: Record<string, any>, form: FormApi) => Promise<any>;
    variant?: FormVariant;
}

const Form: React.FC<PropsWithChildren<FormProps>> = ({
                                                          children,
                                                          onSubmit,
                                                          variant = FormVariant.Light
                                                      }) => {

    const apiErrorMiddleware = (data: Record<string, any>, form: FormApi) => {
        return onSubmit(data, form).catch(e => {
            if (e instanceof ApiError) {
                return {[FORM_ERROR]: e.message}
            } else {
                throw e
            }
        })
    }

    return <FormContext.Provider value={variant}>
        <FinalForm
            onSubmit={(data, form) => apiErrorMiddleware(data, form)}
            render={({handleSubmit, submitError, values, errors}) => {
                return <>
                    <form onSubmit={handleSubmit}>
                        {children}
                    </form>
                    {/*<DevToggle>*/}
                    {/*    <div>*/}
                    {/*        <div>*/}
                    {/*            values*/}
                    {/*        </div>*/}
                    {/*        <div>*/}
                    {/*            {jsonify(values)}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div className={css("mt-4")}>*/}
                    {/*        <div>*/}
                    {/*            errors*/}
                    {/*        </div>*/}
                    {/*        <div>*/}
                    {/*            {jsonify(errors)}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</DevToggle>*/}
                </>
            }}
        />
    </FormContext.Provider>
}

export default Form
