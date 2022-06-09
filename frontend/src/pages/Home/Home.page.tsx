import React, {useEffect, useMemo} from "react";
import {observer} from "mobx-react";
import {css} from "../../helpers/css";
import PaginableNfts from "../../components/PaginableNfts/PaginableNfts";
import useScrollToTop from "../../hooks/useScrollToTop";
import HomeStore from "./Home.store";


interface HomePageProps {
}

const HomePage = observer((props: HomePageProps) => {
    useScrollToTop()
    const store = useMemo(() => new HomeStore(), [])
    useEffect(() => {
        store.init()
        // eslint-disable-next-line
    }, [])

    return <div className={css("flex", "min-w-0", "flex-grow")}>
        <div className={css("w-full")}>
            <PaginableNfts
                isLoading={store.isLoading}
                next={() => store.next()}
                dataLength={store.dataLength}
                hasMore={store.hasMore}
                nfts={store.data}
            />
        </div>
    </div>
})

export default HomePage
