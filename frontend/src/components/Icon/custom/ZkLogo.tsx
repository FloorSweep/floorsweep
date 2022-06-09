import {CustomIconProps} from "../Icon";

const ZkLogo: React.FC<CustomIconProps> = ({size = "1em", className}) => {
    return <>
        <svg height={size} width={size} className={className} id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 485.28 275.08">
            <path fill={"currentColor"}
                  d="M485.28,137.57L347.62,.05V100.76l-136.68,100.83,136.68,.1v73.39l137.66-137.52Z"/>
            <path fill={"currentColor"} d="M0,137.52l137.66,137.52v-99.65l135.68-100.9-135.68-.09V0L0,137.52Z"/>
        </svg>
    </>
}

export default ZkLogo
