import {ObjectSchema} from "joi";
import {Injectable, OverrideProvider} from "@tsed/di";
import {JsonParameterStore, PipeMethods} from "@tsed/schema";
import {ValidationError, ValidationPipe} from "@tsed/platform-params";

@OverrideProvider(ValidationPipe)
export class JoiValidationPipe extends ValidationPipe implements PipeMethods {
    transform(valueBeforeValidation: any, metadata: JsonParameterStore) {
        const schema = metadata.store.get<ObjectSchema>(JoiValidationPipe);
        if (schema) {
            const {value, error} = schema.validate(valueBeforeValidation);
            if (error) {
                const ret: any = {};
                let msg: string[] = [];
                for (let i = 0; i < error.details.length; ++i) {
                    const e = error.details[i];
                    if (e.context && e.context.key) {
                        ret[e.context.key] = e.message;
                        msg.push(e.message);
                    } else {
                        ret["_other_validation_error"] = "error_js";
                    }
                }
                throw new ValidationError(msg.join(", "), ret);
            }
            return value;
        } else {
            return valueBeforeValidation;
        }
    }
}
