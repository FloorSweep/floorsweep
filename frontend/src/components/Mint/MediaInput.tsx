import React, {useCallback} from "react"
import MintStore from "../../pages/Mint/Mint.store";
import {observer} from "mobx-react";
import {useDropzone} from "react-dropzone";
import {css} from "../../helpers/css";

interface MediaInputProps {
    isInput?: boolean;
    store: MintStore
}

const MediaInput = observer(({isInput = false, store}: MediaInputProps) => {
    // eslint-disable-next-line
    const onDropRejected = useCallback((rejections: any) => store.onFileRejected(rejections), [])
    // eslint-disable-next-line
    const onDropAccepted = useCallback((files: any) => store.onDropAccepted(files), [])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDropAccepted,
        onDropRejected,
        disabled: !isInput,
        validator: store.fileValidator.bind(store),
        accept: store.acceptedMimeTypeString,
        maxFiles: 1
    })

    return <div
        {...getRootProps()}
        style={{height: "400px", width: "400px"}}
        className={css("border-2", "border-dashed",
            "border-neutral-600", "flex", "relative",
            "justify-center", "items-center", "overflow-hidden", "rounded-sm",
            {
                "cursor-pointer": isInput,
                "cursor-default": !isInput
            })}>
        {store.hasFile && <img alt={store.file?.name} src={store.file?.preview}/>}
        {!store.hasFile && <>
            {isDragActive ? <div>What a beauty</div> : <div>Drop your 🖼 here</div>}
        </>}
        {isInput && <input {...getInputProps()}/>}
    </div>
})

export default MediaInput
