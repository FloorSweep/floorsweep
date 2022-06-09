import {computed, makeObservable, observable} from "mobx";
import {FileRejection} from "react-dropzone";
import {errorToast} from "../../components/Toast/Toast";
import AppStore from "../../store/App.store";
import {Http} from "../../services";
import {Transaction} from "zksync";
import {FILE_UPLOAD_KEY} from "../../constants";
import {vars} from "../../environment/vars";
import {Attribute} from "../../interfaces";
import {objectKeys} from "../../helpers/arrays";
import {jsonify} from "../../helpers/strings";
import {Navigable} from "../../services/mixins/navigable";
import {Constructor, EmptyClass} from "../../helpers/mixins";
import {CancelableTokens} from "../../services/mixins/cancel-tokens";
import {TransactionReceipt} from "zksync/build/types";

interface MintFile extends File {
    preview: string
}

export enum MintView {
    Select = "select",
    Edit = "edit",
    Submit = "preview",
    Receipt = "receipt"
}

class MintStore extends CancelableTokens(Navigable<Constructor, MintView>(EmptyClass)) {

    @observable
    file: MintFile | null = null

    @observable
    title = ""

    @observable
    description = ""

    @observable
    receipt?: { tx: Transaction, receipt: TransactionReceipt }

    @observable
    isMetadataUploadLoading = false

    @observable
    isNftUploadLoading = false

    @observable
    _attributeControl: { [key: string]: Attribute } = {}

    acceptedFileTypes = [
        {mime: "image/jpeg", extension: ".jpeg"},
        {mime: "image/png", extension: ".png"}
    ]

    constructor() {
        super()
        this.navigationStack.push(MintView.Select)
        this._cancelable_tokens_construct("MINTSTORE")
        makeObservable(this)
    }

    onDropAccepted(files: File[]) {
        if (files.length > 1) {
            throw Error("Only 1 file is allowed")
        }

        this.file = Object.assign(files[0], {
            preview: URL.createObjectURL(files[0])
        })
        this.currentView = MintView.Edit
    }

    onFileRejected(fileRejections: FileRejection[]) {
        fileRejections.forEach(file => {
            file.errors.forEach(error => {
                errorToast(error.message)
            })
        })
    }

    // TODO: any additional validator here?
    fileValidator(file: File) {
        console.log("debug:: file", file)
        console.log("debug:: type", file.type)
        return null
    }

    @computed
    get hasFile() {
        return !!this.file
    }

    get acceptedMimeTypeString() {
        return this.acceptedFileTypes.map(item => item.mime).join(",")
    }

    get acceptedExtensionString() {
        return this.acceptedFileTypes.map(item => item.extension).join(", ")
    }

    async uploadMetadata() {
        const formData = new FormData()
        formData.append("name", this.title)
        formData.append("description", jsonify(this.description))
        formData.append("attributes", jsonify(this.attributes))
        formData.append(FILE_UPLOAD_KEY, this.file!, this.file!.name)
        const {data} = await Http.authed.post("/nft/metadata", formData, {
            cancelToken: this.generate(`uploadMetadata:${this.title}`),
            signerHumanMessage: "Sign to upload metadata"
        })
        return data
    }

    async uploadNft(contentHash: string) {
        const recipient = await AppStore.auth.wallet!.address()
        const tx = await AppStore.auth.getSignedMintTransaction({
            recipient,
            feeToken: "ETH",
            contentHash,
        })
        const {data} = await Http.authed.post("/nft", {tx}, {
            cancelToken: this.generate(`uploadNft:${tx.ethereumSignature}`),
            signerHumanMessage: "Mint NFT"
        })
        return data
    }

    @computed
    get zkSyncTxLink() {
        const hash = this.receipt?.tx.txHash.split("sync-tx:")[1]
        if (!hash) {

            return hash
        } else {
            return `${vars.BASE_ZK_EXPLORER_URL}/transactions/${hash}`
        }
    }

    @computed
    get isLoading() {
        return this.isNftUploadLoading || this.isMetadataUploadLoading
    }

    @computed
    get emptyAttributeControlKeys() {
        return objectKeys(this._attributeControl).filter(key => {
            if (this._attributeControl[key].trait_type === "" || this._attributeControl[key].value === "") {
                return true
            }
            return false
        })
    }

    @computed
    get attributeControlCount() {
        return objectKeys(this._attributeControl).length
    }

    @computed
    get attributes() {
        const validControlKeys = objectKeys(this._attributeControl).filter(key => {
            if (this.emptyAttributeControlKeys.includes(key)) {
                return false
            }
            return true
        })

        const attr = validControlKeys.map(key => ({
            trait_type: this._attributeControl[key].trait_type,
            value: this._attributeControl[key].value
        }))
        return attr
    }

    @computed
    get isAddNewAttributeDisabled() {
        if (this.attributeControlCount === 0) {
            return false
        }
        return this.emptyAttributeControlKeys.length > 0
    }

    goBack() {
        if (this.currentView === MintView.Edit) {
            this._attributeControl = {}
            this.title = ""
            this.description = ""
        }
        super.goBack()
    }

    async mintNft() {
        try {
            this.isMetadataUploadLoading = true
            const {contentHash} = await this.uploadMetadata()
            this.isMetadataUploadLoading = false

            this.isNftUploadLoading = true
            this.receipt = await this.uploadNft(contentHash)
            this.isNftUploadLoading = false

            this.currentView = MintView.Receipt
        } finally {
            this.isMetadataUploadLoading = false
            this.isNftUploadLoading = false
        }
    }

    async onEditSubmit() {
        return this.currentView = MintView.Submit
    }

    async onSelectSubmit() {
        return this.currentView = MintView.Edit
    }
}


export default MintStore
