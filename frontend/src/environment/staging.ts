const stagingEnv = {
    name: "staging",
    api: {
        baseURL: "https://rinkeby.api.nft.zigzag.exchange/",
        // proxyURL: null
    },
    app: {
        name: "zznft"
    },
    sentry: {
        dsn: "https://62621aa72dec4ea7ac40830377136778@o1236049.ingest.sentry.io/6410521"
    },
    network: {
        id: 4,
        name: "rinkeby",
        infuraId: "9a72307b24d04c8294a3bf86fed46cfc",
        explorerUrl: "https://rinkeby.zkscan.io/explorer"
    }
};
export default stagingEnv;
