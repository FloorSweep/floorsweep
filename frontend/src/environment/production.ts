const productionEnv = {
    name: "production",
    api: {
        baseURL: "https://api.nft.zigzag.exchange/",
        // proxyURL: null
    },
    app: {
        name: "floorsweep"
    },
    sentry: {
        dsn: "https://a401cf0038f848a6bd3e58687cdeb780@o1236049.ingest.sentry.io/6386127"
    },
    network: {
        id: 1,
        name: "mainnet",
        infuraId: "9a72307b24d04c8294a3bf86fed46cfc",
        explorerUrl: "https://zkscan.io/explorer"
    }
};
export default productionEnv;
