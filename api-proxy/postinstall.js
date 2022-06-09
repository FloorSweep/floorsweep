const path = require('path');
const fs = require('fs');
const replace = require('replace-in-file');

let envExamplePath = path.join(__dirname, '.env.example');
let envDstPath = path.join(__dirname, '.env');
// env will be overwritten by this
fs.copyFile(envExamplePath, envDstPath, async (err) => {
    if (err) throw err;
    try {
        let apiProxyParentDirectoryBaseName = path.dirname(__dirname).split(path.sep).pop();
        let apiProxyPm2ProcessName = `${apiProxyParentDirectoryBaseName}-api-proxy`;
        const replacementStatuses = await replace({
                                                      files: envDstPath,
                                                      from: 'PM2_API_PROXY_PROCESS_NAME=',
                                                      to: `PM2_API_PROXY_PROCESS_NAME="${apiProxyPm2ProcessName}"`
                                                  })
        // console.log('Replacement replacementStatuses:', replacementStatuses);
        console.warn("[postinstall] .env file has been regenerated");
        if (replacementStatuses[0].hasChanged) {
            console.warn("[postinstall] pm2 api-proxy process name has been set to: ", apiProxyPm2ProcessName)
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
});
