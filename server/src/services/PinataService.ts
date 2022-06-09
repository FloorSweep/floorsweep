import {Injectable} from "@tsed/di";
import {PinataClient} from "@pinata/sdk";

@Injectable()
export class PinataService {
    private sdk: PinataClient;

    async $onInit() {
        const pinataSDK = require('@pinata/sdk');
        this.sdk = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);
        // await this.sdk.testAuthentication();
    }

    async uploadBlob(pinataName: string, readableStream: any) {
        console.log(`pinning blob to ${pinataName}`)
        const result = await this.sdk.pinFileToIPFS(readableStream, {
            pinataMetadata: {
                name: pinataName
            }
        });
        console.log("debug:: uploadblob", result.IpfsHash)
        return result.IpfsHash;

    }

    async uploadJSON(pinataName: string, json: object) {
        console.log(`pinning json object to ${pinataName}`)
        const result = await this.sdk.pinJSONToIPFS(json, {
            pinataMetadata: {
                name: pinataName
            }
        });
        console.log("debug:: uploadjson", result.IpfsHash)
        return result.IpfsHash;

    }

    async uploadFile(pinataName: string, path: string) {
        console.log(`pinning ${path} to ${pinataName}`)
        const result = await this.sdk.pinFromFS(path, {
            pinataMetadata: {
                name: pinataName
            }
        });
        return result.IpfsHash;
    }
}
