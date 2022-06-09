import devopsUtils from "./devops_utils";
//
// !!!!!!!!!!!!!!
// WE SHOULD NEVER IMPORT HERE ANYTHING FROM ./src BUT VERCEL IS FUCKING UP THE ENVS SO WE IMPORT IT HERE
// TO HAVE WHAT ENV WILL PROBABLY END UP IN THE BUILD FOR AUDITING
// burn this piece of crap really
// !!!!!!!!!!!!!!
import env from "../src/environment";

const {exec, execSync} = require("child_process");
const path = require('path');
const buildNumberPath = path.join(__dirname, '..', 'src', 'build_number.ts');
const buildNumber = parseInt(execSync("git log HEAD --pretty=oneline | wc -l").toString().trim());
const branchName = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
const lastMessage = execSync("git log -1").toString().trim();
// caution! depending on place you run this script following command may cause ambiguity:
// in pre-commit hook it will show previous hash
// on CI task it will show current hash
const lastHash = execSync("git rev-parse HEAD").toString().trim();
const data = {
    branchName,
    lastHash,
    lastMessage: (process.env.NODE_ENV === "development" || process.env.REACT_APP_ZZ_ENV === "aws_develop") ? lastMessage : "***",
    buildNumber: `#${(buildNumber + '').padStart(6, '0')}`,
    buildTime: new Date(),
    isCI: !!process.env.ZZ_IS_CI,
    _VERCEL_FUCKED_ENV: env.name
};
if(process.env.ZZ_IS_CI){
    console.log("~~~~~ CI BUILD ENVS ~~~~~")
    console.log(process.env)
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~")
}
const content = `
const buildInfo = ${JSON.stringify(data, null, 2)};
export default buildInfo;
`;
devopsUtils.writeFile(buildNumberPath, content);
