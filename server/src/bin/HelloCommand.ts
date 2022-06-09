import {Command, CommandProvider, QuestionOptions} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {NftsRepository} from "../services/NftsRepository";

export interface HelloCommandContext {
}

@Command({
    name: "hello-command",
    description: "Command description",
    args: {},
    options: {},
    allowUnknownOption: false
})
export class HelloCommand implements CommandProvider {

    @Inject()
    nfts: NftsRepository;

    /**
     *  Ask questions with Inquirer. Return an empty array or don't implement the method to skip this step
     */
    async $prompt(initialOptions: Partial<HelloCommandContext>): Promise<QuestionOptions> {
        return [];
    }

    /**
     * This method is called after the $prompt to create / map inputs to a proper context for the next step
     */
    $mapContext(ctx: Partial<HelloCommandContext>): HelloCommandContext {
        return {
            ...ctx
            // map something, based on ctx
        };
    }

    /**
     *  This step run your tasks with Listr module
     */
    async $exec(ctx: HelloCommandContext): Promise<any> {
        //
        // FIX ALL NFTS SIZES
        //
        const nfts = await this.nfts.findMany({
            where: {
                imgWidth: null,
                imgHeight: null,
            }
        });
        for (let i = 0; i < nfts.length; ++i) {
            const size = await this.nfts.getIpfsImageSize(nfts[i].imageCID);
            console.log({
                nftId: nfts[i].tokenId,
                size
            })
            await this.nfts.update({
                where: {
                    id: nfts[i].id,
                },
                data: {
                    imgWidth: size.width,
                    imgHeight: size.height
                }
            })
        }
        console.log("Done");
        return [];
        const imageCid = await this.nfts.getImageCIDByContentHash("Qmez4bq6w34NsFwUR6qQ3hNPBzhZJaDqmRXKqqDNeg2npX")
        console.log(imageCid);
        const size = await this.nfts.getIpfsImageSize(imageCid);
        console.log(size);
        return [];
        const res = await this.nfts.getHistory(123986)
        console.log(res);
        return [];
        return [
            {
                title: "Do something",
                task: () => {
                    console.log('HELLO')
                }
            }
        ];
    }
}
