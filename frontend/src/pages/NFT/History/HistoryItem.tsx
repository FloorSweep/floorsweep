import React from "react";
import {css} from "../../../helpers/css";
import {vars} from "../../../environment/vars";
import useDisplayName from "../../../hooks/useDisplayName";
import Link from "../../../components/Link/Link";
import Icon from "../../../components/Icon/Icon";
import {observer} from "mobx-react";
import {NftHistoryItem} from "./History.store";

interface HistoryItemProps {
    item: NftHistoryItem
}

const HistoryItem: React.FC<HistoryItemProps> = observer(({item}) => {
    const {displayName: fromName} = useDisplayName(item.from)
    const {displayName: toName} = useDisplayName(item.to)
    return <div className={css("flex", "flex-col", "my-2", "p-2", "space-y-3", "sm:space-y-0")}>
        <div
            className={css("flex", "items-center", "sm:justify-between", "justify-center", "flex-wrap", "space-y-4", "xs:space-y-0")}
            style={{overflowWrap: "anywhere"}}
        >
            <div className={css("items-center", "xs:items-start", "sm:items-center", "flex-grow", "flex-col", "sm:flex-row", "flex", "space-x-0", "sm:space-x-3")}>
                {item.type !== "MintNFT" && <div className={css("font-bold")}>
                  <Link href={`/profile/${item.from}`}>{fromName}</Link>
                </div>}
                <div className={css("text-base")}>
                    {item.actionLabel}
                </div>
                <div className={css("font-bold")}>
                    <Link href={`/profile/${item.to}`}>{toName}</Link>
                </div>
            </div>
            {item.price && <div>
              <div>{item.price.amount} {item.price.currency}</div>
            </div>}
        </div>
        {item.createdAt && <div className={css("flex", "items-center", "space-x-3")}>
          <div>
            <Icon icon={item.icon.icon} className={item.icon.className}/>
          </div>
          <div className={css("text-base", "text-neutral-400", "text-center")}>{item.createdAt}</div>
          <Link isExternal
                title={"Open on zkscan.io"}
                href={vars.BASE_ZK_EXPLORER_URL + `/transactions/${item.txId}`}
                isExternalIconVisible={false}>
            <Icon icon={'zksync'} className={css("text-neutral-600")} size={20}/>
          </Link>
        </div>}
    </div>
})

export default HistoryItem
