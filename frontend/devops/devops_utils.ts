import * as fs from "fs";


const PREFIX_JS = `/*****************************************************************************************************************************/
/****** WARNING! THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY OR OTHERWISE YOUR CHANGES WILL BE OVERWRITTEN!! ******/
/*****************************************************************************************************************************/`;

const PREFIX_PY = `###################################################################################################################################
####### WARNING! THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY OR OTHERWISE YOUR CHANGES WILL BE OVERWRITTEN!! #######
###################################################################################################################################`;

const getPrefix = (filename: string) => {
    return filename.split('.').pop() === "py" ? PREFIX_PY : PREFIX_JS;
}

const writeFile = (outputFileName: string, content: string) => {
    console.log("Writing file ", outputFileName, "with", content);
    content = `${getPrefix(outputFileName)}
${content}
`;
    fs.writeFile(outputFileName, content, function (err: any) {
        if (err) {
            return console.error(err);
        }
        console.log("The file was created!");
    });
};

const writeFileSync = (outputFileName: string, content: string) => {
    console.log("Writing file ", outputFileName, "with", content);
    content = `${getPrefix(outputFileName)}
${content}
`;
    try {
        fs.writeFileSync(outputFileName, content);
    } catch (err) {
        console.error(err);
        return false;
    }
    console.log("The file was created!");
    return true;
}

const devopsUtils = {writeFile, writeFileSync};
export default devopsUtils;
