const isDev = () => {
    return process.env.NODE_ENV === "development" && process.env.REACT_APP_ZZ_ENV !== "aws_production";
};
const isLocalhost = () => {
    return process.env.NODE_ENV === "development" && process.env.REACT_APP_ZZ_ENV !== "aws_production";
};

const isProduction = () => {
    return process.env.REACT_APP_ZZ_ENV === "aws_production";
};
const isStaging = () => {
    return process.env.REACT_APP_ZZ_ENV === "aws_develop";
};
export {
    isDev,
    isLocalhost,
    isStaging,
    isProduction
}



