import {css} from "../../helpers/css";
import Link from "../../components/Link/Link";

const NotFound = () => {
    return <div className={css("w-full", "flex-grow", "flex", "justify-center", "items-center", "text-neutral-400")}>
        <div className={css("text-center")}>
            <div>not found</div>
            <Link href={"/"}>go home</Link>
        </div>
    </div>
}

export default NotFound