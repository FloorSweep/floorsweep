import {Inject, Injectable, OnInit} from "@tsed/di";
import {Logger} from "@tsed/cli-core";

// const IPFS = require('ipfs');
// const ipfsClient = require('ipfs-http-client');
// const ipfs = ipfsClient({host: 'localhost', port: '5001', protocol: 'http'});

@Injectable()
export class IpfsService implements OnInit {

    @Inject()
    logger: Logger

    async $onInit() {
    }
}
