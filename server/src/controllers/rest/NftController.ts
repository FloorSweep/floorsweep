import {AgendaService} from "@tsed/agenda";
import {Controller, Inject, OnInit} from "@tsed/di";
import {Get, Post} from "@tsed/schema";
import {AccountsRepository, NftModel} from "../../../prisma/generated/tsed";
import {MulterOptions, MultipartFile, PlatformContext, QueryParams, UseCache} from "@tsed/common";
import {FILE_UPLOAD_KEY, fileFilter} from "../../config/multer";
import {BodyParams, Context, PathParams} from "@tsed/platform-params";
import {ZkSyncService} from "../../services/ZkSyncService";
import {CreateMetadataParams, MetadataAttribute} from "../../interfaces/AccountController.interfaces";
import {Logger} from "@tsed/cli-core";
import {UseAuth} from "@tsed/platform-middlewares";
import {AuthMiddleware} from "../../middlewares/auth/AuthMiddleware";
import {Account} from "../../../prisma/generated/prisma";
import {CURRENT_ACCOUNT_CONTEXT_KEY} from "../../middlewares/auth/constants";
import {IpfsService} from "../../services/IpfsService";
import {NftsRepository} from "../../services/NftsRepository";
import {BadRequest} from "@tsed/exceptions";
import {ZZApp} from "../../services/ZZApp";
import {MaybeAuthMiddleware} from "../../middlewares/auth/MaybeAuthMiddleware";
import {SignedTransaction} from "zksync/build/types";
import {UseJoiSchema} from "../../decorators/UseJoiSchema";
import {GetNftsQueryParameters} from "../../interfaces/generated";
import {GetNftsQueryParametersSchema} from "../../schemas/NftsSchema";

@Controller("/nft")
export class NftController implements OnInit {
    @Inject()
    private nfts: NftsRepository;

    @Inject()
    private agenda: AgendaService;

    @Inject()
    private ipfs: IpfsService

    @Inject()
    private zk: ZkSyncService

    @Inject()
    private accounts: AccountsRepository

    @Inject()
    private app: ZZApp

    @Inject()
    logger: Logger

    async $onInit() {
        console.log("Nft Controller init");
    }

    @Get("/")
    @UseAuth(MaybeAuthMiddleware)
    async index(
        @QueryParams()
        @UseJoiSchema(GetNftsQueryParametersSchema) queryParams: GetNftsQueryParameters,
        @Context(CURRENT_ACCOUNT_CONTEXT_KEY) account: Account | null
    ) {
        // TODO: add new param here for filtering for order
        if (queryParams.name) {
            //@ts-ignore
            queryParams.name = {
                contains: queryParams.name,
                mode: 'insensitive'
            }
        }
        if (queryParams.creatorAddress) {
            queryParams.creatorAddress = this.zk.getChecksumAddress(queryParams.creatorAddress)
        }
        if (queryParams.ownerAddress) {
            queryParams.ownerAddress = this.zk.getChecksumAddress(queryParams.ownerAddress)
        }

        const result = await this.nfts.cursorPaginate({isVisible: true, ...queryParams})
        // Need to stringify/reparse, bc otherwise the non-standard fields are not included by TSED <-- imageUrl is missing
        return JSON.parse(JSON.stringify(result, null, 2));
    }

    @Post("/")
    @UseAuth(AuthMiddleware)
    async create(
        @BodyParams() {tx}: { tx: SignedTransaction },
        @Context(CURRENT_ACCOUNT_CONTEXT_KEY) account: Account
    ) {
        return await this.nfts.mintNFT(tx);
    }

    @Post("/metadata")
    @MulterOptions({fileFilter})
    @UseAuth(AuthMiddleware)
    async createMetadata(
        @MultipartFile(FILE_UPLOAD_KEY) file: Express.Multer.File,
        @BodyParams() params: CreateMetadataParams,
        @Context(CURRENT_ACCOUNT_CONTEXT_KEY) account: Account
    ) {
        const attributes = JSON.parse(params.attributes) as MetadataAttribute[]
        params.description = JSON.parse(params.description)
        if (!Array.isArray(attributes)) {
            throw new BadRequest("Attributes must be an array")
        }
        if (params.name.trim().length === 0) {
            throw new BadRequest("Name is required")
        }
        for (let i = 0; i < attributes.length; ++i) {
            const attr = attributes[i];
            if (!attr.trait_type || attr.trait_type.trim().length === 0) {
                throw new Error("Trait type is required");
            }
            if (!attr.value || attr.value.trim().length === 0) {
                throw new Error("Value is required");
            }
        }
        // if (params.description.trim().length === 0) {
        //     throw new BadRequest("Description is required")
        // }

        //TODO: enforce mime types`
        //TODO: CHECK IF WE ALREADY HAVE THIS IMAGE CID AND REJECT IF WE HAVE
        this.logger.info(account.address + " uploading image");
        const assetCID = await this.nfts.uploadNftImage(account, file);
        this.logger.info(account.address + " uploading metadata");

        const data = await this.nfts.uploadMetadata(assetCID, params.name, params.description, attributes);
        return {
            ...data,
            assetCID,
        }
    }

    @Get("/:tokenId/history")
    @UseCache({
        key: (args: any[], $ctx?: PlatformContext) => {
            return `token-history-${args[0]}-endpoint`
        },
        ttl: 10
    })
    async getTokenHistory(@PathParams("tokenId") tokenId: number) {
        return this.nfts.getHistory(tokenId);
    }

    @Get("/:tokenId")
    async getTokenById(@PathParams("tokenId") tokenId: number) {
        const nft = await this.nfts.getByTokenId(tokenId)
        return JSON.parse(JSON.stringify(nft, null, 2));
    }
}
