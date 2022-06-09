import {Store} from "@tsed/core";
import {UseJoiSchema} from "./UseJoiSchema";
import Joi from "joi";
import {JoiValidationPipe} from "../pipes/JoiValidationPipe";

describe("UseJoiSchema", () => {
    it("should store options", () => {

        const TestSchema = Joi.object().keys({
            accountId: Joi.number().required()
        })

        class Test {
            method(
                @UseJoiSchema(TestSchema) test: any
            ) {
                return null
            }
        }

        const store = Store.fromMethod(Test, "method");
        const pipe = store.get(JoiValidationPipe)
        expect(pipe).toEqual(TestSchema);
    });
});
