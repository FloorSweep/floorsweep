import {Command, CommandProvider, QuestionOptions} from "@tsed/cli-core";
import {Agenda, Job} from "agenda";
import {JobPriority} from "agenda/dist/agenda/define";
import {Inject} from "@tsed/di";
import {SyncJobService} from "../services/SyncJobService";
import {ZZApp} from "../services/ZZApp";
import {ZkSyncService} from "../services/ZkSyncService";
import {Logger} from "@tsed/logger";
import {NftsRepository} from "../services/NftsRepository";
import {AccountsRepository} from "../services/AccountsRepository";
import {isProduction, isTest} from "../environment/helpers";
import {sleep} from "zksync/build/utils";
import {randomUUID} from "crypto";
import {AGENDA_JOB_SYNC_ADDRESS} from "../constants";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AgendaWorkerCommandContext {
}

@Command({
    name: "agenda-worker",
    description: "Command description",
    args: {},
    options: {},
    allowUnknownOption: false
})
export class AgendaWorkerCommand implements CommandProvider {
    @Inject()
    logger: Logger;

    @Inject()
    sync: SyncJobService;

    @Inject()
    nfts: NftsRepository;

    @Inject()
    accounts: AccountsRepository;

    @Inject()
    app: ZZApp;

    @Inject()
    zk: ZkSyncService;

    /**
     *  Ask questions with Inquirer. Return an empty array or don't implement the method to skip this step
     */
    async $prompt(initialOptions: Partial<AgendaWorkerCommandContext>): Promise<QuestionOptions> {
        return [];
    }

    /**
     * This method is called after the $prompt to create / map inputs to a proper context for the next step
     */
    $mapContext(ctx: Partial<AgendaWorkerCommandContext>): AgendaWorkerCommandContext {
        return {
            ...ctx
            // map something, based on ctx
        };
    }

    /**
     *  This step run your tasks with Listr module
     */
    async $exec(ctx: AgendaWorkerCommandContext): Promise<any> {
        const agenda = new Agenda({
            db: {
                address: process.env.ZZ_MONGO_ADDRESS + "agenda",
                options: {
                    authSource: 'admin',
                    auth: {
                        username: process.env.ZZ_MONGO_USER,
                        password: process.env.ZZ_MONGO_PW,
                    },
                }
            },
            lockLimit: 5
        });
        const workerId = randomUUID().substring(0, 4);
        console.log(`workerId=${workerId}`)
        const wrapJob = async (prefix: string, job: () => Promise<any>) => {
            console.log(`>job.` + prefix)
            await job();
            console.log(`<job.` + prefix)
        }
        const logPendingJobs = async () => {

            const data = {
                syncAddress: await this.app.countSyncJobs(AGENDA_JOB_SYNC_ADDRESS),
                syncNFT: await this.app.countSyncJobs("syncNFT"),
            }
            this.logger.info(`********** PENDING JOBS **********`)
            console.log(JSON.stringify(data, null, 2))
            this.logger.info(`***********************************`)
        }

        agenda.define("pendingJobsStatus_" + workerId, {
            priority: JobPriority.high,
            concurrency: 1,
            lockLifetime: 10 * 1000
        }, async (job: Job) => {
            await wrapJob("pendingJobsStatus", logPendingJobs);
        });
        agenda.define("systemStatus_" + workerId, {
            priority: JobPriority.high,
            concurrency: 1,
            lockLifetime: 10 * 1000
        }, async (job: Job) => {
            await wrapJob("systemStatus", async () => {
                const data = {
                    countNFTs: await this.nfts.countNfts(),
                    countAccounts: await this.accounts.countAccounts(),
                }
                console.log(`+-+-+-+-+-+- SYSTEM STATUS +-+-+-+-+-+-`)
                console.log(JSON.stringify(data, null, 2))
                console.log(`+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-`)
            })
        });
        agenda.define(AGENDA_JOB_SYNC_ADDRESS, {
            priority: JobPriority.high,
            concurrency: 2,
            lockLimit: 10,
            lockLifetime: 10 * 1000
        }, async (job: Job) => {
            let address = job.attrs.data!.address as string
            const skipTokenIds = job.attrs.data!.skipTokenIds as number[]
            address = address.toLowerCase()
            await wrapJob(`syncAddress[${address}] skipCount=${skipTokenIds?.length}`, () => {
                return this.sync.processAddress(address, skipTokenIds, 1000)
            })
        });
        let count = 0;
        agenda.define("syncNFT", {
            priority: JobPriority.high,
            concurrency: 10,
            lockLifetime: 60 * 1000
        }, async (job: Job) => {
            const tokenId = job.attrs.data!.tokenId
            const creatorAddress = job.attrs.data!.creatorAddress
            return wrapJob(`syncNFT[${tokenId}]`, async () => {
                try {
                    ++count;
                    if (count % 10 === 0) {
                        logPendingJobs();
                    }
                    // TSED/AGENDA FUCKS UP IF WE CALL HERE COUNT JESUS FUCKING CHRIST WHAT A HOT MESS
                    // this.logger.info(`syncNFT::start nft=${tokenId}; creatorAddress=${creatorAddress}`)
                    const nft = await this.zk.getNFTFromCreator(creatorAddress, tokenId);
                    // this.logger.info(`SYNC WITH STATUS -- ${nft.id}`)
                    await this.sync.processNft(nft);
                } catch (e) {
                    console.error(e);
                    this.logger.error("ERROR WHILE PROCESSING nft=" + tokenId);
                }
            })
        });
        agenda.define("validateNFTs", {
            priority: JobPriority.normal,
            concurrency: 1,
        }, async (job: Job) => {
            await this.sync.validateMetadatas();
        });
        await (async () => {
            this.app._agenda = agenda;
            await agenda.start();
            if (!isProduction()) {
                console.log("purging...");
                await sleep(2 * 1000);
                // agenda has tendency to locking up jobs, and not finishing them...
                await agenda.purge();
                // agenda has tendency to locking up jobs, and not finishing them...
                const numRemoved = await agenda.cancel({name: "syncNFT"});
                console.log(`Removed stale syncNFT jobs: ${numRemoved}`);
            }

            await agenda.schedule("1 second", "pendingJobsStatus_" + workerId, {});
            await agenda.every("30 seconds", "pendingJobsStatus_" + workerId, {}, {
                skipImmediate: true
            });
            await agenda.schedule("1 second", "systemStatus_" + workerId, {});
            await agenda.every("10 seconds", "systemStatus_" + workerId, {}, {
                skipImmediate: true
            });
        })();
        return [];

    }
}
