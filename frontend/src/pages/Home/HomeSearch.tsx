import React, {useEffect, useMemo, useRef} from "react";
import {css} from "../../helpers/css";
import Spinner from "../../components/Spinner/Spinner";
import Link from "../../components/Link/Link";
import {observer} from "mobx-react";
import TextField from "../../components/TextField/TextField";
import HomeSearchStore from "./HomeSearch.store";
import AsyncWrap from "../../components/AsyncWrap/AsyncWrap";
import {useLocation} from "react-router-dom";

interface HomeSearchTypeAheadProps {
}

const HomeSearch = observer((props: HomeSearchTypeAheadProps) => {
  const store = useMemo(() => new HomeSearchStore(), [])
  const location = useLocation()

  useEffect(() => {
    store.reset()
  }, [location.pathname])

  useEffect(() => {
    store.init()
    return () => {
      store.destroy()
    }
    // eslint-disable-next-line
  }, [])

  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        if (store.isTypeAheadVisible) {
          store.isTypeAheadVisible = false
        }
      }
    };
    const clickOutsideIfEscape = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        store.isTypeAheadVisible = false
      }
    }
    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('keydown', clickOutsideIfEscape, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('keydown', clickOutsideIfEscape, true)
    };
  // eslint-disable-next-line
  }, [ref]);
  return <div className={css("relative", "z-10")}>
    <TextField
      block
      placeholder={"Search..."}
      value={store.searchValue}
      onChange={(value) => {
        store.searchValue = value
      }}
    />
    <div ref={ref} className={css("bg-neutral-800", "absolute", "w-full", "mt-2", "p-2", "rounded-sm", {"hidden": !store.isTypeAheadVisible})}>
      <AsyncWrap
          isLoading={store.isLoading}
          hasData={!store.isSearchResultsEmpty}
          noDataMessage={"None found"}
      >
        <div className={css("overflow-x-hidden", "flex", "flex-col", "gap-3")}>
          {store.metadataNameResults.length !== 0 && <div>
            <div className={css("text-neutral-400", "text-sm")}>
              NFTs
            </div>
            {store.metadataNameResults.map(nft => <div key={nft.id} className={css("flex", "items-center", "justify-between")}>
              <Link href={`/nft/${nft.id}`}>
                {nft.name}
              </Link>
              <div className={css("text-base", "text-neutral-400")}>
                (#{nft.id})
              </div>
            </div>)}
          </div>}

          {store.ensFilterResults.length !== 0 && <div>
            <div className={css("text-neutral-400", "text-sm")}>
              ENS
            </div>
            {store.ensFilterResults.map(domain => <div key={domain.address}>
              <Link href={`/profile/${domain.address}`}>{domain.name}</Link>
            </div>)}
          </div>}
        </div>
      </AsyncWrap>
    </div>
  </div>
})

export default HomeSearch
