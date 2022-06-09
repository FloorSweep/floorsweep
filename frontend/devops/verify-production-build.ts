import {Dirent} from "fs";
import ErrnoException = NodeJS.ErrnoException;

const flatten = require('flat').flatten;
// import {en} from '../src/languages/en';
const fs = require('fs');
const path = require('path');
type PATH_STRING = string;
const recursiveGetFiles = async (rootPath: PATH_STRING): Promise<PATH_STRING[]> => {
    const dirents = fs.readdirSync(rootPath, {withFileTypes: true})
    const files = await Promise.all(dirents.map((dirent: Dirent) => {
        const res = path.resolve(rootPath, dirent.name);
        return dirent.isDirectory() ? recursiveGetFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}
const TestDevComponentsNotPresentInProductionBuild = async () => {

    const debugKeywords = [
        "login as",
        "DebugAccordion",
        "DSL Page"
    ];
    const buildPath = path.join(__dirname, '..', 'build');

    const files = await recursiveGetFiles(buildPath);
    const promises = files.map(filePath => {
        return new Promise<void>((resolve, reject) => {
            fs.readFile(filePath, function (err: ErrnoException | null, data: Buffer) {
                if (err) {
                    reject(err);
                    return;
                }
                debugKeywords.forEach((debugKeyword) => {
                    if (data.indexOf(debugKeyword) >= 0) {
                        throw new Error(`Blacklist check fail: '${debugKeyword}' in path: ${filePath}; debug: ` + JSON.stringify({
                            str: (data + "").slice(
                                Math.max(data.indexOf(debugKeyword) - 10, 0),
                                data.indexOf(debugKeyword) + debugKeyword.length + 10
                            )
                        }))
                    }
                })
                resolve();
            });
        })
    })
    return Promise.all(promises).then(() => {
        console.log("[OK] TestDevComponentsNotPresentInProductionBuild test passed")
    })
}

const main = async () => {
    await TestDevComponentsNotPresentInProductionBuild();
    console.log("All tests finished");
}
main();
