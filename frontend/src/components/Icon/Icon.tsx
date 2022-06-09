import React from "react";
import {BsArrowUpRight, BsGlobe2} from "react-icons/bs";
import {IconBaseProps} from "react-icons/lib/cjs/iconBase";
import {FaEthereum, FaRegHandshake} from "react-icons/fa";
import {IconType} from "react-icons";
import {GoLinkExternal} from "react-icons/go";
import {MdOutlineError} from "react-icons/md";
import {MdClose} from "react-icons/md";
import {BiChevronDown} from "react-icons/bi";
import {BiGridAlt, FiCheck, ImStack, RiMenuLine, RiQuestionMark, WiDirectionUpRight} from "react-icons/all";
import ZkLogo from "./custom/ZkLogo";

export type IconName = 'globe'
    | 'ethereum'
    | 'external-link'
    | 'error'
    | 'close'
    | 'chevron-down'
    | 'grid'
    | 'list'
    | 'zksync'
    | 'check'
    | 'stack'
    | 'question'



const nameToIconMap: {[key in IconName]: IconType} = {
    globe: BsGlobe2,
    //@ts-ignore
    ethereum: FaEthereum,
    ['external-link']: BsArrowUpRight,
    error: MdOutlineError,
    close: MdClose,
    ['chevron-down']: BiChevronDown,
    grid: BiGridAlt,
    list: RiMenuLine,
    //@ts-ignore
    zksync: ZkLogo,
    check: FiCheck,
    handshake: FaRegHandshake,
    stack: ImStack,
    question: RiQuestionMark
}

interface IconProps extends Pick<IconBaseProps, 'size' | 'title'> {
    icon: IconName;
    className?: string
}

export interface CustomIconProps extends Pick<IconProps, 'size' | 'title' | 'className'> {}

const Icon: React.FC<IconProps> = ({icon, ...rest}) => {
    const Component = nameToIconMap[icon] as any
    return <>
        <Component {...rest}/>
    </>
}

export default Icon