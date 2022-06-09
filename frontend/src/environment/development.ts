const developmentEnv = {
    name: "development",
    app: {
        name: "zznft"
    },
    api: {
        baseURL: "https://rinkeby.api.nft.zigzag.exchange/",
        // proxyURL: "http://localhost:8083/"
    },
    sentry: {
        dsn: null
    },
    network: {
        id: 4,
        name: "rinkeby",
        infuraId: "9a72307b24d04c8294a3bf86fed46cfc",
        explorerUrl: "https://rinkeby.zkscan.io/explorer"
    }
};
export default developmentEnv;
