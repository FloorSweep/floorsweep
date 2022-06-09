import {Command, CommandProvider, QuestionOptions} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {AccountsRepository} from "../services/AccountsRepository";
import {ZZApp} from "../services/ZZApp";
import {Agendable} from "./Agendable";
import '../sentry';

export interface ZkWebsocketCommandContext {
}

@Command({
    name: "zk:ws",
    description: "XX WS XX",
    args: {},
    options: {},
    allowUnknownOption: false
})
export class ZkWebsocketCommand extends Agendable implements CommandProvider {

    @Inject()
    accounts: AccountsRepository;

    @Inject()
    app: ZZApp;

    /**
     *  Ask questions with Inquirer. Return an empty array or don't implement the method to skip this step
     */
    async $prompt(initialOptions: Partial<ZkWebsocketCommandContext>): Promise<QuestionOptions> {
        return [];
    }

    /**
     * This method is called after the $prompt to create / map inputs to a proper context for the next step
     */
    $mapContext(ctx: Partial<ZkWebsocketCommandContext>): ZkWebsocketCommandContext {
        return {
            ...ctx
            // map something, based on ctx
        };
    }

    private async maybeSyncAddress(address: string) {
        const acc = await this.accounts.findFirst({
            where: {
                address: address.toLowerCase()
            }
        });
        if (acc) {
            await this.app.maybeResyncAddress(address);
            return true;
        }
        return false;
    }

    /**
     *  This step run your tasks with Listr module
     */
    async $exec(ctx: ZkWebsocketCommandContext): Promise<any> {

        //
        //
        //                💫   💫      ZK-WS       💫    💫
        //
        //
        // https://docs.zksync.io/dev/events.html#establishing-a-connection
        //
        //
        //
        // LEEEESSSSGOOOO \/\/\/\

        await this.initAgenda();

        const WebSocket = require('ws');

        let url;
        if (this.app.getNetworkName() === 'rinkeby') {
            url = 'wss://rinkeby-events.zksync.io/';
        } else if (this.app.getNetworkName() === 'mainnet') {
            url = 'wss://events.zksync.io/';
        } else {
            throw new Error("INVALID ENV");
        }

        console.log(`[zksync] subscribing to ${url}`);

        const ws = new WebSocket(url);


        ws.on('open', function open() {
            console.log("[zksync] registering for events")
            ws.send('{}');
        });

        let count = 0;
        ws.on('message', (message: any) => {
            const event = JSON.parse(message);
            ++count;
            if (count % 1000 === 0) {
                console.log(`[${count}] got message type=${event.type} block=${event.block_number}`);
            }
            // console.log(JSON.stringify(event, null, 2));
            // We are looking for transfers to the specific account.
            if (event.type === 'transaction') {
                if (
                    event.data.tx.type === 'Transfer'
                    || event.data.tx.type === 'Withdraw'
                ) {
                    // https://docs.zksync.io/api/events.html#transfer
                    this.maybeSyncAddress(event.data.tx.from);
                    this.maybeSyncAddress(event.data.tx.to);

                    // TODO: check if transfer involves tokenId we have in our db, if so insert pending_trade row
                } else if (
                    event.data.tx.type === 'Deposit'
                ) {
                    // https://docs.zksync.io/api/events.html#deposit
                    this.maybeSyncAddress(event.data.tx.priority_op.from);
                    this.maybeSyncAddress(event.data.tx.priority_op.to);

                }
            }
        });

        ws.on('close', function close(code: any, reason: any) {
            console.log(`Connection closed with code ${code}, reason: ${reason}`);
            process.exit(255);
        });

        // make sure that the connection is alive
        setInterval(function () {
            console.log("pinging...");
            ws.ping();
        }, 10000);

        return [];
    }
}
