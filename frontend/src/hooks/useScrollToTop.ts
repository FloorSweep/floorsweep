import {useEffect, useLayoutEffect} from "react";

const useScrollToTop = () => {
    return useLayoutEffect(() => {
        const windowHeight= window.innerHeight || (document.documentElement || document.body).clientHeight
        const documentHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        )
        const scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
        const trackLength = documentHeight - windowHeight
        const pctScrolled = Math.floor(scrollTop/trackLength * 100)
        if (pctScrolled >= 10) {
            setTimeout(() => {
                window.scrollTo({top: 0, behavior: "smooth"})
            })
        }
    }, [])
}

export default useScrollToTop