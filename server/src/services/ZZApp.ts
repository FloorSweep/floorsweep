import {Inject, Injectable, OnInit} from "@tsed/di";
import {PlatformApplication} from "@tsed/common";
import {AgendaService} from "@tsed/agenda";
import {Logger} from "@tsed/logger";
import {Agenda} from "agenda";
import {AGENDA_JOB_SYNC_ADDRESS} from "../constants";

@Injectable()
export class ZZApp extends PlatformApplication implements OnInit {

    @Inject()
    private logger: Logger;

    @Inject()
    private agenda: AgendaService;

    public _agenda: Agenda;

    getNetworkName() {
        if (process.env.APP_ENV === 'localhost') {
            return 'rinkeby'
        }
        if (process.env.APP_ENV === 'staging') {
            return 'rinkeby'
        }
        if (process.env.APP_ENV === 'test') {
            return 'rinkeby'
        }
        if (process.env.APP_ENV === 'production') {
            return 'mainnet'
        }
        throw new Error("INVALID NETWORK");
    }

    async $onInit() {
        // >MAYBE< create agenda instance
        if (!this._agenda) {

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
                }
            });
            this._agenda = agenda;
            await agenda.start();
        }
    }

    async maybeResyncAddress(data: { address: string, skipTokenIds?: number[] } | string, delay = "1 second", allowCount = 0, priority: string | number = "normal") {
        if (typeof data === "string") {
            data = {
                address: data,
                skipTokenIds: []
            }
        }
        const jobData: any = {
            address: data.address.toLowerCase()
        };
        if (!data.skipTokenIds || data.skipTokenIds.length === 0) {
            // length=0 means we want to do FULL resync of address, and it's not part of ongoing batch schedule
            // explanation: address sync job is batched bc if user has a lot of nfts, it can block agenda. same `maybeResyncAddress` is used for
            // scheduling first initial trigger, and ongoing batches. If we need to trigger FULL resync,
            jobData.skipTokenIds = []
        }
        return this.maybeScheduleJob(AGENDA_JOB_SYNC_ADDRESS, jobData, {
            skipTokenIds: data.skipTokenIds ?? []
        }, delay, allowCount, priority);
    }

    async maybeResyncNFT(nft: { id: number, creatorAddress: string }, delay = "1 second", allowCount = 0, priority: string | number = "normal") {
        const tokenId = nft.id,
            creatorAddress = nft.creatorAddress.toLowerCase();
        // We schedule both tokenId and creator to be able to use `getNFTFromCreator` to be able to process also not yet verified NFTs
        return this.maybeScheduleJob("syncNFT", {
            tokenId,
            creatorAddress
        }, {}, delay, allowCount, priority);
    }

    /**
     * jobData: data upon which count query is run
     * extraData: data to which also include in schedule call
     */
    private async maybeScheduleJob(jobName: string, jobData: object, extraData: object = {}, delay = "1 second", allowCount = 0, priority: string | number = "normal") {
        // this.logger.info(`trying to schedule ${jobName} ${JSON.stringify(jobData)}`)
        const count = await this.countSyncJobs(jobName, {
            data: jobData
        })
        if (count > allowCount) {
            this.logger.info(`[SKIP] skip ${jobName} job scheduling; ${JSON.stringify(jobData)}, found ${count} existing jobs...`)
            return false;
        }
        jobData = {
            ...jobData,
            ...extraData
        }
        this.logger.info(`[NEW JOB] scheduled new ${jobName} job; ${JSON.stringify(jobData)}; priority = ${priority}`);
        const job = await this._agenda.create(jobName, jobData)
        // types definition allow only string. If you pass number as string it defaults to 'normal'(check agenda/dist/parse-priority.js)
        // so we need to override the types and pass number as typeof number
        job.priority(priority as any);
        job.schedule(delay)
        await job.save();
        return true
    }


    async countSyncJobs(name: string, extraQuery: object = {}) {
        const query: any = {
            name,
            //query only unfinished/scheduled jobs
            lastFinishedAt: null,
            ...extraQuery
        };
        const jobs = await this._agenda.jobs(
            query,
            {data: -1}
        );
        return jobs.length;
    }
}
