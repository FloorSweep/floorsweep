import * as RadixDialog from '@radix-ui/react-dialog';
import {css} from "../../helpers/css";
import React, {PropsWithChildren} from "react";
import Icon from "../Icon/Icon";

export interface ModalProps {
    isOpen?: boolean;
    title?: string;
    description?: string;
    onChange?: (value: boolean) => void;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
                                                            children,
                                                            isOpen,
                                                            title,
                                                            description,
                                                            onChange
                                                        }) => {
    return <RadixDialog.Root open={isOpen} onOpenChange={(value) => onChange && onChange(value)}>
        <RadixDialog.Portal>
            <RadixDialog.Overlay className={css("fixed", "bg-black", "inset-0", "opacity-80", "z-20")}/>
            <RadixDialog.Content
                style={{transform: "translate(-50%, -50%)", maxWidth: '450px'}}
                className={css("bg-neutral-900", "rounded-sm", "top-1/2", "left-1/2", "fixed", "w-full", "md:w-9/12", "p-10", "text-white", "font-mono", "z-20", "rounded-sm")}>

                {onChange && <RadixDialog.Close style={{right: "5px", top: "5px"}}
                                                className={css("absolute", "text-neutral-400", "hover-hover:hover:text-white")}>
                  <Icon icon={'close'} size={"25px"}/>
                </RadixDialog.Close>}
                <div className={css("mb-12")}>
                    <RadixDialog.Title
                        className={css("text-white", "font-mono", "text-2xl", "font-bold", "text-center", "mb-3")}>
                        {title}
                    </RadixDialog.Title>
                    <RadixDialog.Description>{description}</RadixDialog.Description>
                </div>
                {children}
            </RadixDialog.Content>
        </RadixDialog.Portal>
    </RadixDialog.Root>
}

export default Modal
