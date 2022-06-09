import {convertFromDirectory} from "joi-to-typescript";

async function types() {
    console.log("Generating types from Joi schemas.")

    const result = await convertFromDirectory({
        schemaDirectory: './src/schemas',
        typeOutputDirectory: './src/interfaces/generated',
        debug: true
    })

    if (result) {
        console.log("Completed generating interfaces from Joi schemas")
    } else {
        console.error("Unable to generate interfaces from Joi schemas")
        process.exit(42069);
    }
}

types();
